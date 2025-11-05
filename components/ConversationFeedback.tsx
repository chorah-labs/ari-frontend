import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
export const API_BASE_URL = import.meta.env.VITE_ARI_API_URL;

interface ConversationFeedbackProps {
  messages: Array<{ id: string; sender: string }>;
  visible: boolean;
}

export default function ConversationFeedback({ messages, visible }: ConversationFeedbackProps) {
  const [selected, setSelected] = useState<"up" | "down" | null>(null);
  const [lastAssistantId, setLastAssistantId] = useState<string | null>(null);

  // Track last assistant message ID
  useEffect(() => {
    const lastAssistant = [...messages].reverse().find(m => m.sender === "assistant");
    setLastAssistantId(lastAssistant?.id ?? null);
  }, [messages]);

  const submitFeedback = async (value: "up" | "down" | null) => {
    if (!lastAssistantId) return;
    try {
      await fetch(`${API_BASE_URL}/messages/${lastAssistantId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: value }),
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const handleClick = (value: "up" | "down") => {
    if (!lastAssistantId) return;

    if (selected === value) {
      // Toggle off: clear selection
      setSelected(null);
      submitFeedback(null);
    } else {
      // Select new feedback
      setSelected(value);
      submitFeedback(value);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center transition-opacity duration-700 mt-8 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <p className="text-gray-400 mb-3">Please help us improve our service</p>
      <div className="flex gap-6">
        <button
          title="Good response"
          onClick={() => handleClick("up")}
          className={`p-3 rounded-full transition-colors hover:bg-gray-700 ${
            selected === "up" ? "bg-green-600" : ""
          }`}
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
        <button
          title="Bad response"
          onClick={() => handleClick("down")}
          className={`p-3 rounded-full transition-colors hover:bg-gray-700 ${
            selected === "down" ? "bg-red-600" : ""
          }`}
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}