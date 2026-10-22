import React, { useState } from 'react';
import { Student } from '../types';
import { computeGradeInfo, studentTranscriptCourses } from '../data';

interface StudentPortalProps {
  students: Student[];
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ students }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students[0]?.id || ''
  );
  const [showPrintNotice, setShowPrintNotice] = useState(false);

  const currentStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  if (!currentStudent) {
    return (
      <div className="p-12 text-center text-outline">
        No student records found. Add students in the Teacher Workspace.
      </div>
    );
  }

  const currentGrade = computeGradeInfo(
    currentStudent.internal,
    currentStudent.external
  );

  // Compute SGPA across semester courses
  const allSemesterCourses = studentTranscriptCourses.map((c) => {
    if (c.dynamic) {
      return {
        code: c.code,
        name: `${c.name} (${currentStudent.courseCode})`,
        credits: c.credits,
        internal: currentStudent.internal,
        external: currentStudent.external,
        total: currentGrade.total,
        grade: currentGrade.letterGrade,
        points: currentGrade.gpa,
      };
    }
    return c;
  });

  const totalCredits = allSemesterCourses.reduce((acc, c) => acc + c.credits, 0);
  const weightedPoints = allSemesterCourses.reduce(
    (acc, c) => acc + c.credits * c.points,
    0
  );
  const sgpa = (weightedPoints / totalCredits).toFixed(2);

  const handlePrint = () => {
    setShowPrintNotice(true);
    setTimeout(() => {
      window.print();
      setShowPrintNotice(false);
    }, 500);
  };

  return (
    <div className="flex flex-col w-full pb-12 max-w-5xl mx-auto">
      {/* Student View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-low mb-space-lg">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full ${currentStudent.avatarBg} ${currentStudent.avatarColor} flex items-center justify-center font-bold text-lg`}
          >
            {currentStudent.initials}
          </div>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Student Self-Service Portal
            </h2>
            <p className="font-body-sm text-body-sm text-outline">
              Logged in as candidate: <span className="font-bold text-on-surface">{currentStudent.name}</span>
            </p>
          </div>
        </div>

        {/* Perspective Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="font-label-sm text-outline font-semibold">Switch Perspective:</span>
          <select
            value={currentStudent.id}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface font-label-md font-medium outline-none focus:ring-2 focus:ring-primary/20"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.roll})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm font-semibold hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            Print Grade Sheet
          </button>
        </div>
      </div>

      {showPrintNotice && (
        <div className="mb-4 p-3 rounded-lg bg-secondary-fixed/30 text-on-secondary-fixed-variant text-body-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">print</span>
          Preparing printable official grade sheet...
        </div>
      )}

      {/* Official Grade Card Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-low overflow-hidden print:border-0 print:shadow-none">
        {/* Institutional Header */}
        <div className="p-space-lg bg-gradient-to-b from-surface-container-low to-surface-container-lowest border-b border-surface-container flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
            <span className="material-symbols-outlined text-[28px]">school</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
            DEPARTMENT OF COMPUTER APPLICATIONS
          </h2>
          <p className="font-label-md text-label-md text-on-surface-variant">
            Master of Computer Applications (MCA) • Examination Session 2025–2026
          </p>
          <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold text-label-sm">
            SEMESTER III PROVISIONAL GRADE STATEMENT
          </span>
        </div>

        {/* Student Metadata Strip */}
        <div className="p-space-md grid grid-cols-2 md:grid-cols-4 gap-4 bg-surface-container-low/40 border-b border-surface-container text-body-sm">
          <div>
            <span className="text-outline text-label-sm block uppercase font-semibold">Student Name</span>
            <span className="font-title-md text-on-surface font-bold">{currentStudent.name}</span>
          </div>
          <div>
            <span className="text-outline text-label-sm block uppercase font-semibold">University Roll No</span>
            <span className="font-mono text-primary font-bold">{currentStudent.roll}</span>
          </div>
          <div>
            <span className="text-outline text-label-sm block uppercase font-semibold">Academic Standing</span>
            <span className="font-semibold text-secondary">{currentGrade.gradeLabel}</span>
          </div>
          <div>
            <span className="text-outline text-label-sm block uppercase font-semibold">Overall Semester GPA</span>
            <span className="font-mono font-bold text-primary text-base">{sgpa} / 10.0</span>
          </div>
        </div>

        {/* Summary Highlights */}
        <div className="p-space-md grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-surface-container">
          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
            <div>
              <span className="text-[11px] text-outline uppercase font-semibold block">
                Total Credits Earned
              </span>
              <span className="font-title-md text-on-surface font-bold font-mono">
                {totalCredits} Credits
              </span>
            </div>
            <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
            <div>
              <span className="text-[11px] text-outline uppercase font-semibold block">
                Attendance Standing
              </span>
              <span className="font-title-md text-on-surface font-bold font-mono">
                {currentStudent.attendance}% (Eligible)
              </span>
            </div>
            <span className="material-symbols-outlined text-secondary text-[24px]">co_present</span>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
            <div>
              <span className="text-[11px] text-outline uppercase font-semibold block">
                Result Status
              </span>
              <span className="font-title-md text-secondary font-bold">
                PASSED WITH DISTINCTION
              </span>
            </div>
            <span className="material-symbols-outlined text-tertiary text-[24px]">military_tech</span>
          </div>
        </div>

        {/* Detailed Course Breakdown Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80 font-label-sm text-label-sm uppercase text-outline tracking-wider border-b border-surface-container">
                <th className="py-3 px-space-md">Course Code</th>
                <th className="py-3 px-space-md">Course Title</th>
                <th className="py-3 px-space-md text-center">Credits</th>
                <th className="py-3 px-space-md text-center">Internal (40)</th>
                <th className="py-3 px-space-md text-center">End-Term (60)</th>
                <th className="py-3 px-space-md text-center">Total (100)</th>
                <th className="py-3 px-space-md text-center">Grade</th>
                <th className="py-3 px-space-md text-right">Grade Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-body-md text-body-md">
              {allSemesterCourses.map((c) => (
                <tr
                  key={c.code}
                  className={`hover:bg-surface-container-low/30 transition-colors ${
                    c.code === 'MCA302' ? 'bg-primary-fixed/20 font-medium' : ''
                  }`}
                >
                  <td className="py-3 px-space-md font-mono font-bold text-primary">
                    {c.code}
                  </td>
                  <td className="py-3 px-space-md text-on-surface">
                    {c.name}
                    {c.code === 'MCA302' && (
                      <span className="ml-2 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary text-on-primary">
                        Live Graded
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-space-md text-center font-mono">{c.credits}</td>
                  <td className="py-3 px-space-md text-center font-mono">{c.internal}</td>
                  <td className="py-3 px-space-md text-center font-mono">{c.external}</td>
                  <td className="py-3 px-space-md text-center font-mono font-bold text-on-surface">
                    {c.total}%
                  </td>
                  <td className="py-3 px-space-md text-center">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface text-label-sm">
                      {c.grade}
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-right font-mono font-bold text-primary">
                    {c.points.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Faculty Remarks & Verification Footer */}
        <div className="p-space-lg bg-surface-container-low/50 border-t border-surface-container flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
          <div className="flex items-start gap-3 max-w-xl">
            <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">
              format_quote
            </span>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
                Official Faculty Remarks (Prof. Vikas Kumar, Faculty Coordinator):
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-1">
                &ldquo;{currentStudent.remarks || 'Commendable academic effort throughout Semester III.'}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-col text-right font-mono text-[11px] text-outline self-end md:self-center">
            <span className="font-semibold text-on-surface">Verification Seal</span>
            <span>Digital Hash: SHA256:7b2e...991c</span>
            <span>Controller of Examinations, MCA Dept.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
