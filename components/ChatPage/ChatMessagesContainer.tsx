import { BotIcon } from '../icons';
import ChatMessage from '../ChatMessage';

const ChatMessagesContainer = ({ containerRef, messages, autoScroll, messagesEndRef, scrollToBottom, setAutoScroll }) => (
  <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6">
    <div className="max-w-4xl mx-auto">
      {!messages.length ? (
        <div className="text-center mt-24">
          <BotIcon className="w-20 h-20 mx-auto text-gray-500" />
          <h1 className="text-4xl font-bold mt-4 text-gray-300">Chorah Labs ARI</h1>
          <p className="text-gray-400 mt-2">How can I help you today?</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg, i) => {
            const isLastAssistant =
              msg.sender === "assistant" &&
              messages.slice(i + 1).every(m => m.sender !== "assistant");
            return <ChatMessage key={msg.id} message={msg} isLastAssistant={isLastAssistant} />;
          })}
          {/* Scroll Target */}
          <div ref={messagesEndRef} />
        </div>
      )}
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
  </div>
);

export default ChatMessagesContainer;
