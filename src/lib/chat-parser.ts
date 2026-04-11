import type { MCQBlock, MCQOption, ParsedChatContent, TopicConfig } from "./chat-types";

export function parseChatContent(content: string): ParsedChatContent {
  let textBefore = content;
  let textAfter = "";
  let mcq: MCQBlock | null = null;
  let topicReady: TopicConfig | null = null;

  // Parse MCQ block
  const mcqMatch = content.match(/\[MCQ\]([\s\S]*?)\[\/MCQ\]/);
  if (mcqMatch) {
    const beforeMcq = content.substring(0, mcqMatch.index!).trim();
    const afterMcq = content.substring(mcqMatch.index! + mcqMatch[0].length).trim();
    textBefore = beforeMcq;
    textAfter = afterMcq;
    mcq = parseMCQBlock(mcqMatch[1]);
  }

  // Parse TOPIC_READY block
  const topicMatch = content.match(/\[TOPIC_READY\]([\s\S]*?)\[\/TOPIC_READY\]/);
  if (topicMatch) {
    try {
      const jsonStr = topicMatch[1].trim();
      topicReady = JSON.parse(jsonStr) as TopicConfig;
    } catch {
      // If JSON parsing fails, ignore the topic block
    }

    // Remove TOPIC_READY from textBefore/textAfter
    if (!mcqMatch) {
      textBefore = content.substring(0, topicMatch.index!).trim();
      textAfter = content.substring(topicMatch.index! + topicMatch[0].length).trim();
    } else {
      textAfter = textAfter
        .replace(/\[TOPIC_READY\][\s\S]*?\[\/TOPIC_READY\]/, "")
        .trim();
    }
  }

  return { textBefore, mcq, textAfter, topicReady };
}

function parseMCQBlock(raw: string): MCQBlock {
  const lines = raw.trim().split("\n");
  let question = "";
  const options: MCQOption[] = [];
  let inOptions = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("question:")) {
      question = trimmed.substring("question:".length).trim();
    } else if (trimmed === "options:") {
      inOptions = true;
    } else if (inOptions && trimmed.startsWith("- ")) {
      const optionText = trimmed.substring(2).trim();
      if (optionText === "[OTHER]") {
        options.push({ label: "Autre", isOther: true });
      } else {
        options.push({ label: optionText, isOther: false });
      }
    }
  }

  return { question, options };
}
