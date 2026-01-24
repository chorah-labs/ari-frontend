
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarIcon } from '../icons';
import Sidebar from '../Sidebar';
import ChatInput from '../ChatInput';
import ChatMessagesContainer from './ChatMessagesContainer';
import { useAuth } from '../../hooks/useAuth';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { useChatStreaming } from '../../hooks/useChatStreaming';

const ChatPage: React.FC = () => {
  const { accessToken } = useAuth();

  
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
  } = useConversations(accessToken, tempConversationId, setTempConversationId)

  const { messages, setMessages } = useMessages(conversationId, accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Auto scrolling ---
  const { autoScroll, scrollToBottom, messagesEndRef, setAutoScroll } =
  useAutoScroll(containerRef, messages, isLoading);
  
  
  // --- Chat Streaming ---
  const { sendMessage } = useChatStreaming({
    accessToken: accessToken!,
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
      setMessages([]);
      setIsLoading(false);
    }
  }, [paramId, setMessages]);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userToggled, setUserToggled] = useState(false);

  // Prevent slide-in animations on initial load
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setHasMounted(true);
    });
    return () => cancelAnimationFrame(raf);  // Cleanup on unmount
  }, []);

  // Autoclose sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (!userToggled) {
        if (window.innerWidth < 768) setSidebarOpen(false);
        else setSidebarOpen(true);
      }
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [userToggled])

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
    setUserToggled(true);
  };
  
  return (
    <div className="flex h-screen bg-gray-800 text-white">

      {/* Sidebar container with slide animation */}
      <div
        className={`
          absolute left-0 top-0 h-full
          ${hasMounted ? "transition-transform duration-300" : ""}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
        <Sidebar
          conversations={conversations}
          onNewChat={() => createNewConversation(navigate)}
          onCloseSidebar={toggleSidebar}
        />
      </div>

      <main
        className={`
          flex flex-col flex-1 relative overflow-y-auto overflow-x-hidden p-6
          ${hasMounted ? "transition-all duration-300" : ""}
          ${sidebarOpen ? "ml-64" : "ml-0"}
        `}
      >
        {/* Button to reopen the sidebar when collapsed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 p-2 bg-gray-700 rounded-lg hover:bg-gray-600 z-20"
          >
            <SidebarIcon className="w-5 h-5" />
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
