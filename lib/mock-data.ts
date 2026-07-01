export interface InterviewSummary {
  id: string;
  role: string;
  type: string;
  level: string;
  difficulty: string;
  date: string;
  durationMin: number;
  score: number;
  status: "completed" | "in-progress" | "scheduled";
}

export interface QuestionItem {
  id: string;
  prompt: string;
  category: string;
}

export const currentUser = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  title: "Senior Frontend Engineer",
  avatar: "",
  location: "San Francisco, CA",
  joined: "Jan 2025",
  skills: ["React", "TypeScript", "System Design", "Node.js", "GraphQL", "AWS"],
  resumeName: "alex_morgan_resume.pdf",
};

export const stats = [
  { label: "Interviews Taken", value: "24", change: "+12%", trend: "up" as const },
  { label: "Average Score", value: "82%", change: "+5%", trend: "up" as const },
  { label: "Practice Hours", value: "18.5", change: "+3.2h", trend: "up" as const },
  { label: "Confidence", value: "High", change: "Improving", trend: "up" as const },
];

export const performanceData = [
  { month: "Jan", score: 62, communication: 58 },
  { month: "Feb", score: 68, communication: 64 },
  { month: "Mar", score: 71, communication: 70 },
  { month: "Apr", score: 75, communication: 73 },
  { month: "May", score: 79, communication: 78 },
  { month: "Jun", score: 86, communication: 84 },
];

export const recentInterviews: InterviewSummary[] = [
  { id: "int_001", role: "Senior Frontend Engineer", type: "Technical", level: "Senior", difficulty: "Hard", date: "Jun 24, 2026", durationMin: 45, score: 88, status: "completed" },
  { id: "int_002", role: "Full Stack Developer", type: "System Design", level: "Mid", difficulty: "Medium", date: "Jun 20, 2026", durationMin: 30, score: 76, status: "completed" },
  { id: "int_003", role: "Product Engineer", type: "Behavioral", level: "Senior", difficulty: "Medium", date: "Jun 15, 2026", durationMin: 25, score: 91, status: "completed" },
  { id: "int_004", role: "Backend Engineer", type: "Technical", level: "Mid", difficulty: "Hard", date: "Jun 10, 2026", durationMin: 40, score: 69, status: "completed" },
  { id: "int_005", role: "React Developer", type: "Technical", level: "Junior", difficulty: "Easy", date: "Jun 28, 2026", durationMin: 30, score: 0, status: "scheduled" },
];

export const interviewQuestions: QuestionItem[] = [
  { id: "q1", prompt: "Walk me through how you would architect a scalable component library for a design system.", category: "System Design" },
  { id: "q2", prompt: "Explain the difference between server-side rendering and static generation, and when you'd choose each.", category: "Technical" },
  { id: "q3", prompt: "Describe a time you disagreed with a teammate on a technical decision. How did you resolve it?", category: "Behavioral" },
  { id: "q4", prompt: "How would you optimize the performance of a React application that renders large lists?", category: "Technical" },
  { id: "q5", prompt: "What strategies do you use to ensure accessibility in the products you build?", category: "Technical" },
];

export const liveTranscript = [
  { speaker: "AI", text: "Great, let's begin. Tell me about how you'd approach building a scalable design system." },
  { speaker: "You", text: "I'd start by defining design tokens for color, spacing, and typography so every component shares a single source of truth..." },
  { speaker: "AI", text: "Good. How would you handle theming across light and dark modes?" },
];

export const reportData = {
  overall: 86,
  technical: 88,
  communication: 84,
  confidence: 79,
  grammar: 92,
  eyeContact: 74,
  posture: 81,
  speakingSpeed: 138,
  fillerWords: 12,
  strengths: [
    "Clear, structured explanations with strong technical depth.",
    "Confident delivery and good pacing throughout the session.",
    "Excellent use of real-world examples to support answers.",
  ],
  weaknesses: [
    "Occasional filler words ('um', 'like') during transitions.",
    "Eye contact dropped when discussing complex topics.",
    "Could quantify impact with more concrete metrics.",
  ],
  suggestedAnswers: [
    { q: "How do you optimize a large React list?", a: "Use virtualization (react-window), memoize row components, stabilize keys, and avoid inline functions in hot render paths." },
    { q: "How do you ensure accessibility?", a: "Semantic HTML first, ARIA only when needed, keyboard navigation, focus management, and automated + manual screen reader testing." },
  ],
  roadmap: [
    { title: "Refine communication", desc: "Practice STAR-format answers to reduce filler words.", status: "In progress" },
    { title: "System design depth", desc: "Study trade-offs in caching and data consistency.", status: "Recommended" },
    { title: "Mock interviews", desc: "Complete 5 timed sessions at Hard difficulty.", status: "Recommended" },
  ],
};

export const aiAnalysisCards = [
  { label: "Confidence Score", value: "79%", icon: "Sparkles", tone: "primary" },
  { label: "Eye Contact", value: "74%", icon: "Eye", tone: "chart-2" },
  { label: "Posture", value: "81%", icon: "Activity", tone: "chart-3" },
  { label: "Voice Clarity", value: "88%", icon: "AudioLines", tone: "chart-5" },
  { label: "Grammar", value: "92%", icon: "SpellCheck", tone: "success" },
  { label: "Filler Words", value: "12", icon: "MessageSquareWarning", tone: "warning" },
];

export const jobRoles = ["Frontend Engineer", "Backend Engineer", "Full Stack Developer", "Product Engineer", "Data Scientist", "DevOps Engineer", "Mobile Developer"];
export const experienceLevels = ["Internship", "Junior", "Mid-level", "Senior", "Staff / Principal"];
export const interviewTypes = ["Technical", "System Design", "Behavioral", "Coding", "Mixed"];
export const difficulties = ["Easy", "Medium", "Hard"];
export const languages = ["JavaScript", "TypeScript", "Python", "Java", "Go", "C++", "Rust"];
export const durations = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];
