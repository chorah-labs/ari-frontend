import { useState, useRef, useCallback, useEffect } from 'react';
import type { Message } from '../types';

export const useAutoScroll = (containerRef: React.RefObject<HTMLDivElement>, messages: Message[], isLoading: boolean) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth=true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 30;
    setAutoScroll(isNearBottom);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll])

  useEffect(() => {
    if (autoScroll) scrollToBottom();
  }, [messages, isLoading, autoScroll, scrollToBottom]);

  return { autoScroll, scrollToBottom, messagesEndRef, setAutoScroll };
};