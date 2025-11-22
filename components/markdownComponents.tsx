import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const markdownComponents: Components = {
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");

    if (!inline && match) {
      return (
        <div className="my-2 max-w-full w-full overflow-x-auto rounded-lg bg-[#282c34]">
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            wrapLines
            customStyle={{
              margin: 0, // prevent extra spacing
              background: "transparent", // use parent background
              padding: "1rem",
              overflowX: "auto",
              maxWidth: "100%",
              boxSizing: "border-box"
            }}
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
