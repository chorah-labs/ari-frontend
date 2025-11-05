import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
export const API_BASE_URL = import.meta.env.VITE_ARI_API_URL;

interface MessageFeedbackProps {
  messageId: string;
  initialFeedback?: "up" | "down" | null;
}

export default function MessageFeedback({ messageId, initialFeedback = null }: MessageFeedbackProps) {
  const [selected, setSelected] = useState<"up" | "down" | null>(initialFeedback);

  const submitFeedback = async (value: "up" | "down" | null) => {
    try {
      await fetch(`${API_BASE_URL}/messages/${messageId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: value }),
      });
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  const handleClick = (value: "up" | "down") => {
    const newValue = selected === value ? null : value;
    setSelected(newValue);
    submitFeedback(newValue);
  };

  return (
    <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
      <button
        title="Good response"
        onClick={() => handleClick("up")}
        className={`p-1 rounded hover:bg-gray-700 ${selected === "up" ? "text-green-500" : "text-gray-100"}`}
      >
        <ThumbsUp size={14} />
      </button>
      <button
        title="Bad response"
        onClick={() => handleClick("down")}
        className={`p-1 rounded hover:bg-gray-700 ${selected === "down" ? "text-red-500" : "text-gray-100"}`}
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}