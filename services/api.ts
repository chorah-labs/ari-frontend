
export const API_BASE_URL = import.meta.env.VITE_ARI_API_URL;
export const api = {
  register: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }
    return response.json();
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
    onChunk: (chunk: string) => void,
    onClose: () => void
    // No access token needed based on provided backend code
  ) => {
    const response = await fetch(`${API_BASE_URL}/chat/query_stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        conversation_id: 'eaac2aee-8f75-4d91-bc5b-9db1ce2f80e5',  // Dev placeholder for Demo V0.1
        collection_name: 'cmc_docs'                               // Dev placeholder for Demo V0.1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Query failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
        throw new Error("Failed to get stream reader");
    }

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const textChunk = decoder.decode(value, { stream: true });
            // The provided backend yields raw chunks. If it were standard SSE, we'd parse "data:" lines.
            onChunk(textChunk);
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
