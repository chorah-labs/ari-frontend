
import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from '../Sidebar';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import ChatMessagesContainer from './ChatMessagesContainer';
import AuthContext from '../../contexts/AuthContext';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { useChatStreaming } from '../../hooks/useChatStreaming';
import { BotIcon } from '../icons';
import { api, API_BASE_URL } from '../../services/api';
import type { Message, Conversation } from '../../types';

const ChatPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const { conversationId: paramId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  // === State ===
  const pendingNavigationIdRef = useRef<string | null>(null);
  
  
  // --- Conversations ---
  const {
    conversations,
    setConversations,
    tempConversationId,
    setTempConversationId,
    pendingNavigationId,
    setPendingNavigationId,
    createNewConversation
  } = useConversations(auth?.accessToken)
  
  const conversationId = paramId ?? tempConversationId;
  const { messages, setMessages } = useMessages(conversationId, auth?.accessToken);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // --- Auto scrolling ---
  const { autoScroll, scrollToBottom, messagesEndRef, setAutoScroll } =
    useAutoScroll(containerRef, messages, isLoading);

  
  // --- Chat Streaming ---
  const { sendMessage } = useChatStreaming({
    accessToken: auth?.accessToken,
    conversationId,
    tempConversationId,
    setTempConversationId,
    setConversations,
    setPendingNavigationId,
    setIsLoading,
    setMessages,
    navigate,
  });
  
  // // Fetch all past conversations for the sidebar
  // useEffect(() => {
  //   if (!auth?.accessToken) return;
    
  //   api.getConversations(auth.accessToken)
  //     .then(data => setConversations(data.conversations))
  //     .catch(error => console.error("Failed to fetch conversations:", error));
  // }, [auth?.accessToken]);

  // Fetch messages for a given conversation
  // useEffect(() => {
  //   if (!auth?.accessToken || !conversationId || conversationId.startsWith("temp-")) {
  //     setMessages([]);
  //     return;
  //   }

  //   api.getConversationMessages(conversationId, auth.accessToken)
  //     .then((data: Message[]) => {
  //       // data is already an array
  //       const normalized: Message[] = data.map(msg => ({
  //         ...msg,
  //         id: msg.id?.toString() ?? uuidv4(), // ensure unique ID for React key
  //         content: msg.content ?? '',
  //         partial: '',
  //         isStreaming: false,
  //       })).reverse(); // show oldest first
  //       setMessages(normalized);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch messages:", error);
  //       setMessages([]); // fallback to empty array
  //     });
  // }, [auth?.accessToken, conversationId]);

  useEffect(() => {
    console.log("Messages state updated:", messages);
  }, [messages]);


  // --- Handle sending a message and lazy conversation creation ---
  // const handleSendMessage = (query: string, tempId?: string) => {
  //   if (!query.trim() || !auth?.accessToken) return;

    // // Optimistic user message
    // const userMessage: Message = {
    //   id: uuidv4(),
    //   sender: "user",
    //   content: query,
    //   partial: "",
    //   isStreaming: false,
    // };
    // setMessages(prev => [...prev, userMessage]);
    // setIsLoading(true);

    // // Assistant placeholder
    // const newId = uuidv4();
    // assistantMessageIdRef.current = newId;
    // console.log("Assistant message ID assigned for streaming:", assistantMessageIdRef.current);
    // const assistantPlaceholder: Message = {
    //   id: newId,
    //   sender: "assistant",
    //   content: "",
    //   partial: "",
    //   isStreaming: true,
    // };
    // setMessages(prev => [...prev, assistantPlaceholder]);

    // Call backend
    // api
    //   .streamQuery(
    //     query,
    //     auth.accessToken,
    //     conversationId && !conversationId.startsWith("temp-")
    //       ? conversationId
    //       : tempId ?? null,
    //     "cmc_docs",
    //     (chunk) => {
          // Example: 
          //   { "conversation_id": "...", "title": "...", "updated_at": "..." }
          //   or { "choices": [ { "delta": { "content": "Hello" } } ] }

          // --- Handle conversation metadata from first message ---
          // if (chunk?.conversation_id && tempConversationId) {
          //   setConversations(prev =>
          //     prev.map(conv =>
          //       conv.id === tempConversationId
          //         ? {
          //             id: chunk.conversation_id,
          //             title: chunk.title,
          //             updated_at: chunk.updated_at
          //           }
          //         : conv
          //     )
          //   );
          //   setTempConversationId(null);
          //   pendingNavigationIdRef.current = chunk.conversation_id; // Defer navigation until stream finishes
          //   return;
          // }

          // --- Handle message_start event from backend (real message ID) ---
          // if (chunk?.event === "message_start" && chunk.message_id) {
          //   const realId = chunk.message_id;

          //   // Replace temp assistant ID in message state with real ID
          //   setMessages(prev =>
          //     prev.map(msg =>
          //       msg.id === assistantMessageIdRef.current
          //         ? { ...msg, id: realId }
          //         : msg
          //     )
          //   );

          //   // Update the ref so future delta chunks go to the correct message
          //   assistantMessageIdRef.current = realId;
          //   return;
          // }

          // --- Handle streaming message content (delta chunks) ---
          // const currentMessageId = assistantMessageIdRef.current;
          // if (!currentMessageId) {
          //   console.error("No assistantMessageId found in ref during streaming update.");
          //   return;
          // }
          
          // const delta = chunk?.choices?.[0]?.delta?.content ?? "";
          // const finishReason = chunk?.choices?.[0]?.finish_reason ?? null;
          
          // console.log("Delta extracted for message streaming:", delta);
          // console.log("Finish reason:", finishReason);
          
          // if (delta) {
          //   setMessages(prev => {
          //     const found = prev.some(m => m.id ===currentMessageId);
          //     console.log("[delta] Updating assistant message", { delta, found, prev });
          //     return prev.map(msg =>
          //       msg.id ===currentMessageId
          //       ? {
          //         ...msg,
          //         partial: (msg.partial ?? "") + delta
          //       }
          //       : msg
          //     );
          //   });
          // }
          
          // if (finishReason === 'stop') {
          //   console.log("Received finish_reason=stop - finalizing after render");
          //   requestAnimationFrame(() => finalizeAssistantMessage());
          // }
        // },
        // () => {
          // console.log("Stream connection closed.");
          // requestAnimationFrame(() => finalizeAssistantMessage());
      //   }
      // )
      // .catch((err) => {
      //   console.error("Failed to fetch stream:", err);
      //   setMessages((prev) =>
      //     prev.map((msg) =>
      //       msg.id === assistantMessageIdRef.current
      //       ? {
      //           ...msg,
      //           content: "Sorry, something went wrong.",
      //           partial: "",
      //           isStreaming: false,
      //         }
      //       : msg
      //     )
      //   );
      //   setIsLoading(false);
      // });
  
    // const finalizeAssistantMessage = () => {
    //   console.log("[finalizeAssistantMessage] Finalizing...")
    //   const currentId = assistantMessageIdRef.current;
    //   setMessages(prev =>
    //     prev.map(msg =>
    //       msg.partial
    //         ? {
    //             ...msg,
    //             content: msg.content + (msg.partial ?? "").trim(),
    //             partial: "",
    //             isStreaming: false,
    //           }
    //         : msg
    //     )
    //   );
    //   setIsLoading(false);

    //   if (pendingNavigationIdRef.current) {
    //     const conversation_id = pendingNavigationIdRef.current;
    //     pendingNavigationIdRef.current = null;
    //     requestAnimationFrame(() => navigate(`/chat/${conversation_id}`));
    //   }
    // }
  // };

  // // --- Handle creating new chat ---
  // const handleNewChat = () => {
  //   if (tempConversationId) {
  //     console.log("Alreadying in a new chat.")
  //     return
  //   }
  //   const tempId = `temp-${Date.now()}`;
  //   setTempConversationId(tempId);

  //   const newConv: Conversation = {
  //     id: tempId,
  //     title: "New Conversation",
  //     updated_at: new Date().toISOString(),
  //   };
  //   setConversations(prev => [newConv, ...prev]);

  //   navigate(`/chat/${tempId}`);
  // };

  return (
    <div className="flex h-screen bg-gray-800 text-white">
      <Sidebar conversations={conversations} onNewChat={() => createNewConversation(navigate)} />
      <main className="flex flex-col flex-1 relative">
        <ChatMessagesContainer
          containerRef={containerRef}
          messages={messages}
          autoScroll={autoScroll}
          messagesEndRef={messagesEndRef}
          scrollToBottom={scrollToBottom}
          setAutoScroll={setAutoScroll}
        />
        {/* <div ref={containerRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {(!messages || messages.length === 0) ? (
              <div className="text-center mt-24">
                <BotIcon className="w-20 h-20 mx-auto text-gray-500" />
                <h1 className="text-4xl font-bold mt-4 text-gray-300">Chorah Labs ARI</h1>
                <p className="text-gray-400 mt-2">How can I help you today?</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages?.map((msg, i) => {
                  const isLastAssistant =
                    msg.sender === "assistant" &&
                    messages.slice(i + 1).every(m => m.sender !== "assistant")
                  
                  return (
                    <ChatMessage key={msg.id} message={msg} isLastAssistant={isLastAssistant} />
                  );
                })}
                
                {isLoading && messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && (
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
        </div> */}
        
        {/* Scroll to Bottom Button */}
        {/* {!autoScroll && (
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
        )} */}

        {/* Input Area */}
        <div className="p-6 bg-gray-800">
          <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
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
