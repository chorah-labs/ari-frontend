
import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarIcon } from '../icons';
import Sidebar from '../Sidebar';
import ChatInput from '../ChatInput';
import ChatMessagesContainer from './ChatMessagesContainer';
import AuthContext from '../../contexts/AuthContext';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { useChatStreaming } from '../../hooks/useChatStreaming';

const ChatPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { conversationId: paramId } = useParams<{ conversationId: string }>();
  const [tempConversationId, setTempConversationId] = useState<string | null>(
    !paramId ? `temp-${Date.now()}` : null
  );
  const conversationId = paramId ?? tempConversationId;
  
  // --- Conversations ---
  const {
    conversations,
    setConversations,
    createNewConversation
  } = useConversations(auth?.accessToken, tempConversationId, setTempConversationId)
  
  const { messages, setMessages } = useMessages(conversationId, auth?.accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Auto scrolling ---
  const { autoScroll, scrollToBottom, messagesEndRef, setAutoScroll } =
    useAutoScroll(containerRef, messages, isLoading);

  
  // --- Chat Streaming ---
  const { sendMessage } = useChatStreaming({
    accessToken: auth?.accessToken!,
    conversationId,
    setConversations,
    tempConversationId,
    setTempConversationId,
    setIsLoading,
    setMessages,
    navigate,
  });

  useEffect(() => {
    if (!paramId) {
      console.log("[ChatPage] Resetting chat page for new conversation...");
      setMessages([]);
      setIsLoading(false);
    }
  }, [paramId, setMessages]);

  useEffect(() => {
    console.log("[ChatPage] Messages updated:", messages);
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          onNewChat={() => createNewConversation(navigate)}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex flex-col flex-1 relative">
        {/* Button to reopen the sidebar when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            <SidebarIcon className="w-5 h-5"/>
          </button>
        )}
        
        <ChatMessagesContainer
          containerRef={containerRef}
          messages={messages}
          autoScroll={autoScroll}
          messagesEndRef={messagesEndRef}
          scrollToBottom={scrollToBottom}
          setAutoScroll={setAutoScroll}
        />

        {/* Input Area */}
        <div className="p-6 bg-gray-800">
          <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
              <p className="text-xs text-center text-gray-500 mt-3">
                Chorah Labs ARI can make mistakes. Consider checking important information.
              </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
