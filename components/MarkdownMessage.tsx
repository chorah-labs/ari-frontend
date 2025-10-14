import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {markdownComponents as codeComponent } from "./markdownComponents";

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-gray-100 dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-2">{children}</p>,
          ol: ({ children }) => <ol className="list-decimal ml-6 mb-2">{children}</ol>,
          ul: ({ children }) => <ul className="list-disc ml-6 mb-2">{children}</ul>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          table: ({ children }) => (
            <table className="border border-gray-700 border-collapse w-full my-4 text-sm">
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th className="border border-gray-700 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-700 px-3 py-2">{children}</td>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-500 pl-4 italic mb-2 text-gray-300">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-gray-600" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              {children}
            </a>
          ),
          img: ({ src, alt, title }) => (
            <img
              src={src}
              alt={alt ?? ""}
              title={title}
              className="rounded mb-2 border border-gray-700 max-w-full"
            />
          ),
          ...codeComponent,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
