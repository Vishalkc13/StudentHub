import React, { useState, useEffect } from 'react';
import { Student, QuizQuestion, QuizSubmission } from '../types';
import { defaultQuizQuestions } from '../data';

interface QuizTestPageProps {
  students: Student[];
  questions: QuizQuestion[];
  onUpdateQuestions: (newQuestions: QuizQuestion[]) => void;
  submissions: QuizSubmission[];
  onAddSubmission: (submission: QuizSubmission) => void;
  onCommitScoreToInternal?: (studentId: string, bonusInternal: number) => void;
  onNavigateToTeacherWorkspace?: () => void;
}

export const QuizTestPage: React.FC<QuizTestPageProps> = ({
  students,
  questions,
  onUpdateQuestions,
  submissions,
  onAddSubmission,
  onCommitScoreToInternal,
  onNavigateToTeacherWorkspace,
}) => {
  // Test state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'test' | 'history'>('test');

  // Timer state (10 minutes default)
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // AI Generator modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('Transactions, Locks & ACID');
  const [genDifficulty, setGenDifficulty] = useState('Medium');
  const [genCount, setGenCount] = useState(5);

  // Custom question modal
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customOptions, setCustomOptions] = useState(['', '', '', '']);
  const [customCorrect, setCustomCorrect] = useState(0);
  const [customExp, setCustomExp] = useState('');
  const [customTopic, setCustomTopic] = useState('MCA DBMS Lab');

  // Recorded to internal notification
  const [committedNotice, setCommittedNotice] = useState(false);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted, secondsLeft]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setIsTimerRunning(false);

    // Calculate score
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    const percentage = Number(((score / questions.length) * 100).toFixed(1));

    if (currentStudent) {
      onAddSubmission({
        id: `sub-${Date.now()}`,
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        studentRoll: currentStudent.roll,
        score,
        totalQuestions: questions.length,
        percentage,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        topic: questions[0]?.topic || 'Advanced DBMS Test',
      });
    }
  };

  const handleRestartQuiz = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsSubmitted(false);
    setSecondsLeft(600);
    setIsTimerRunning(true);
    setCommittedNotice(false);
  };

  // AI Quiz Generator call
  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: genTopic,
          count: genCount,
          difficulty: genDifficulty,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        onUpdateQuestions(data.questions);
        handleRestartQuiz();
        setShowGenerateModal(false);
      } else if (data.fallback) {
        onUpdateQuestions(data.fallback);
        handleRestartQuiz();
        setShowGenerateModal(false);
      }
    } catch (err) {
      console.error('Quiz generator error:', err);
      // Fallback questions
      onUpdateQuestions(defaultQuizQuestions);
      handleRestartQuiz();
      setShowGenerateModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    const newQ: QuizQuestion = {
      id: `q-cust-${Date.now()}`,
      question: customQuestion.trim(),
      options: customOptions.map((o, i) => o.trim() || `Option ${i + 1}`),
      correctIndex: customCorrect,
      explanation: customExp.trim() || 'Verified answer for MCA assessment.',
      topic: customTopic.trim() || 'MCA DBMS Lab',
    };

    onUpdateQuestions([...questions, newQ]);
    setShowAddCustomModal(false);
    setCustomQuestion('');
    setCustomOptions(['', '', '', '']);
    setCustomExp('');
  };

  const currentQ = questions[currentIndex] || questions[0];
  const totalQ = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  // Calculate score summary if submitted
  const correctCount = questions.filter(
    (q, idx) => userAnswers[idx] === q.correctIndex
  ).length;
  const finalPercentage = totalQ > 0 ? ((correctCount / totalQ) * 100).toFixed(1) : '0';

  const handleCommitScore = () => {
    if (onCommitScoreToInternal && currentStudent) {
      // Scale quiz score to internal bonus contribution (e.g., max 5 marks scale)
      const bonusMarks = Math.min(40, Math.round((correctCount / totalQ) * 40));
      onCommitScoreToInternal(currentStudent.id, bonusMarks);
      setCommittedNotice(true);
      setTimeout(() => setCommittedNotice(false), 4000);
    }
  };

  return (
    <div className="flex flex-col w-full pb-12 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-surface-tint p-space-md sm:p-space-lg text-on-primary shadow-xl mb-space-md">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-[11px]">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                Official Examination Mode
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-[11px]">
                Course: MCA-302
              </span>
            </div>

            <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-primary">
              Class Quiz Test &amp; Evaluation
            </h1>
            <p className="font-body-md text-on-primary-container max-w-2xl text-sm sm:text-base">
              Online examination portal for Master of Computer Applications (MCA). Features timed tests, instant automated evaluation, faculty AI quiz generation, and score integration.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-sm font-bold shadow-md hover:bg-surface-container-low transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Generate Quiz with AI
            </button>

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-label-md text-sm font-semibold hover:bg-surface-container-lowest/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Question
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Selector & Utility Strip */}
      <div className="p-space-sm sm:p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-low mb-space-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Student picker */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full ${currentStudent.avatarBg} ${currentStudent.avatarColor} flex items-center justify-center font-bold text-sm`}
          >
            {currentStudent.initials}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-outline font-semibold">Candidate:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
                handleRestartQuiz();
              }}
              disabled={!isSubmitted && answeredCount > 0}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-title-md text-sm font-semibold outline-none disabled:opacity-60"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer & Tabs */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <div className="flex items-center p-1 bg-surface-container-low rounded-lg">
            <button
              onClick={() => setActiveTab('test')}
              className={`px-3 py-1 rounded-md text-label-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'test'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Active Test
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-md text-label-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-surface-container-lowest text-primary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Submissions ({submissions.length})
            </button>
          </div>

          {!isSubmitted && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low font-mono font-bold text-sm text-primary">
              <span className="material-symbols-outlined text-[18px]">timer</span>
              <span>{formatTimer(secondsLeft)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-outline hover:text-primary p-0.5 cursor-pointer ml-1"
                title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isTimerRunning ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {committedNotice && (
        <div className="mb-4 p-3 rounded-xl bg-secondary-fixed/40 border border-secondary text-on-secondary-fixed-variant text-body-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
            <span className="font-semibold">
              Assessment Score committed directly into {currentStudent.name}&apos;s Continuous Internal Marks!
            </span>
          </div>
          {onNavigateToTeacherWorkspace && (
            <button
              onClick={onNavigateToTeacherWorkspace}
              className="px-3 py-1 bg-secondary text-on-secondary rounded-lg font-label-sm font-bold hover:bg-secondary/90 cursor-pointer"
            >
              View in Teacher Workspace &rarr;
            </button>
          )}
        </div>
      )}

      {/* Main Content: Test Flow or Submissions History */}
      {activeTab === 'history' ? (
        /* Submissions History */
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-low overflow-hidden">
          <div className="p-space-md bg-surface-container-low border-b border-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">assignment_turned_in</span>
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Class Test Submissions &amp; Score Registry
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('test')}
              className="text-primary font-label-sm font-semibold hover:underline cursor-pointer"
            >
              Take / Continue Test &rarr;
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase text-outline tracking-wider border-b border-surface-container">
                  <th className="py-3 px-space-md">Candidate</th>
                  <th className="py-3 px-space-md">Roll No</th>
                  <th className="py-3 px-space-md">Quiz Topic</th>
                  <th className="py-3 px-space-md text-center">Score</th>
                  <th className="py-3 px-space-md text-center">Percentage</th>
                  <th className="py-3 px-space-md text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-md text-body-md">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-space-md font-semibold text-on-surface">
                      {sub.studentName}
                    </td>
                    <td className="py-3.5 px-space-md font-mono text-primary font-bold">
                      {sub.studentRoll}
                    </td>
                    <td className="py-3.5 px-space-md text-on-surface-variant text-sm">
                      {sub.topic}
                    </td>
                    <td className="py-3.5 px-space-md text-center font-mono font-bold">
                      {sub.score} / {sub.totalQuestions}
                    </td>
                    <td className="py-3.5 px-space-md text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-label-sm font-bold font-mono ${
                          sub.percentage >= 80
                            ? 'bg-secondary-container/30 text-on-secondary-container'
                            : sub.percentage >= 60
                            ? 'bg-primary-fixed text-on-primary-fixed-variant'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-space-md text-right text-outline text-sm">
                      {sub.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : isSubmitted ? (
        /* Results View */
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-low overflow-hidden">
          {/* Result Banner */}
          <div className="p-space-lg bg-gradient-to-b from-surface-container-low to-surface-container-lowest border-b border-surface-container text-center flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 ${
                parseFloat(finalPercentage) >= 80
                  ? 'bg-secondary-container/30 text-secondary'
                  : 'bg-primary-fixed text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[36px]">
                {parseFloat(finalPercentage) >= 80 ? 'workspace_premium' : 'check_circle'}
              </span>
            </div>

            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Test Completed: {correctCount} of {totalQ} Correct
            </h2>
            <p className="font-body-md text-outline">
              Candidate: <span className="font-bold text-on-surface">{currentStudent.name}</span> (
              {currentStudent.roll})
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="font-mono text-3xl font-bold text-primary">
                {finalPercentage}%
              </span>
              <span
                className={`px-3 py-1 rounded-full font-label-sm font-bold ${
                  parseFloat(finalPercentage) >= 90
                    ? 'bg-tertiary-container/20 text-tertiary'
                    : parseFloat(finalPercentage) >= 80
                    ? 'bg-secondary-container/30 text-on-secondary-container'
                    : 'bg-primary-fixed text-on-primary-fixed-variant'
                }`}
              >
                {parseFloat(finalPercentage) >= 90
                  ? 'A+ Distinction'
                  : parseFloat(finalPercentage) >= 80
                  ? 'Outstanding'
                  : 'First Class'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleCommitScore}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-md font-bold shadow-sm hover:bg-secondary/90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                Apply Score to Teacher Continuous Evaluation
              </button>

              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                Retake Quiz
              </button>

              <button
                onClick={() => setShowGenerateModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-surface-tint transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Generate New Quiz (AI)
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="p-space-md sm:p-space-lg flex flex-col gap-6">
            <h3 className="font-title-md text-title-md font-bold text-on-surface border-b border-surface-container pb-2">
              Detailed Question Analysis &amp; Academic Explanations
            </h3>

            {questions.map((q, idx) => {
              const selectedOpt = userAnswers[idx];
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id || idx}
                  className={`p-4 rounded-xl border flex flex-col gap-3 ${
                    isCorrect
                      ? 'bg-secondary-fixed/10 border-secondary/30'
                      : 'bg-error-container/10 border-error/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center font-mono font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="font-label-sm text-outline font-semibold uppercase">
                        {q.topic || 'DBMS Assessment'}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm font-semibold text-xs ${
                        isCorrect
                          ? 'bg-secondary-container/40 text-on-secondary-container'
                          : 'bg-error-container text-error'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isCorrect ? 'check' : 'close'}
                      </span>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="font-title-md text-on-surface font-semibold text-base">
                    {q.question}
                  </p>

                  {/* Options display */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {q.options.map((opt, optIdx) => {
                      const wasChosen = selectedOpt === optIdx;
                      const isOptionCorrect = optIdx === q.correctIndex;

                      let badgeClass = 'border-surface-container-high bg-surface-container-low/40';
                      if (isOptionCorrect) {
                        badgeClass = 'border-secondary bg-secondary-fixed/20 text-on-secondary-fixed-variant font-semibold';
                      } else if (wasChosen && !isOptionCorrect) {
                        badgeClass = 'border-error bg-error-container/30 text-error';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg border text-sm flex items-center justify-between ${badgeClass}`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-outline">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </span>
                          {isOptionCorrect && (
                            <span className="material-symbols-outlined text-secondary text-[16px]">
                              check_circle
                            </span>
                          )}
                          {wasChosen && !isOptionCorrect && (
                            <span className="material-symbols-outlined text-error text-[16px]">
                              cancel
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Academic Explanation */}
                  <div className="p-3 rounded-lg bg-surface-container-low text-body-sm text-on-surface-variant flex items-start gap-2 border border-surface-container-high/40">
                    <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                      info
                    </span>
                    <div>
                      <span className="font-semibold text-on-surface block text-xs uppercase tracking-wider">
                        Faculty Explanation:
                      </span>
                      <p className="mt-0.5 text-sm">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Test Taking View */
        <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-low overflow-hidden">
          {/* Progress Header */}
          <div className="p-space-md bg-surface-container-low border-b border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-primary font-bold text-base">
                Question {currentIndex + 1} of {totalQ}
              </span>
              <span className="text-outline">/</span>
              <span className="text-body-sm text-outline">
                {answeredCount} Answered ({totalQ - answeredCount} Remaining)
              </span>
            </div>

            {/* Question Quick Jump Pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {questions.map((_, idx) => {
                const isAnswered = userAnswers[idx] !== undefined;
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-7 h-7 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-primary text-on-primary ring-2 ring-primary/30'
                        : isAnswered
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container text-outline hover:text-on-surface'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container h-1.5">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalQ) * 100}%` }}
            ></div>
          </div>

          {/* Question Card */}
          <div className="p-space-md sm:p-space-lg flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-xs font-semibold uppercase tracking-wider">
                {currentQ.topic || 'Advanced DBMS Question'}
              </span>

              <span className="font-mono text-xs text-outline font-semibold">
                Single Choice (4 Options)
              </span>
            </div>

            <h2 className="font-headline-md text-headline-md font-bold text-on-surface leading-snug">
              {currentQ.question}
            </h2>

            {/* Option Cards */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentIndex, optIdx)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-primary-fixed/30 border-primary shadow-sm text-on-surface font-semibold ring-2 ring-primary/20'
                        : 'bg-surface-container-low/50 border-surface-container-high hover:border-primary/50 hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="font-body-md text-sm sm:text-base">{option}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-outline-variant'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-surface-container flex items-center justify-between">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-lg font-label-md font-semibold text-outline hover:text-on-surface hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQ - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer flex items-center gap-1"
                  >
                    Next
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md font-bold hover:bg-secondary/90 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    Submit Class Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Quiz Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Generate Custom Quiz with Gemini AI
                </h3>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerateAIQuiz} className="p-space-md flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-on-surface font-medium">
                  Syllabus Topic or Subject Focus
                </label>
                <input
                  type="text"
                  required
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="e.g. B+ Tree Indexing vs Hash Indexing"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-on-surface font-medium">Difficulty Level</label>
                  <select
                    value={genDifficulty}
                    onChange={(e) => setGenDifficulty(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                  >
                    <option value="Easy">Beginner / Conceptual</option>
                    <option value="Medium">Medium / MCA Standard</option>
                    <option value="Hard">Advanced / Optimization &amp; Tuning</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-on-surface font-medium">Number of Questions</label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(parseInt(e.target.value, 10))}
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                  >
                    <option value={3}>3 Questions (Quick Test)</option>
                    <option value={5}>5 Questions (Standard)</option>
                    <option value={10}>10 Questions (Full Mock)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container flex items-center gap-2 text-on-surface-variant font-label-sm text-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                <span>
                  Uses server-side <strong>Gemini 3.8 Flash</strong> to construct rigorous questions, plausible distractors, and academic answer keys.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-surface-tint shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      Generate &amp; Load Quiz
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Question Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-surface-container max-h-[90vh] overflow-y-auto">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">add_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Add Faculty Question to Class Test
                </h3>
              </div>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddCustomQuestionSubmit} className="p-space-md flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Topic</label>
                <input
                  type="text"
                  required
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. SQL Triggers & Stored Procedures"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Question Text</label>
                <textarea
                  rows={2}
                  required
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Enter the complete question prompt..."
                  className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label-md text-on-surface font-medium">Options (Mark the correct answer)</label>
                {customOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={customCorrect === idx}
                      onChange={() => setCustomCorrect(idx)}
                      className="accent-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-bold text-outline w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => {
                        const copy = [...customOptions];
                        copy[idx] = e.target.value;
                        setCustomOptions(copy);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-on-surface font-medium">Explanation</label>
                <input
                  type="text"
                  value={customExp}
                  onChange={(e) => setCustomExp(e.target.value)}
                  placeholder="Why is this answer correct?"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary text-on-surface text-body-md outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-surface-tint shadow-md transition-all cursor-pointer"
                >
                  Add Question to Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
