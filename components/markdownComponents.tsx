import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const markdownComponents: Components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    if (!inline && match) {
      return (
        <div className="my-2">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            wrapLines
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className={`bg-gray-700 text-sm font-mono px-1 py-0.5 rounded ${
          inline ? "" : className || ""
        }`}
        {...props}
      >
        {children}
      </code>
    );
  },
};
