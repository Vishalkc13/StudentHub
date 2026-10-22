export interface Student {
  id: string;
  roll: string;
  name: string;
  email: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  semester: number;
  courseCode: string;
  courseName: string;
  internal: number; // max 40
  external: number; // max 60 (end-term)
  attendance: number; // percentage
  remarks?: string;
  phone?: string;
  address?: string;
  guardian?: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  type: 'grade' | 'verified' | 'audit' | 'student' | 'system';
}

export interface GradeInfo {
  total: number;
  gradeLabel: string;
  gradeClass: string;
  iconType: 'star' | 'dot' | 'warning';
  letterGrade: string;
  gpa: number;
}

export interface TranscriptCourse {
  code: string;
  name: string;
  credits: number;
  internal: number;
  external: number;
  total: number;
  grade: string;
  points: number;
  dynamic?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'student' | 'teacher';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
}

export interface QuizSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  topic: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'teacher-workspace'
  | 'quiz-test'
  | 'ai-study-quiz'
  | 'student-portal';
