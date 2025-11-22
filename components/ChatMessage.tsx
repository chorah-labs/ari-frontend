import React, {useState, useEffect} from 'react';
import {MarkdownMessage} from './MarkdownMessage';
import MessageFeedback from './MessageFeedback';
import { UserIcon, BotIcon } from './icons';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLastAssistant?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastAssistant = false }) => {
  const { sender, content, partial, isStreaming } = message;
  const isUser = sender === 'user';
  const isAssistant = sender === 'assistant';
  const Icon = isUser ? UserIcon : BotIcon;
  const [showFeedback, setShowFeedback] = useState(false);
  
  useEffect(() => {
    if (isAssistant && !isStreaming) {
      const timeout = setTimeout(() => setShowFeedback(true), 100);
      return () => clearTimeout(timeout);
    }
  }, [isAssistant, isStreaming]);

  // User message with bubble
  if (isUser) {
    // User messages render as bubble
    return (
      <div className="flex items-start space-x-4 mb-4 flex-row-reverse space-x-reverse">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="rounded-lg p-4 max-w-full md:max-w-xl break-words bg-blue-600 text-white ml-auto whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  // {/* Debug: log final markdown content */}
  // {isStreaming === false && console.log("Final markdown content:", content)}

  const fullContent = content + (partial ?? "");

  // AI assistant message without bubble (rendered directly)
  return (
    <div className="flex items-start space-x-4 mb-4">
      {/* Assistant Icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Message + Feedback */}
      <div className="flex-1 max-w-full break-words overflow-hidden">
        <MarkdownMessage content={fullContent} />
        {isStreaming && partial && <span className="text-gray-400 font-mono animate-pulse">▍</span>}

        {/* Feedback buttons for assistant messages only */}
        <div className="mt-2 flex flex-col items-start gap-1">
          {isAssistant && (
            <div
              className={`mt-2 flex flex-col items-start gap-1 transition-opacity duration-500 ${
                showFeedback ? "opacity-100" : "opacity-0"
              }`}
            >
              {isLastAssistant && (
                <p className="text-gray-500 text-s mb-1">
                  Please help us improve our service
                </p>
              )}
              <MessageFeedback
                messageId={message.id}
                initialFeedback={
                  message.feedback === "up" || message.feedback === "down"
                    ? message.feedback
                    : null
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;