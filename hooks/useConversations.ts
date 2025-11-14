import { useState, useEffect } from 'react';
import type { Conversation } from '../types';
import { api } from '../services/api';


export const useConversations = (
  accessToken: string | null,
  tempConversationId: string | null,
  setTempConversationId: (id: string | null) => void
) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);

  // Fetch all past conversations for the sidebar
  useEffect(() => {
  if (!accessToken) return;
  api
    .getConversations(accessToken)
    .then(res => setConversations(res.conversations))
    .catch(error => console.error("Failed to fetch conversations:", error));
  }, [accessToken]);

  // Handle creating new conversation
  const createNewConversation = (navigate: (path: string) => void) => {
    navigate(`/chat`)
  };

  return {
    conversations,
    setConversations,
    tempConversationId,
    setTempConversationId,
    createNewConversation
  };
};