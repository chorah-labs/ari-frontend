
import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import AuthContext from '../contexts/AuthContext';
import { BotIcon } from './icons';
import { api } from '../services/api';
import type { Message, Conversation } from '../types';

const ChatPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const { conversationId } = useParams<{ conversationId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // Detect user scrolling
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80; // px threshold

    setAutoScroll(isNearBottom);
  }, []);

  // Attach scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Auto-scroll only if user is near bottom
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, isLoading, autoScroll, scrollToBottom]);

  // Fetch all past conversations for the sidebar
  useEffect(() => {
    if (!auth?.accessToken) return;
    
    api.getConversations(auth.accessToken)
      .then(data => setConversations(data.conversations))
      .catch(error => console.error("Failed to fetch conversations:", error));
  }, [auth?.accessToken]);

  // Fetch messages for a given conversation
  useEffect(() => {
    if (!auth?.accessToken || !conversationId) {
      setMessages([]);
      return;
    }

    api.getConversationMessages(conversationId, auth.accessToken)
      .then((data: Message[]) => {
        // data is already an array
        const normalized: Message[] = data.map(msg => ({
          ...msg,
          id: msg.id?.toString() ?? uuidv4(), // ensure unique ID for React key
          content: msg.content ?? '',
          partial: '',
          isStreaming: false,
        }));
        setMessages(normalized);
      })
      .catch(error => {
        console.error("Failed to fetch messages:", error);
        setMessages([]); // fallback to empty array
      });
  }, [auth?.accessToken, conversationId]);

  // Send user message
  const handleSendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      content: query,
      isStreaming: false,
      partial: '',
    };

    // show user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = uuidv4();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      sender: 'assistant',
      content: '',
      partial: '',
      isStreaming: true,
    };
    setMessages(prev => [...prev, assistantPlaceholder]);

    // start the stream
    api.streamQuery(
      query,
      auth.accessToken,
      (chunk) => {
        // update the partial text (fast updates)
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, partial: (msg.partial ?? '') + chunk }
              : msg
          )
        );
      },
      () => {
        // on stream completion: merge partial -> finalized
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: msg.content + (msg.partial ?? ''),
                  partial: '',
                  isStreaming: false,
                }
              : msg
          )
        );
        setIsLoading(false);
      }
    ).catch(error => {
      console.error('Failed to fetch stream:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: 'Sorry, I encountered an error. Please try again.',
                partial: '',
                isStreaming: false,
              }
            : msg
        )
      );
      setIsLoading(false);
    });
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <Sidebar conversations={conversations} />
      <main className="flex flex-col flex-1 relative">
        {/* Scroll Container */}
        <div ref={containerRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {(!messages || messages.length === 0) ? (
              <div className="text-center mt-24">
                <BotIcon className="w-20 h-20 mx-auto text-gray-500" />
                <h1 className="text-4xl font-bold mt-4 text-gray-300">Chorah Labs ARI</h1>
                <p className="text-gray-400 mt-2">How can I help you today?</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages?.map((msg) => (
                  <ChatMessage key={msg.id ?? uuidv4()} message={msg} />
                ))}
                {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && (
                  <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <BotIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
                          <div className="h-4 bg-gray-600 rounded w-24"></div>
                      </div>
                  </div>
                )}
              
                {/* Scroll Target */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll to Bottom Button */}
        {!autoScroll && (
          <button
            onClick={() => {
              scrollToBottom();
              setAutoScroll(true);
            }}
            className={`fixed bottom-24 right-8 bg-gray-700 text-white p-3 
              rounded-full shadow-lg transition-all duration-300 ease-in-out 
              ${autoScroll ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a.75.75 0 01-.53-.22l-6.25-6.25a.75.75 0 111.06-1.06L9.25 15.69V3.75a.75.75 0 011.5 0v11.94l4.97-4.97a.75.75 0 111.06 1.06l-6.25 6.25A.75.75 0 0110 18z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Input Area */}
        <div className="p-6 bg-gray-800">
            <div className="max-w-4xl mx-auto">
                 <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
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
