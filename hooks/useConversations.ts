import { useState, useEffect } from 'react';
import type { Conversation } from '../types';
import { api } from '../services/api';


export const useConversations = (accessToken: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tempConversationId, setTempConversationId] = useState<string | null>(null);
  const [pendingNavigationId, setPendingNavigationId] = useState<string | null>(null);

  // Fetch all past conversations for the sidebar
  useEffect(() => {
  if (!accessToken) return;
  api.getConversations(accessToken)
    .then(res => setConversations(res.conversations))
    .catch(error => console.error("Failed to fetch conversations:", error));
  }, [accessToken]);

  // Handle creating new conversation
  const createNewConversation = (navigate: (path: string) => void) => {
    if (tempConversationId) {
      console.log("Already in a new chat.")
      return
    };
    const tempId = `temp-${Date.now()}`;
    setTempConversationId(tempId);
    setConversations(prev => [
      {id: tempId, title: "New Conversation", updated_at: new Date().toISOString() },
      ...prev
    ]);
    navigate(`/chat/${tempId}`)
  };

  return {
    conversations,
    setConversations,
    tempConversationId,
    setTempConversationId,
    pendingNavigationId,
    setPendingNavigationId,
    createNewConversation
  };
};