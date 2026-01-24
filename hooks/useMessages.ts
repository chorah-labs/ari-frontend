import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { api } from '../services/api';

export const useMessages = (conversationId: string | null, accessToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken || !conversationId) return;

    // Preserve messages if we're switching from temp to real conversation
    if (prevIdRef.current?.startsWith("temp-") && !conversationId.startsWith("temp-")) {
      prevIdRef.current = conversationId;
      return;
    }

    if (conversationId.startsWith("temp-")) {
      setMessages([]);
      prevIdRef.current = conversationId;
      return;
    }

    setIsLoadingMessages(true);
    setMessagesError(null);
    api
      .getConversationMessages(conversationId, accessToken)
      .then((data: Message[]) => {
        const normalized = data.map(msg => ({
          ...msg,
          id: msg.id?.toString() ?? uuidv4(),
          content: msg.content ?? '',
          partial: '',
          isStreaming: false,
        })).reverse();
        setMessages(normalized);
      })
      .catch(error => {
        console.error("Failed to fetch messages:", error);
        setMessagesError("Failed to load messages");
      })
      .finally(() => setIsLoadingMessages(false));

    prevIdRef.current = conversationId;

  }, [conversationId, accessToken]);

  return { messages, setMessages, messagesError, isLoadingMessages };
};