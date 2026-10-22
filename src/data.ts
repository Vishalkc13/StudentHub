import { Student, ActivityItem, GradeInfo, TranscriptCourse, QuizQuestion, QuizSubmission } from './types';

export function computeGradeInfo(internal: number, external: number): GradeInfo {
  const safeInternal = Math.min(40, Math.max(0, internal || 0));
  const safeExternal = Math.min(60, Math.max(0, external || 0));
  const total = Number((safeInternal + safeExternal).toFixed(2));

  if (total >= 90) {
    return {
      total,
      gradeLabel: 'A+ Distinction',
      gradeClass: 'bg-tertiary-container/20 text-tertiary',
      iconType: 'star',
      letterGrade: 'A+',
      gpa: 10.0,
    };
  } else if (total >= 80) {
    return {
      total,
      gradeLabel: 'Outstanding',
      gradeClass: 'bg-secondary-container/30 text-on-secondary-container',
      iconType: 'dot',
      letterGrade: 'A',
      gpa: 9.0,
    };
  } else if (total >= 70) {
    return {
      total,
      gradeLabel: 'First Class',
      gradeClass: 'bg-primary-fixed text-on-primary-fixed-variant',
      iconType: 'dot',
      letterGrade: 'B+',
      gpa: 8.0,
    };
  } else if (total >= 50) {
    return {
      total,
      gradeLabel: 'Second Class',
      gradeClass: 'bg-surface-variant text-on-surface-variant',
      iconType: 'dot',
      letterGrade: 'B',
      gpa: 7.0,
    };
  } else {
    return {
      total,
      gradeLabel: 'Conditional / Fail',
      gradeClass: 'bg-error-container text-on-error-container',
      iconType: 'warning',
      letterGrade: 'F',
      gpa: 0.0,
    };
  }
}

export const initialStudents: Student[] = [
  {
    id: 'stud-1',
    roll: 'MCA001',
    name: 'Aarav Kumar',
    email: 'aarav.k@student.mca.edu',
    initials: 'AK',
    avatarBg: 'bg-primary-fixed',
    avatarColor: 'text-on-primary-fixed-variant',
    semester: 3,
    courseCode: 'MCA302',
    courseName: 'Advanced DBMS Lab',
    internal: 34,
    external: 51,
    attendance: 94,
    remarks: 'Strong understanding of indexing strategies and ACID transaction properties.',
    phone: '+91 98765 43210',
    address: 'B-14 Sector 62, Noida, UP',
    guardian: 'Rajesh Kumar (Father)',
  },
  {
    id: 'stud-2',
    roll: 'MCA002',
    name: 'Priya Sharma',
    email: 'priya.s@student.mca.edu',
    initials: 'PS',
    avatarBg: 'bg-tertiary-fixed',
    avatarColor: 'text-on-tertiary-fixed',
    semester: 3,
    courseCode: 'MCA302',
    courseName: 'Advanced DBMS Lab',
    internal: 38,
    external: 53,
    attendance: 98,
    remarks: 'Exemplary performance in B-Tree performance tuning and multi-version concurrency control.',
    phone: '+91 98112 34567',
    address: 'Flat 402, Green Glen View, Bengaluru, KA',
    guardian: 'Sunita Sharma (Mother)',
  },
  {
    id: 'stud-3',
    roll: 'MCA003',
    name: 'Rohan Verma',
    email: 'rohan.v@student.mca.edu',
    initials: 'RV',
    avatarBg: 'bg-surface-variant',
    avatarColor: 'text-primary',
    semester: 3,
    courseCode: 'MCA302',
    courseName: 'Advanced DBMS Lab',
    internal: 31,
    external: 47.5,
    attendance: 89,
    remarks: 'Consistent lab work; recommended to practice deadlock detection graphs and foreign key constraints.',
    phone: '+91 97234 56789',
    address: 'Plot 18, Mayur Vihar Phase 1, New Delhi, DL',
    guardian: 'Anil Verma (Father)',
  },
];

export const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'Marks Updated for Priya Sharma',
    detail: 'Updated End-Term from 50 to 53 • 12 mins ago',
    time: '12 mins ago',
    type: 'grade',
  },
  {
    id: 'act-2',
    title: 'Internal marks sheet verified',
    detail: 'Course MCA302 submitted to Examination Cell',
    time: '45 mins ago',
    type: 'verified',
  },
  {
    id: 'act-3',
    title: 'DBMS Connection Active',
    detail: 'Session #TCH-8802 pool allocated with autocommit=1',
    time: '1 hour ago',
    type: 'system',
  },
];

