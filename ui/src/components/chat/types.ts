export type ChatAuthor = "user" | "kairo";

export interface ChatMessage {
  id: string;
  author: ChatAuthor;
  text: string;
  timestamp: string;
}
