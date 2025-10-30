
export const API_BASE_URL = import.meta.env.VITE_ARI_API_URL;
export const api = {
  register: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    return await response.json();
  },

  login: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }
    return response.json();
  },

  streamQuery: async (
    query: string,
    accessToken: string,
    conversationId: string | null,
    collection_name: string,
    onChunk: (data: any) => void,
    onClose: () => void
  ) => {
    // Prepare request body
    const body: any = { query, collection_name: collection_name || "cmc_docs" };

    // Set conversation ID if provided
    if (conversationId && !conversationId.startsWith("temp-")) {
      body.conversation_id = conversationId;
    }

    const response = await fetch(`${API_BASE_URL}/chat/query_stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Query failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Failed to get stream reader");
    const decoder = new TextDecoder();

    let buffer = "";
    let doneStreaming = false;

    try {
      while (!doneStreaming) {
        const { done, value } = await reader.read();
        if (done) break;

        const decoded = decoder.decode(value, { stream: true });
        buffer += decoded;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n\n")) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 2);

          if (!line) continue;
          const cleanLine = line.replace(/^data:\s*/, "").trim();

          if (cleanLine === "[DONE]") {
            console.log("Streaming complete.");
            doneStreaming = true;
            break;
          }
          try {
            const parsed = JSON.parse(cleanLine);
            // console.log("Parsed SSE line data type: ", typeof parsed);
            console.log("Parsed SSE Line going to onChunk:", parsed);
            onChunk(parsed);
          } catch (err) {
            // fallback if not JSON
            console.log("Fallback catch block ran. Raw SSE line:", line);
            console.warn("Non-JSON SSE line:", line, err);
            onChunk({ choices: [{ delta: { content: line } }] });
          }
        }
      }
      const remaining = buffer.trim();
      if (remaining) {
        try {
          const cleanRemaining = remaining.startsWith("data: ")
            ? remaining.slice(5).trim()
            : remaining;
          const parsed = JSON.parse(cleanRemaining);
          onChunk(parsed);
        } catch {
          console.log("Remaining raw line fallback triggered:", remaining);
          onChunk({ choices: [{ delta: { content: remaining } }] });
        }
      }
    } catch (error) {
      console.error("Error reading stream:", error);
    } finally {
      reader.releaseLock();
      onClose();
    }
  },

  getConversations: async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/conversations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }
    return response.json(); // <-- returns { conversations: [ConversationsOut] }
  },

  // Need to finish this feature
  getConversationMessages: async (conversationId, accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }

    return response.json(); // <-- returns { messages: [MessageOut] } 
  }

};
