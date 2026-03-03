export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// Format history yang dibutuhkan Gemini API
export interface ChatHistory {
  role: "user" | "model";
  parts: { text: string }[];
}