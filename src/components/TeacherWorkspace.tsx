import React, { useState } from 'react';
import { Student, ActivityItem } from '../types';
import { computeGradeInfo } from '../data';

interface TeacherWorkspaceProps {
  students: Student[];
  onUpdateMarks: (id: string, internal: number, external: number) => void;
  onAddStudent: (newStudent: Omit<Student, 'id'>) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateRemarks: (id: string, remarks: string) => void;
  onOpenDossier: (student: Student) => void;
  activities: ActivityItem[];
  onAddActivity: (title: string, detail: string, type: ActivityItem['type']) => void;
  onNavigateToQuiz?: () => void;
  onNavigateToAiBot?: () => void;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  students,
  onUpdateMarks,
  onAddStudent,
  onDeleteStudent,
  onUpdateRemarks,
  onOpenDossier,
  activities,
  onAddActivity,
  onNavigateToQuiz,
  onNavigateToAiBot,
}) => {
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Student | null>(null);
  const [selectedStudentForRemarks, setSelectedStudentForRemarks] = useState<Student | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Form states for Add Student
  const [newName, setNewName] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newSemester, setNewSemester] = useState(3);
  const [newEmail, setNewEmail] = useState('');
  const [newInternal, setNewInternal] = useState(30);
  const [newExternal, setNewExternal] = useState(45);

  const triggerSaveToast = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // KPI calculations
  const totalStudents = students.length;
  const classAverage =
    totalStudents > 0
      ? (
          students.reduce((acc, s) => {
            const g = computeGradeInfo(s.internal, s.external);
            return acc + g.total;
          }, 0) / totalStudents
        ).toFixed(2)
      : '0.00';

  const pendingEvaluations = students.filter(
    (s) => s.internal === 0 || s.external === 0
  ).length;

  const highestScorer =
    students.length > 0
      ? [...students].sort((a, b) => {
          const ga = computeGradeInfo(a.internal, a.external).total;
          const gb = computeGradeInfo(b.internal, b.external).total;
          return gb - ga;
        })[0]
      : null;

  const highestScoreVal = highestScorer
    ? computeGradeInfo(highestScorer.internal, highestScorer.external).total.toFixed(2)
    : '0.00';

  const highestScoreGrade = highestScorer
    ? computeGradeInfo(highestScorer.internal, highestScorer.external).letterGrade
    : 'N/A';

  const handleInternalChange = (id: string, valStr: string) => {
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 40) val = 40;

    const student = students.find((s) => s.id === id);
    if (student) {
      onUpdateMarks(id, val, student.external);
      triggerSaveToast();
      onAddActivity(
        `Marks Updated for ${student.name}`,
        `Updated Internal to ${val}/40`,
        'grade'
      );
    }
  };

  const handleExternalChange = (id: string, valStr: string) => {
    let val = parseFloat(valStr);
    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 60) val = 60;

    const student = students.find((s) => s.id === id);
    if (student) {
      onUpdateMarks(id, student.internal, val);
      triggerSaveToast();
      onAddActivity(
        `Marks Updated for ${student.name}`,
        `Updated End-Term to ${val}/60`,
        'grade'
      );
    }
  };

  const handleRecalculate = () => {
    triggerSaveToast();
    onAddActivity(
      'Grades Batch Recalculated',
      `Recalculated curves and standing totals for ${totalStudents} students`,
      'system'
    );
  };

  const handleExportCSV = () => {
    let csv = 'Roll_No,Student_Name,Email,Internal_40,EndTerm_60,Total_100,Grade,Standing\n';
    students.forEach((s) => {
      const g = computeGradeInfo(s.internal, s.external);
      csv += `${s.roll},"${s.name}",${s.email},${s.internal},${s.external},${g.total},${g.letterGrade},"${g.gradeLabel}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'MCA302_Grades_Master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onAddActivity(
      'Exported Grade Sheet (CSV)',
      `Generated master snapshot for course MCA302 with ${totalStudents} records`,
      'verified'
    );
  };

  const handleOpenRemarks = (student: Student) => {
    setSelectedStudentForRemarks(student);
    setRemarksText(student.remarks || '');
    setShowRemarksModal(true);
  };

  const handleSaveRemarks = () => {
    if (selectedStudentForRemarks) {
      onUpdateRemarks(selectedStudentForRemarks.id, remarksText);
      onAddActivity(
        `Remarks Saved for ${selectedStudentForRemarks.name}`,
        `Faculty commentary recorded in database`,
        'grade'
      );
      triggerSaveToast();
    }
    setShowRemarksModal(false);
  };

  const handleCommitAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newRoll.trim()) return;

    const parts = newName.trim().split(' ');
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : newName.substring(0, 2).toUpperCase();

    const colorVariants = [
      { bg: 'bg-primary-fixed', color: 'text-on-primary-fixed-variant' },
      { bg: 'bg-secondary-fixed', color: 'text-on-secondary-fixed' },
      { bg: 'bg-tertiary-fixed', color: 'text-on-tertiary-fixed' },
      { bg: 'bg-surface-variant', color: 'text-primary' },
    ];
    const pickedColor = colorVariants[students.length % colorVariants.length];

    onAddStudent({
      roll: newRoll.trim().toUpperCase(),
      name: newName.trim(),
      email: newEmail.trim() || `${newRoll.toLowerCase()}@student.mca.edu`,
      initials,
      avatarBg: pickedColor.bg,
      avatarColor: pickedColor.color,
      semester: newSemester,
      courseCode: 'MCA302',
      courseName: 'Advanced DBMS Lab',
      internal: Math.min(40, Math.max(0, newInternal)),
      external: Math.min(60, Math.max(0, newExternal)),
      attendance: 95,
      remarks: 'Newly enrolled student in MCA-302 roster.',
    });

    onAddActivity(
      `Student Enrolled: ${newName}`,
      `Generated records in students and marks table (Roll: ${newRoll.toUpperCase()})`,
      'student'
    );

    // Reset form
    setNewName('');
    setNewRoll('');
    setNewEmail('');
    setNewInternal(30);
    setNewExternal(45);
    setShowAddModal(false);
    triggerSaveToast();
  };

  const handleConfirmDelete = () => {
    if (showDeleteModal) {
      const studentName = showDeleteModal.name;
      const roll = showDeleteModal.roll;
      onDeleteStudent(showDeleteModal.id);
      onAddActivity(
        `Audit Log: Student Record Deleted`,
        `Removed ${studentName} (${roll}) from roster with faculty auth #TCH-8802`,
        'audit'
      );
      setShowDeleteModal(null);
      triggerSaveToast();
    }
  };

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Save Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container-lowest text-secondary shadow-xl border border-secondary/20 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px]">done_all</span>
          <span className="font-label-md text-label-md font-semibold text-on-surface">
            Changes committed to DBMS
          </span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-surface-tint p-space-lg text-on-primary shadow-xl mb-space-lg">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-primary-fixed-dim/20 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-label-sm tracking-wide">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                Full Edit &amp; CRUD Access Enabled
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">shield_person</span>
                Prof. Vikas Kumar (Faculty Coordinator, MCA)
              </span>
            </div>

            <h1 className="font-display-lg text-display-lg tracking-tight font-bold text-on-primary">
              Teacher Workspace: Grade Entry &amp; Evaluation
            </h1>

            <p className="font-body-md text-body-md text-on-primary-container max-w-2xl">
              Authorized grading portal for Master of Computer Applications (MCA) Semester III. Direct
              write privileges enabled for assessments, viva evaluation, and academic performance tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg font-semibold shadow-md hover:bg-surface-container-low transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              + Add Student
            </button>

            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container-lowest/30 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              Bulk Grade Entry
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container-lowest/30 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              Export Sheet (CSV)
            </button>

            {onNavigateToQuiz && (
              <button
                onClick={onNavigateToQuiz}
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container-lowest/30 transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">quiz</span>
                Class Quiz Test
              </button>
            )}

            {onNavigateToAiBot && (
              <button
                onClick={onNavigateToAiBot}
                className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-secondary-container/40 backdrop-blur-sm text-on-secondary-container font-label-lg text-label-lg font-bold hover:bg-secondary-container/60 transition-all duration-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                AI Quiz Creator
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DBMS Transaction Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm px-space-md rounded-xl shadow-sm mb-space-lg border border-surface-container-low">
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">
              sync_saved_locally
            </span>
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              DBMS Transaction Status:
            </span>
            <span className="font-mono font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-fixed/30 text-on-secondary-fixed-variant">
              Active Session: Teacher ID #TCH-8802 • autocommit=1
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-outline text-label-sm font-label-sm">
            <span>Isolation: READ_COMMITTED</span>
            <span>•</span>
            <span>InnoDB Master Pool</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed-dim opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="font-label-sm text-label-sm text-secondary font-medium">
            Real-Time Sync Active
          </span>
        </div>
      </div>

      {/* 4 Summary Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {/* KPI 1: Enrolled Students */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {totalStudents}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">
              MCA Batch 2026
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
            <span>100% active roster attendance</span>
          </div>
        </div>

        {/* KPI 2: Class Average */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Class Average
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {classAverage}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
              +4.2%
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, parseFloat(classAverage))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Evaluations */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Pending Evaluations
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {pendingEvaluations} / {totalStudents}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium">
              {pendingEvaluations === 0 ? 'All Evaluated' : `${pendingEvaluations} Incomplete`}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>All grade sheets locked and recorded</span>
          </div>
        </div>

        {/* KPI 4: Highest Score */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Highest Score
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {highestScoreVal}%
            </span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
              {highestScoreGrade}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm truncate">
            <span className="material-symbols-outlined text-[16px] text-tertiary">star</span>
            <span className="font-semibold text-on-surface truncate">
              {highestScorer ? highestScorer.name : 'N/A'}
            </span>
            <span className="text-outline font-mono">
              ({highestScorer ? highestScorer.roll : ''})
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Section: Table (3 cols) & Sidebar Widgets (1 col) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-space-lg mb-space-lg">
        {/* Left 3 Columns: Interactive Grading Table */}
        <div className="xl:col-span-3 bg-surface-container-lowest rounded-xl shadow-md overflow-hidden flex flex-col border border-surface-container-low">
          <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm border-b border-surface-container-high/40">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">grade</span>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Interactive Grading &amp; Student Evaluation
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Click on numerical values in the table to dynamically edit internal or end-term scores.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleRecalculate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary hover:bg-surface-container-high transition-colors font-label-sm text-label-sm font-semibold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">calculate</span> Recalculate
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase text-outline tracking-wider">
                  <th className="py-3 px-space-md">Student</th>
                  <th className="py-3 px-space-md">Roll No</th>
                  <th className="py-3 px-space-md">Internal (40)</th>
                  <th className="py-3 px-space-md">End-Term (60)</th>
                  <th className="py-3 px-space-md">Total Marks (%)</th>
                  <th className="py-3 px-space-md">Standing &amp; Grade</th>
                  <th className="py-3 px-space-md text-right">Faculty Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
                {students.map((student) => {
                  const grade = computeGradeInfo(student.internal, student.external);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-surface-container-low/50 transition-colors group"
                      data-roll={student.roll}
                    >
                      {/* Student info */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${student.avatarBg} ${student.avatarColor} flex items-center justify-center font-bold font-title-md shrink-0`}
                          >
                            {student.initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              onClick={() => onOpenDossier(student)}
                              className="font-title-md text-title-md text-on-surface font-semibold truncate hover:text-primary cursor-pointer"
                            >
                              {student.name}
                            </span>
                            <span className="font-body-sm text-body-sm text-outline truncate">
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Roll Number */}
                      <td className="py-3.5 px-space-md">
                        <span className="font-mono font-label-md text-label-md px-2 py-0.5 rounded-md bg-surface-container text-primary font-bold">
                          {student.roll}
                        </span>
                      </td>

                      {/* Internal Input */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="40"
                            step="0.5"
                            value={student.internal}
                            onChange={(e) => handleInternalChange(student.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-mono font-semibold text-center outline-none transition-all tabular-nums"
                          />
                          <span className="text-outline font-label-sm text-label-sm">/40</span>
                        </div>
                      </td>

                      {/* End-term Input */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            step="0.5"
                            value={student.external}
                            onChange={(e) => handleExternalChange(student.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded bg-surface-container-low focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-mono font-semibold text-center outline-none transition-all tabular-nums"
                          />
                          <span className="text-outline font-label-sm text-label-sm">/60</span>
                        </div>
                      </td>

                      {/* Total Marks */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col gap-1 w-28">
                          <div className="flex items-center justify-between font-mono">
                            <span className="font-title-md text-title-md font-bold text-on-surface tabular-nums">
                              {grade.total.toFixed(2)}%
                            </span>
                            <span className="font-body-sm text-body-sm text-outline tabular-nums">
                              {grade.total}/100
                            </span>
                          </div>
                          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-secondary h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, grade.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Standing Grade */}
                      <td className="py-3.5 px-space-md">
                        <span
                          className={`grade-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${grade.gradeClass}`}
                        >
                          {grade.iconType === 'star' ? (
                            <span className="material-symbols-outlined text-[14px]">star</span>
                          ) : grade.iconType === 'warning' ? (
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          )}
                          {grade.gradeLabel}
                        </span>
                      </td>

                      {/* Faculty Actions */}
                      <td className="py-3.5 px-space-md text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenDossier(student)}
                            className="p-1.5 rounded-md hover:bg-surface-container text-primary transition-colors cursor-pointer"
                            title="Allowed for Faculty: Edit Full Dossier"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenRemarks(student)}
                            className="p-1.5 rounded-md hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title="Add Faculty Remarks"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              chat_bubble_outline
                            </span>
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(student)}
                            className="p-1.5 rounded-md hover:bg-error-container text-error transition-colors cursor-pointer"
                            title="Delete Record (Generates Audit Trail)"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-space-md bg-surface-container-lowest flex flex-wrap items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant border-t border-surface-container">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[16px]">info</span>
              <span>
                Showing {students.length} of {students.length} enrolled students for MCA Advanced DBMS Lab (MCA-302)
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono text-outline text-[11px]">
              <span>SQL: SELECT * FROM marks WHERE course_code = &apos;MCA302&apos; FOR UPDATE;</span>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Security Matrix, Weightage Donut & Recent Activity */}
        <div className="flex flex-col gap-space-md">
          {/* 1. Security & Grant Matrix */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-3 border border-surface-container-low">
            <div className="flex items-center gap-2 text-primary font-title-md text-title-md font-bold">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
              Security &amp; Grant Matrix
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5 font-label-sm text-label-sm">
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-semibold">Current Context</span>
                <span className="font-mono text-primary font-bold">ROLE_FACULTY_LEAD</span>
              </div>
              <div className="font-mono text-on-surface-variant text-[11px] leading-relaxed mt-1 p-2 rounded bg-surface-container-lowest border border-surface-container-high/30">
                Permission Level: Faculty/Admin (Write: ALL_TABLES, UPDATE: marks, INSERT: students,
                DELETE: with_audit_log)
              </div>
            </div>

            <div className="flex flex-col gap-2 font-label-sm text-label-sm text-on-surface-variant">
              <div className="flex items-center justify-between py-1 border-b border-surface-container">
                <span>Direct Mark Override</span>
                <span className="text-secondary font-semibold">GRANTED</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-surface-container">
                <span>Student Deletion</span>
                <span className="text-secondary font-semibold">AUDITED</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-surface-container">
                <span>Bulk CSV Import</span>
                <span className="text-secondary font-semibold">ALLOWED</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Lock Final Semester</span>
                <span className="text-tertiary font-semibold">PENDING_HOD</span>
              </div>
            </div>
          </div>

          {/* 2. Course Evaluation Weightage */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-3 border border-surface-container-low">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                Course Evaluation Weightage
              </h3>
              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                MCA-302
              </span>
            </div>

            <div className="flex items-center justify-center p-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4.5"
                  ></path>
                  <path
                    className="text-primary transition-all duration-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="40, 100"
                    strokeLinecap="round"
                    strokeWidth="4.5"
                  ></path>
                  <path
                    className="text-secondary transition-all duration-500"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="60, 100"
                    strokeDashoffset="-40"
                    strokeLinecap="round"
                    strokeWidth="4.5"
                  ></path>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">
                    100
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Marks Total</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-label-sm text-label-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  Internal Continuous (40%)
                </span>
                <span className="font-semibold text-on-surface font-mono">40 Marks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  End-Term Theory &amp; Viva (60%)
                </span>
                <span className="font-semibold text-on-surface font-mono">60 Marks</span>
              </div>
            </div>
          </div>

          {/* 3. Recent Faculty Activity */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-2.5 border border-surface-container-low">
            <div className="flex items-center justify-between text-on-surface font-title-md text-title-md font-bold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">history</span>
                Recent Faculty Activity
              </div>
              <span className="text-[11px] text-outline font-normal">Live Log</span>
            </div>

            <div className="flex flex-col gap-2 font-body-sm text-body-sm text-on-surface-variant max-h-72 overflow-y-auto">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2 p-2 rounded bg-surface-container-low">
                  <span
                    className={`material-symbols-outlined text-[16px] mt-0.5 ${
                      act.type === 'grade'
                        ? 'text-secondary'
                        : act.type === 'verified'
                        ? 'text-primary'
                        : act.type === 'student'
                        ? 'text-tertiary'
                        : 'text-outline'
                    }`}
                  >
                    {act.type === 'grade'
                      ? 'check'
                      : act.type === 'verified'
                      ? 'edit_calendar'
                      : act.type === 'student'
                      ? 'person_add'
                      : 'security'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface text-[12px] truncate">{act.title}</p>
                    <p className="text-[11px] text-outline truncate">{act.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">person_add</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Add Student to MCA Roster
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCommitAddStudent} className="p-space-md flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md font-medium text-on-surface">
                    Roll Number
                  </label>
                  <input
                    required
                    type="text"
                    value={newRoll}
                    onChange={(e) => setNewRoll(e.target.value.toUpperCase())}
                    placeholder="MCA004"
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md font-medium text-on-surface">
                    Semester
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(parseInt(e.target.value, 10))}
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md outline-none"
                  >
                    <option value={3}>Semester III</option>
                    <option value={1}>Semester I</option>
                    <option value={2}>Semester II</option>
                    <option value={4}>Semester IV</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Institutional Email
                </label>
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ananya.r@student.mca.edu"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md font-medium text-on-surface">
                    Initial Internal (Max 40)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={newInternal}
                    onChange={(e) => setNewInternal(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md font-medium text-on-surface">
                    Initial End-Term (Max 60)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newExternal}
                    onChange={(e) => setNewExternal(parseFloat(e.target.value) || 0)}
                    className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-surface-container flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">storage</span>
                <span>
                  Action executes parameterized INSERT into{' '}
                  <code className="text-primary font-mono font-bold">students</code> and{' '}
                  <code className="text-primary font-mono font-bold">marks</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-tint shadow-md transition-all cursor-pointer"
                >
                  Commit Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remarks Modal */}
      {showRemarksModal && selectedStudentForRemarks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">rate_review</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Faculty Academic Remarks
                </h3>
              </div>
              <button
                onClick={() => setShowRemarksModal(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md flex flex-col gap-3">
              <p className="font-label-md text-label-md text-on-surface-variant">
                Feedback &amp; assessment commentary for{' '}
                <span className="font-bold text-on-surface">
                  {selectedStudentForRemarks.name} ({selectedStudentForRemarks.roll})
                </span>
              </p>

              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                rows={4}
                placeholder="Enter evaluation remarks, practical laboratory assessment observations, or attendance alerts..."
                className="w-full p-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md text-body-md outline-none resize-none"
              ></textarea>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowRemarksModal(false)}
                  className="px-4 py-2 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveRemarks}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-tint shadow cursor-pointer"
                >
                  Save Remarks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-error/20">
            <div className="p-space-md bg-error-container/30 flex items-center justify-between border-b border-error/20">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[22px]">warning</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">Audit Action Required</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md flex flex-col gap-3">
              <p className="font-body-md text-on-surface">
                Are you sure you want to delete{' '}
                <span className="font-bold text-on-surface">{showDeleteModal.name}</span> (
                <span className="font-mono text-primary font-semibold">{showDeleteModal.roll}</span>
                ) from the grading roster?
              </p>
              <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-outline text-[12px] font-mono leading-relaxed">
                Notice: Cascading removal from `marks` table. Record will be preserved in `audit_logs`
                with teacher timestamp.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-error text-on-error font-label-lg font-semibold hover:bg-error/90 shadow cursor-pointer"
                >
                  Confirm Delete &amp; Write Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Grade Entry Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-surface-container">
            <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">edit_note</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Bulk Grade Entry &amp; Curve Adjustments
                </h3>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-container cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-space-md flex flex-col gap-4">
              <p className="font-body-md text-on-surface-variant">
                Perform rapid curve adjustments or moderation for MCA Semester III (MCA302).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => {
                    students.forEach((s) => {
                      const newInt = Math.min(40, s.internal + 2);
                      onUpdateMarks(s.id, newInt, s.external);
                    });
                    onAddActivity('Moderation Applied', '+2 marks applied across Continuous Assessment', 'grade');
                    triggerSaveToast();
                    setShowBulkModal(false);
                  }}
                  className="p-3 rounded-lg border border-surface-container-high hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer flex flex-col gap-1"
                >
                  <span className="font-title-md text-primary font-bold">+2 Grace (Internal)</span>
                  <span className="font-body-sm text-outline text-[12px]">
                    Boosts continuous lab performance by 2 marks
                  </span>
                </div>

                <div
                  onClick={() => {
                    students.forEach((s) => {
                      const newExt = Math.min(60, s.external + 3);
                      onUpdateMarks(s.id, s.internal, newExt);
                    });
                    onAddActivity('Viva Moderation', '+3 marks viva voce curve adjustment', 'grade');
                    triggerSaveToast();
                    setShowBulkModal(false);
                  }}
                  className="p-3 rounded-lg border border-surface-container-high hover:border-secondary hover:bg-surface-container-low transition-all cursor-pointer flex flex-col gap-1"
                >
                  <span className="font-title-md text-secondary font-bold">+3 Curve (End-Term)</span>
                  <span className="font-body-sm text-outline text-[12px]">
                    Compensates viva rubric standardization
                  </span>
                </div>

                <div
                  onClick={() => {
                    students.forEach((s) => {
                      // Normalize
                      onUpdateMarks(s.id, Math.round(s.internal), Math.round(s.external));
                    });
                    onAddActivity('Decimal Normalization', 'Rounded marks to whole numerals', 'system');
                    triggerSaveToast();
                    setShowBulkModal(false);
                  }}
                  className="p-3 rounded-lg border border-surface-container-high hover:border-tertiary hover:bg-surface-container-low transition-all cursor-pointer flex flex-col gap-1"
                >
                  <span className="font-title-md text-tertiary font-bold">Round Integers</span>
                  <span className="font-body-sm text-outline text-[12px]">
                    Eliminates half marks for final registry export
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
