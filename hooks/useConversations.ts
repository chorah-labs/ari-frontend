import { useState, useEffect } from 'react';
import type { Conversation } from '../types';
import { api } from '../services/api';


export const useConversations = (
  accessToken: string | null,
  tempConversationId: string | null,
  setTempConversationId: (id: string | null) => void
) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsError, setConversationsError] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Fetch all past conversations for the sidebar
  useEffect(() => {
    if (!accessToken) return;
    setIsLoadingConversations(true);
    setConversationsError(null);
    api
      .getConversations(accessToken)
      .then(res => setConversations(res.conversations))
      .catch(error => {
        console.error("Failed to fetch conversations:", error);
        setConversationsError("Failed to load conversations");
      })
      .finally(() => setIsLoadingConversations(false));
  }, [accessToken]);

  // Handle creating new conversation
  const createNewConversation = (navigate: (path: string) => void) => {
    if (!tempConversationId) {
      setTempConversationId(`temp-${Date.now()}`);
    }
    navigate(`/chat`);
  };

  return {
    conversations,
    setConversations,
    conversationsError,
    isLoadingConversations,
    createNewConversation
  };
};