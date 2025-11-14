import { useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';


export const useChatStreaming = ({
  accessToken,
  conversationId,
  setConversations,
  tempConversationId,
  setTempConversationId,
  setIsLoading,
  setMessages,
  navigate,
}: {
  accessToken: string;
  conversationId: string | null;
  setConversations: Function;
  tempConversationId: string | null;
  setTempConversationId: Function;
  setIsLoading: Function;
  setMessages: Function;
  navigate: Function;
}) => {
  const assistantMessageIdRef = useRef<string | null>(null);
  const realConversationIdRef = useRef<string | null>(null);

  const sendMessage = useCallback((query: string) => {
    if (!query.trim() || !accessToken) return;
    setIsLoading(true);

    // Optimistic user + assistant message placeholders
    const userMessage = { id: uuidv4(), sender: "user", content: query, partial: "", isStreaming: false };
    const assistantMessage = { id: uuidv4(), sender: "assistant", content: "", partial: "", isStreaming: true };
    assistantMessageIdRef.current = assistantMessage.id;
    setMessages(prev => [...prev, userMessage, assistantMessage]);

    const finalizeAssistantMessage = () => {
      console.log("[useChatStreaming.finalizeAssistantMessage] Finalizing...");
      setMessages(prev => prev.map(msg =>
        msg.partial
          ? { ...msg, content: (msg.content ?? "") + (msg.partial ?? "").trim(), partial: "", isStreaming: false }
          : msg
      ));
      setIsLoading(false);

      if (realConversationIdRef.current) {
        console.log("[useChatStreaming] Navigating to real conversation:", realConversationIdRef.current);
        setTimeout(() => navigate(`/chat/${realConversationIdRef.current}`), 100);
      }
    };

    api.streamQuery(
      query,
      accessToken,
      conversationId,
      "cmc_docs",
      (chunk) => {
        // === Handle Stream events ===
        console.log("[useChatStreaming.api.streamQuery] Current activeConversationId:", conversationId);
        // --- Handle conversation metadata chunk ---
        if (chunk?.conversation_id) {
          realConversationIdRef.current = chunk.conversation_id;
          setConversations(prev => prev.map(conv =>
            conv.id === tempConversationId
              ? { ...conv, id: chunk.conversation_id, title: chunk.title, updated_at: chunk.updated_at }
              : conv
          ));
        }

        // --- Handle message_start event ---
        if (chunk?.event === "message_start" && chunk.message_id) {
          assistantMessageIdRef.current = chunk.message_id;
          return;
        }

        // --- Handle streaming delta content ---
        const delta = chunk?.choices?.[0]?.delta?.content ?? "";
        const finishReason = chunk?.choices?.[0]?.finish_reason ?? null;
        if (delta) {
          setMessages(prev => {
            const updated = prev.map(msg =>
              msg.id === assistantMessage.id
                ? { ...msg, partial: (msg.partial ?? "") + delta }
                : msg
            );
            console.log("[DEBUG][useChatStreaming] Updated messages state:", updated);
            return updated;
          });
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
          msg.id === assistantMessage.id
            ? { ...msg, content: "Sorry, something went wrong.", partial: "", isStreaming: false }
            : msg
        )
      );
      setIsLoading(false);
    });
  },
  [
    accessToken,
    conversationId,
  ]);

  return { sendMessage };
};