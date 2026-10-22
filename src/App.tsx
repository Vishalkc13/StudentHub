/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Student, ActivityItem, ActiveTab, QuizQuestion, QuizSubmission } from './types';
import { initialStudents, initialActivities, defaultQuizQuestions, initialQuizSubmissions } from './data';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TeacherWorkspace } from './components/TeacherWorkspace';
import { Dashboard } from './components/Dashboard';
import { StudentsView } from './components/StudentsView';
import { StudentPortal } from './components/StudentPortal';
import { StudentDossierDrawer } from './components/StudentDossierDrawer';
import { QuizTestPage } from './components/QuizTestPage';
import { GeminiChatbot } from './components/GeminiChatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('teacher-workspace');
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(defaultQuizQuestions);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>(initialQuizSubmissions);

  // Student Dossier Drawer state
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Quick Add Student modal triggered from Students View
  const [showAddFromStudents, setShowAddFromStudents] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickRoll, setQuickRoll] = useState('');
  const [quickEmail, setQuickEmail] = useState('');

  const handleUpdateMarks = (id: string, internal: number, external: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, internal, external } : s))
    );
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...newStudentData,
      id: `stud-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateRemarks = (id: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, remarks } : s))
    );
  };

  const handleSaveDossierStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    handleAddActivity(
      `Dossier Updated for ${updatedStudent.name}`,
      `Modified master registry attributes and academic records`,
      'student'
    );
  };

  const handleOpenDossier = (student: Student) => {
    setSelectedStudentForDossier(student);
    setIsDossierOpen(true);
  };

  const handleAddActivity = (
    title: string,
    detail: string,
    type: ActivityItem['type']
  ) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title,
      detail,
      time: 'Just now',
      type,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleAddSubmission = (submission: QuizSubmission) => {
    setSubmissions((prev) => [submission, ...prev]);
    handleAddActivity(
      `Quiz Test Submitted: ${submission.studentName}`,
      `Score: ${submission.score}/${submission.totalQuestions} (${submission.percentage}%) in ${submission.topic}`,
      'verified'
    );
  };

  const handleCommitScoreToInternal = (studentId: string, bonusInternal: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              internal: Math.min(40, Math.max(s.internal, bonusInternal)),
            }
          : s
      )
    );

    handleAddActivity(
      `Quiz Score Applied to Internal: ${student.name}`,
      `Continuous assessment mark updated to ${bonusInternal}/40 based on quiz performance`,
      'grade'
    );
  };

  const handleLoadQuizQuestions = (newQuestions: QuizQuestion[]) => {
    setQuizQuestions(newQuestions);
    handleAddActivity(
      'New Quiz Generated with Gemini',
      `Loaded ${newQuestions.length} questions into Class Quiz Test`,
      'system'
    );
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickRoll.trim()) return;

    const parts = quickName.trim().split(' ');
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : quickName.substring(0, 2).toUpperCase();

    handleAddStudent({
      roll: quickRoll.trim().toUpperCase(),
      name: quickName.trim(),
      email: quickEmail.trim() || `${quickRoll.toLowerCase()}@student.mca.edu`,
      initials,
      avatarBg: 'bg-primary-fixed',
      avatarColor: 'text-on-primary-fixed-variant',
      semester: 3,
      courseCode: 'MCA302',
      courseName: 'Advanced DBMS Lab',
      internal: 32,
      external: 48,
      attendance: 92,
      remarks: 'Candidate registered in MCA roster.',
    });

    handleAddActivity(
      `Student Enrolled: ${quickName}`,
      `Generated records in students and marks table (Roll: ${quickRoll.toUpperCase()})`,
      'student'
    );

    setQuickName('');
    setQuickRoll('');
    setQuickEmail('');
    setShowAddFromStudents(false);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        studentCount={students.length}
        quizQuestionsCount={quizQuestions.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content Viewport */}
        <main className="relative pt-20 px-4 sm:px-space-md lg:px-space-lg py-space-lg w-full max-w-[1600px] mx-auto flex-1">
          {activeTab === 'teacher-workspace' && (
            <TeacherWorkspace
              students={students}
              onUpdateMarks={handleUpdateMarks}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onUpdateRemarks={handleUpdateRemarks}
              onOpenDossier={handleOpenDossier}
              activities={activities}
              onAddActivity={handleAddActivity}
              onNavigateToQuiz={() => setActiveTab('quiz-test')}
              onNavigateToAiBot={() => setActiveTab('ai-study-quiz')}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              activities={activities}
              setActiveTab={setActiveTab}
              onOpenDossier={handleOpenDossier}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              onOpenDossier={handleOpenDossier}
              onOpenAddModal={() => setShowAddFromStudents(true)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'quiz-test' && (
            <QuizTestPage
              students={students}
              questions={quizQuestions}
              onUpdateQuestions={setQuizQuestions}
              submissions={submissions}
              onAddSubmission={handleAddSubmission}
              onCommitScoreToInternal={handleCommitScoreToInternal}
              onNavigateToTeacherWorkspace={() => setActiveTab('teacher-workspace')}
            />
          )}

          {activeTab === 'ai-study-quiz' && (
            <GeminiChatbot
              onLoadQuizToTestPage={handleLoadQuizQuestions}
              onNavigateToQuiz={() => setActiveTab('quiz-test')}
            />
          )}

          {activeTab === 'student-portal' && <StudentPortal students={students} />}
        </main>
      </div>

      {/* Student Dossier Drawer */}
      <StudentDossierDrawer
        student={selectedStudentForDossier}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onSaveStudent={handleSaveDossierStudent}
      />

      {/* Quick Add Modal from Students view */}
      {showAddFromStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Quick Add Student
                </h3>
              </div>
              <button
                onClick={() => setShowAddFromStudents(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="p-space-md flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Tanvi Joshi"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Roll Number</label>
                <input
                  required
                  type="text"
                  placeholder="MCA004"
                  value={quickRoll}
                  onChange={(e) => setQuickRoll(e.target.value.toUpperCase())}
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface font-mono outline-none uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Email</label>
                <input
                  type="email"
                  placeholder="tanvi.j@student.mca.edu"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddFromStudents(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-semibold hover:bg-surface-tint shadow cursor-pointer"
                >
                  Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
