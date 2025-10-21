import React from 'react';
// import ReactMarkdown, { Components } from 'react-markdown';
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {MarkdownMessage} from './MarkdownMessage';
import { UserIcon, BotIcon } from './icons';
import type { Message } from '../types';
import { normalizeMarkdown } from '../utils/normalizeMarkdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { sender, content, partial, isStreaming } = message;
  const isUser = sender === 'user';
  const Icon = isUser ? UserIcon : BotIcon;
  

  // User message with bubble
  if (isUser) {
    // User messages render as bubble
    return (
      <div className="flex items-start space-x-4 mb-4 flex-row-reverse space-x-reverse">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
          <Icon className="w-5 h-5 text-white" />
        </div>

        <div className="rounded-lg p-4 max-w-xl break-words bg-blue-600 text-white ml-auto font-mono whitespace-pre-wrap">
          {content}
        </div>
      </div>
    );
  }

  {/* Debug: log final markdown content */}
  {isStreaming === false && console.log("Final markdown content:", content)}

  const fullContent = content + (partial ?? "");

  // AI assistant message without bubble (rendered directly)
  return (
    <div className="flex items-start space-x-4 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
        <Icon className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1 break-words">
        <MarkdownMessage content={fullContent} />
        {isStreaming && partial && (
          <span className="text-gray-400 font-mono animate-pulse">▍</span>
        )}
      </div>
    </div>
  );
};

// const markdownComponents: Components = {
//   code(props: any) {
//     const { node, inline, className, children, ...rest } = props;
//     const match = /language-(\w+)/.exec(className || '');
    
//     return !inline && match ? (
//       <div className="my-3">
//         <SyntaxHighlighter 
//           style={oneDark} 
//           language={match[1]} 
//           customStyle={{
//             borderRadius: '0.375rem',
//             margin: 0,
//           }}
//           {...rest}
//         >
//           {String(children).replace(/\n$/, '')}
//         </SyntaxHighlighter>
//       </div>
//     ) : (
//       <code 
//         className={`px-1.5 py-0.5 rounded text-sm font-mono ${
//           inline ? 'bg-gray-600 text-gray-200' : className || ''
//         }`} 
//         {...rest}
//       >
//         {children}
//       </code>
//     );
//   },
  
//   // Additional markdown components for better styling
//   p: (props) => <p className="mb-3">{props.children}</p>,
  
//   ol: (props) => <ol className="list-decimal ml-6 mb-3">{props.children}</ol>,
//   ul: (props) => <ul className="list-disc ml-6 mb-3">{props.children}</ul>,
//   li: (props) => <li className="mb-1">{props.children}</li>,
  
//   blockquote: ({ children }) => (
//     <blockquote className="border-l-4 border-gray-500 pl-4 italic mb-3 text-gray-300">
//       {children}
//     </blockquote>
//   ),
  
//   h1: ({ children }) => <h1 className="text-xl font-bold mb-3">{children}</h1>,
//   h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
//   h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
  
//   // Table components
//   table: ({ children }) => (
//     <div className="overflow-x-auto mb-4">
//       <table className="min-w-full border-collapse border border-gray-600">
//         {children}
//       </table>
//     </div>
//   ),
  
//   thead: ({ children }) => (
//     <thead className="bg-gray-600">
//       {children}
//     </thead>
//   ),
  
//   tbody: ({ children }) => (
//     <tbody>
//       {children}
//     </tbody>
//   ),
  
//   tr: ({ children }) => (
//     <tr className="border-b border-gray-600 hover:bg-gray-700">
//       {children}
//     </tr>
//   ),
  
//   th: ({ children }) => (
//     <th className="px-4 py-2 text-left font-semibold text-gray-200 border-r border-gray-600 last:border-r-0">
//       {children}
//     </th>
//   ),
  
//   td: ({ children }) => (
//     <td className="px-4 py-2 text-gray-200 border-r border-gray-600 last:border-r-0">
//       {children}
//     </td>
//   ),
  
//   // Horizontal rule
//   hr: () => <hr className="my-6 border-gray-600" />,
  
// };

export default ChatMessage;