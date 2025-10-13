
import React, { useContext, useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

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
      .then(data => setMessages(data.messages))
      .catch(err => console.error("Failed to fetch messages:", err));
  }, [auth?.accessToken, conversationId]);

  const handleSendMessage = (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = {
      sender: 'user',
      content: query,
    };

    // show user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = `assistant-${Date.now()}`;

    // add placeholder for streaming assistant message
    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        sender: 'assistant',
        content: '',     // finalized markdown so far
        partial: '',     // current live text chunk
        isStreaming: true,
      },
    ]);

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
      <main className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center mt-24">
                <BotIcon className="w-20 h-20 mx-auto text-gray-500" />
                <h1 className="text-4xl font-bold mt-4 text-gray-300">Chorah Labs ARI</h1>
                <p className="text-gray-400 mt-2">How can I help you today?</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                 {isLoading && messages[messages.length-1].sender === 'assistant' && (
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                            <BotIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4 animate-pulse">
                           <div className="h-4 bg-gray-600 rounded w-24"></div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
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
