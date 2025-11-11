import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { api } from '../services/api';

export const useMessages = (conversationId: string | null, accessToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!accessToken || !conversationId) return setMessages([]);
    if (conversationId.startsWith("temp-")) return setMessages([]);

    api.getConversationMessages(conversationId, accessToken)
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
  }, [conversationId, accessToken]);

  return { messages, setMessages };
};