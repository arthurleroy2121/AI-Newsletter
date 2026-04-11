export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface MCQOption {
  label: string;
  isOther: boolean;
}

export interface MCQBlock {
  question: string;
  options: MCQOption[];
}

export interface ParsedChatContent {
  textBefore: string;
  mcq: MCQBlock | null;
  textAfter: string;
  topicReady: TopicConfig | null;
}

export interface TopicConfig {
  topic: string;
  keywords: string[];
  scope: string;
  language: string;
}
