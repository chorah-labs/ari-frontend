import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { api } from '../services/api';

export const useMessages = (conversationId: string | null, accessToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const prevIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken || !conversationId) return;

    // Preserve messages if we're switching from temp to real conversation
    if (prevIdRef.current?.startsWith("temp-") && !conversationId.startsWith("temp-")) {
      prevIdRef.current = conversationId;
      console.log("[useMessages] Switched from temp to real conversation, prevIdRef is now:", conversationId);
    }

    if (conversationId.startsWith("temp-")) {
      setMessages([]);
      prevIdRef.current = conversationId;
      console.log("[useMessages] conversationId is temp, cleared messages and set prevIdRef to:", conversationId);
      return;
    }

    api
      .getConversationMessages(conversationId, accessToken)
      .then((data: Message[]) => {
        // data is already an array
        const normalized = data.map(msg => ({
          ...msg,
          id: msg.id?.toString() ?? uuidv4(), // ensure unique ID for React key
          content: msg.content ?? '',
          partial: '',
          isStreaming: false,
        })).reverse(); // show oldest first
        setMessages(normalized);
      })
      .catch(error => console.error("Failed to fetch messages:", error));

    prevIdRef.current = conversationId;

  }, [conversationId, accessToken]);

  return { messages, setMessages };
};