import { useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../services/api';
import { Message, Conversation } from '../types';

type SetMessagesAction = React.Dispatch<React.SetStateAction<Message[]>>;
type SetConversationsAction = React.Dispatch<React.SetStateAction<Conversation[]>>;
type SetBooleanAction = React.Dispatch<React.SetStateAction<boolean>>;
type SetStringOrNullAction = React.Dispatch<React.SetStateAction<string | null>>;
type NavigateFn = (path: string) => void;

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
  setConversations: SetConversationsAction;
  tempConversationId: string | null;
  setTempConversationId: SetStringOrNullAction;
  setIsLoading: SetBooleanAction;
  setMessages: SetMessagesAction;
  navigate: NavigateFn;
}) => {
  const assistantMessageIdRef = useRef<string | null>(null);
  const realConversationIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const sendMessage = useCallback((query: string) => {
    if (!query.trim() || !accessToken) return;
    setIsLoading(true);

    // Optimistic user + assistant message placeholders
    const userMessage: Message = { id: uuidv4(), sender: "user", content: query, partial: "", isStreaming: false };
    const assistantMessage: Message = { id: uuidv4(), sender: "assistant", content: "", partial: "", isStreaming: true };
    assistantMessageIdRef.current = assistantMessage.id;
    setMessages(prev => [...prev, userMessage, assistantMessage]);

    if (conversationId?.startsWith("temp-")) {
      setConversations(prev => {
        if (!prev.some(c => c.id === conversationId)) {
          return [
            { id: conversationId, title: "New Conversation", updated_at: new Date().toISOString(), isStreamingTitle: true },
            ...prev
          ];
        }
        return prev;
      });
    }

    const finalizeAssistantMessage = () => {
      if (!isMountedRef.current) return;

      setMessages(prev => prev.map(msg =>
        msg.partial
          ? { ...msg, content: (msg.content ?? "") + (msg.partial ?? "").trim(), partial: "", isStreaming: false }
          : msg
      ));
      setIsLoading(false);

      if (realConversationIdRef.current) {
        setTimeout(() => navigate(`/chat/${realConversationIdRef.current}`), 100);
      }
    };

    api.streamQuery(
      query,
      accessToken,
      conversationId,
      "documents",
      (chunk) => {
        if (!isMountedRef.current) return;

        // Handle conversation metadata (temp -> real ID transition)
        if (chunk?.event === "conversation_metadata" && chunk.conversation_id) {
          realConversationIdRef.current = chunk.conversation_id;
          setConversations(prev => prev.map(conv =>
            conv.id === conversationId
              ? { ...conv, id: chunk.conversation_id, title: chunk.title, updated_at: chunk.updated_at }
              : conv
          ));
          setTempConversationId(null);
        }

        // Handle conversation title update
        if (chunk?.event === "conversation_title_update" && chunk.title) {
          setConversations(prev => prev.map(conv =>
            conv.id === chunk.conversation_id
              ? { ...conv, title: chunk.title, isStreamingTitle: false }
              : conv
          ));
        }

        // Handle message_start event (update message ID from backend)
        if (chunk?.event === "message_start" && chunk.message_id) {
          assistantMessageIdRef.current = chunk.message_id;
          return;
        }

        // Handle streaming delta content
        const delta = chunk?.choices?.[0]?.delta?.content ?? "";
        const finishReason = chunk?.choices?.[0]?.finish_reason ?? null;
        if (delta) {
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, partial: (msg.partial ?? "") + delta }
              : msg
          ));
        }

        if (finishReason === "stop") {
          requestAnimationFrame(finalizeAssistantMessage);
        }
      },
      () => requestAnimationFrame(finalizeAssistantMessage)
    ).catch(err => {
      if (!isMountedRef.current) return;

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
    setConversations,
    setTempConversationId,
    setIsLoading,
    setMessages,
    navigate,
  ]);

  return { sendMessage };
};