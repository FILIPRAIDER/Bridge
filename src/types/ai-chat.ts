// Types para el sistema de IA del chat
export interface AIAssistantResponse {
  answer: string;
  confidence: number;
  sources: {
    messageId: string;
    content: string;
    author: string;
    timestamp: string;
  }[];
  suggestedQuestions: string[];
}

export interface ConversationSummary {
  summary: string;
  messageCount: number;
  timeRange: {
    from: string;
    to: string;
  };
  mainTopics: string[];
  decisions: {
    decision: string;
    context: string;
    participants: string[];
  }[];
  tasks: {
    task: string;
    assignee: string | null;
    deadline: string | null;
    priority: "HIGH" | "MEDIUM" | "LOW";
  }[];
  participants: {
    name: string;
    contributionLevel: string;
    mainTopics: string[];
  }[];
  nextSteps: string[];
}

export interface MeetingMinutes {
  title: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  topics: {
    topic: string;
    discussion: string;
    decisions: string[];
  }[];
  actionItems: {
    task: string;
    assignee: string | null;
    deadline: string | null;
    priority: "HIGH" | "MEDIUM" | "LOW";
  }[];
  nextMeeting: string | null;
}

export interface TaskDetection {
  isTask: boolean;
  task: {
    title: string;
    description: string;
    assignee: string | null;
    deadline: string | null;
    priority: "HIGH" | "MEDIUM" | "LOW";
    confidence: number;
  } | null;
  reasoning: string;
}

export interface FilesSummary {
  fileCount: number;
  summary: string;
  categories: {
    category: string;
    fileCount: number;
    description: string;
  }[];
  recentFiles: {
    name: string;
    uploadedAt: string;
    summary: string;
    importance: "HIGH" | "MEDIUM" | "LOW";
  }[];
  recommendations: string[];
}
