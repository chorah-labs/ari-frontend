import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';


export const useChatStreaming = ({
  accessToken,
  conversationId,
  tempConversationId,
  setTempConversationId,
  setConversations,
  setPendingNavigationId,
  setIsLoading,
  setMessages,
  navigate,
}: {
  accessToken: string;
  conversationId: string | null;
  tempConversationId: string | null;
  setTempConversationId: Function;
  setConversations: Function;
  setPendingNavigationId: Function;
  setIsLoading: Function;
  setMessages: Function;
  navigate: Function;
}) => {
  const assistantMessageIdRef = useRef<string | null>(null);
  const sendMessage = useCallback((query: string, tempId?: string) => {
    if (!query.trim() || !accessToken) return;
    setIsLoading(true);

    // Optimistic user + assistant message placeholders
    const userMessage = { id: uuidv4(), sender: "user", content: query, partial: "", isStreaming: false };
    const assistantMessage = { id: uuidv4(), sender: "assistant", content: "", partial: "", isStreaming: true };
    assistantMessageIdRef.current = assistantMessage.id;
    setMessages(prev => [...prev, userMessage, assistantMessage]);

    const finalizeAssistantMessage = () => {
      console.log("[useChatStreaming.finalizeAssistantMessage] Finalizing...");
      const currentId = assistantMessageIdRef.current;
      setMessages(prev => prev.map(msg =>
        msg.partial
          ? { ...msg, content: (msg.content ?? "") + (msg.partial ?? "").trim(), partial: "", isStreaming: false }
          : msg
      ));
      setIsLoading(false);

      if (setPendingNavigationId) {
        requestAnimationFrame(() => {
          const navId = setPendingNavigationId(null);
          if (navId) navigate(`/chat/$(navId)`);
        });
      }
    };

    api.streamQuery(
      query,
      accessToken,
      conversationId && !conversationId.startsWith("temp-") ? conversationId : tempId ?? null,
      "cmc_docs",
      (chunk) => {
        // === Handle Stream events ===

        // --- Handle conversation metadata chunk ---
        if (chunk?.conversation_id && tempConversationId) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === tempConversationId
                ? { id: chunk.conversation_id, title: chunk.title, updated_at: chunk.updated_at }
                : conv
            )
          );
          setTempConversationId(null);
          setPendingNavigationId(chunk.conversation_id);
          return;
        }

        // --- Handle message_start event ---
        if (chunk?.event === "message_start" && chunk.message_id) {
          const realId = chunk.message_id;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageIdRef.current
                ? { ...msg, id: realId }
                : msg
            )
          );
          assistantMessageIdRef.current = realId;
          return;
        }

        // --- Handle streaming delta content ---
        const delta = chunk?.choices?.[0]?.delta?.content ?? "";
        const finishReason = chunk?.choices?.[0]?.finish_reason ?? null;
        if (delta) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageIdRef.current
                ? { ...msg, partial: (msg.partial ?? "") + delta }
                : msg
            )
          );
        }

        if (finishReason === "stop") {
          console.log("Received 'finish_reason=stop' - finalizing after render");
          requestAnimationFrame(finalizeAssistantMessage)
        };
      },
      () => requestAnimationFrame(finalizeAssistantMessage)
    ).catch(err => {
      console.error("Stream failed:", err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageIdRef.current
            ? { ...msg, content: "Sorry, something went wrong.", partial: "", isStreaming: false }
            : msg
        )
      );
      setIsLoading(false);
    });
  }, [accessToken, conversationId]);

  return { sendMessage };
};