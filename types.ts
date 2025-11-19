
export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  partial?: string;
  isStreaming?: boolean;
  tokens_used?: number;
  model_name?: string;
  agents_used?: string;
  feedback?: string;
  tool_used?: string;
  created_at?: string;
}

export interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  isStreamingTitle?: boolean;
}