export const studentTranscriptCourses: TranscriptCourse[] = [
  {
    code: 'MCA301',
    name: 'Advanced Software Engineering',
    credits: 4,
    internal: 36,
    external: 50,
    total: 86,
    grade: 'A',
    points: 9.0,
  },
  {
    code: 'MCA302',
    name: 'Advanced DBMS & Database Lab',
    credits: 4,
    internal: 34,
    external: 51,
    total: 85,
    grade: 'A',
    points: 9.0,
    dynamic: true,
  },
  {
    code: 'MCA303',
    name: 'Cloud Infrastructure & DevOps',
    credits: 4,
    internal: 35,
    external: 49,
    total: 84,
    grade: 'A',
    points: 9.0,
  },
  {
    code: 'MCA304',
    name: 'Deep Learning & Neural Networks',
    credits: 4,
    internal: 33,
    external: 48,
    total: 81,
    grade: 'A',
    points: 9.0,
  },
  {
    code: 'MCA305',
    name: 'DBMS Mini Project (Viva & Defense)',
    credits: 2,
    internal: 39,
    external: 56,
    total: 95,
    grade: 'A+',
    points: 10.0,
  },
];

export const defaultQuizQuestions: QuizQuestion[] = [
  {
    id: 'q-1',
    topic: 'Transactions & Concurrency',
    question: 'Under the Strict Two-Phase Locking (Strict 2PL) protocol, when are exclusive (X) locks held by a transaction released?',
    options: [
      'Immediately after the write operation finishes',
      'When the growing phase completes',
      'Only after the transaction successfully commits or aborts',
      'Whenever another waiting transaction requests a shared lock',
    ],
    correctIndex: 2,
    explanation: 'Strict 2PL prevents cascading rollbacks and dirty reads by requiring that all exclusive locks be held until the very end of the transaction (Commit or Abort).',
  },
  {
    id: 'q-2',
    topic: 'Indexing & B-Trees',
    question: 'Why are B+ Trees predominantly preferred over standard binary search trees for disk-based relational database indexes?',
    options: [
      'B+ Trees require zero memory buffers in RAM',
      'High fan-out reduces the tree height, significantly minimizing costly disk I/O operations',
      'B+ Trees do not require rebalancing upon row insertions',
      'Leaf nodes in B+ Trees are completely unsorted to speed up bulk loading',
    ],
    correctIndex: 1,
    explanation: 'Disks read data in blocks/pages. B+ Trees have a high branching factor (fan-out of hundreds of keys per node), keeping tree depth low (often 3-4 levels) and minimizing random disk accesses.',
  },
  {
    id: 'q-3',
    topic: 'Normalization & Schema Design',
    question: 'A relation R(A, B, C) is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X → Y:',
    options: [
      'Y is a prime attribute',
      'X is a superkey of relation R',
      'X contains at least two attributes',
      'R contains no multi-valued dependencies',
    ],
    correctIndex: 1,
    explanation: 'BCNF requires that for every non-trivial functional dependency X → Y, the determinant X must be a superkey of R. Unlike 3NF, BCNF does not allow exceptions for prime attributes.',
  },
  {
    id: 'q-4',
    topic: 'Query Optimization',
    question: 'What is the primary role of the Query Optimizer during SQL statement execution in an RDBMS like MySQL InnoDB or PostgreSQL?',
    options: [
      'To verify student user credentials before parsing the SQL',
      'To convert relational algebra expressions into an execution plan with the lowest estimated I/O and CPU cost',
      'To automatically enforce 3NF decomposition on user tables',
      'To encrypt query result rows before sending to network buffers',
    ],
    correctIndex: 1,
    explanation: 'The query optimizer uses database catalog statistics (histograms, cardinalities, available indexes) to select the most efficient physical access paths and join algorithms (e.g. nested loop, hash join).',
  },
  {
    id: 'q-5',
    topic: 'ACID & Isolation Levels',
    question: 'Which anomaly can occur under the READ_COMMITTED isolation level, but is prevented under REPEATABLE_READ in SQL standards?',
    options: [
      'Dirty Read (Reading uncommitted dirty writes)',
      'Non-Repeatable Read (Re-reading the same row within a transaction produces modified values)',
      'Write Skew in snapshot isolation',
      'Disk page corruption',
    ],
    correctIndex: 1,
    explanation: 'READ_COMMITTED ensures only committed data is read, preventing dirty reads. However, if another transaction commits an update to a row, re-reading that row yields the newer data (Non-Repeatable Read). REPEATABLE_READ prevents this.',
  },
];

export const initialQuizSubmissions: QuizSubmission[] = [
  {
    id: 'sub-1',
    studentId: 'stud-2',
    studentName: 'Priya Sharma',
    studentRoll: 'MCA002',
    score: 5,
    totalQuestions: 5,
    percentage: 100,
    date: 'Oct 21, 2026',
    topic: 'Transactions & Concurrency',
  },
  {
    id: 'sub-2',
    studentId: 'stud-1',
    studentName: 'Aarav Kumar',
    studentRoll: 'MCA001',
    score: 4,
    totalQuestions: 5,
    percentage: 80,
    date: 'Oct 21, 2026',
    topic: 'Transactions & Concurrency',
  },
];
