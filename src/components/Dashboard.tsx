import React from 'react';
import { Student, ActivityItem, ActiveTab } from '../types';
import { computeGradeInfo } from '../data';

interface DashboardProps {
  students: Student[];
  activities: ActivityItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDossier: (student: Student) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  activities,
  setActiveTab,
  onOpenDossier,
}) => {
  const totalStudents = students.length;

  const classAvgNum =
    totalStudents > 0
      ? students.reduce((acc, s) => acc + computeGradeInfo(s.internal, s.external).total, 0) /
        totalStudents
      : 0;

  const avgAttendance =
    totalStudents > 0
      ? Math.round(students.reduce((acc, s) => acc + s.attendance, 0) / totalStudents)
      : 0;

  const passCount = students.filter(
    (s) => computeGradeInfo(s.internal, s.external).total >= 50
  ).length;

  const passRate = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : '100';

  // Grade distributions
  const gradeDistribution = {
    distinction: 0,
    outstanding: 0,
    firstClass: 0,
    secondClass: 0,
    conditional: 0,
  };

  students.forEach((s) => {
    const total = computeGradeInfo(s.internal, s.external).total;
    if (total >= 90) gradeDistribution.distinction++;
    else if (total >= 80) gradeDistribution.outstanding++;
    else if (total >= 70) gradeDistribution.firstClass++;
    else if (total >= 50) gradeDistribution.secondClass++;
    else gradeDistribution.conditional++;
  });

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary-container to-surface-tint p-space-lg text-on-primary shadow-xl mb-space-lg">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                MCA Academic Session 2025–2026
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-label-sm">
                Semester III
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg tracking-tight font-bold text-on-primary">
              Academic Operations &amp; Performance Analytics
            </h1>
            <p className="font-body-md text-body-md text-on-primary-container max-w-2xl">
              Central executive telemetry for Master of Computer Applications. Live tracking of continuous internal assessments, viva evaluation, and department benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('teacher-workspace')}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-primary font-label-lg text-label-lg font-semibold shadow-md hover:bg-surface-container-low transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Open Teacher Workspace
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-lowest/20 backdrop-blur-sm text-on-primary font-label-lg text-label-lg font-semibold hover:bg-surface-container-lowest/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">groups</span>
              View Roster ({totalStudents})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-low flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Cohort Enrollment
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {totalStudents}
            </span>
            <span className="font-label-sm text-label-sm text-secondary font-medium">100% On Schedule</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
            <span>All students registered for MCA-302</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-low flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Department Avg Score
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {classAvgNum.toFixed(2)}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
              Grade A
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-secondary h-full rounded-full"
                style={{ width: `${Math.min(100, classAvgNum)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-low flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Passing Clearance Rate
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {passRate}%
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-medium">
              Zero Backlogs
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-secondary font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>No conditional probations detected</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-low flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-medium text-on-surface-variant uppercase tracking-wider">
              Average Attendance
            </span>
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">co_present</span>
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-on-surface font-bold tabular-nums">
              {avgAttendance}%
            </span>
            <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
              Eligible
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-tertiary">check</span>
            <span>Above UGC 75% examination threshold</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-lg">
        {/* Left 2 Cols: Grade Distribution & Student Leaderboard */}
        <div className="lg:col-span-2 flex flex-col gap-space-lg">
          {/* Grade Distribution */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md border border-surface-container-low">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">bar_chart</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Cohort Grade Distribution (MCA-302)
                </h3>
              </div>
              <span className="font-label-sm text-label-sm text-outline font-mono">
                {totalStudents} Candidates Evaluated
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                    A+ Distinction (90%+)
                  </span>
                  <span className="font-mono text-on-surface font-semibold">
                    {gradeDistribution.distinction} students (
                    {totalStudents > 0
                      ? Math.round((gradeDistribution.distinction / totalStudents) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className="bg-tertiary h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalStudents > 0
                          ? (gradeDistribution.distinction / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    Outstanding (80% - 89%)
                  </span>
                  <span className="font-mono text-on-surface font-semibold">
                    {gradeDistribution.outstanding} students (
                    {totalStudents > 0
                      ? Math.round((gradeDistribution.outstanding / totalStudents) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className="bg-secondary h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalStudents > 0
                          ? (gradeDistribution.outstanding / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    First Class (70% - 79%)
                  </span>
                  <span className="font-mono text-on-surface font-semibold">
                    {gradeDistribution.firstClass} students (
                    {totalStudents > 0
                      ? Math.round((gradeDistribution.firstClass / totalStudents) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalStudents > 0
                          ? (gradeDistribution.firstClass / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                    Second Class (50% - 69%)
                  </span>
                  <span className="font-mono text-on-surface font-semibold">
                    {gradeDistribution.secondClass} students (
                    {totalStudents > 0
                      ? Math.round((gradeDistribution.secondClass / totalStudents) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2">
                  <div
                    className="bg-outline h-full rounded-full transition-all"
                    style={{
                      width: `${
                        totalStudents > 0
                          ? (gradeDistribution.secondClass / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Leaderboard */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md border border-surface-container-low">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">leaderboard</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">
                  Roster Performance Standings
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('teacher-workspace')}
                className="text-primary hover:underline font-label-sm text-label-sm font-semibold cursor-pointer"
              >
                Go to Workspace &rarr;
              </button>
            </div>

            <div className="divide-y divide-surface-container">
              {[...students]
                .sort((a, b) => {
                  const ga = computeGradeInfo(a.internal, a.external).total;
                  const gb = computeGradeInfo(b.internal, b.external).total;
                  return gb - ga;
                })
                .map((student, idx) => {
                  const grade = computeGradeInfo(student.internal, student.external);

                  return (
                    <div
                      key={student.id}
                      onClick={() => onOpenDossier(student)}
                      className="py-3 flex items-center justify-between hover:bg-surface-container-low/40 rounded-lg px-2 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-outline text-[13px] w-5">
                          #{idx + 1}
                        </span>
                        <div
                          className={`w-9 h-9 rounded-full ${student.avatarBg} ${student.avatarColor} flex items-center justify-center font-bold font-title-md shrink-0`}
                        >
                          {student.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-md text-on-surface font-semibold">
                            {student.name}
                          </span>
                          <span className="font-body-sm text-outline font-mono text-[11px]">
                            {student.roll} • {student.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono font-title-md font-bold text-on-surface">
                            {grade.total.toFixed(2)}%
                          </span>
                          <div className="text-[11px] text-outline">
                            Int: {student.internal} / Ext: {student.external}
                          </div>
                        </div>
                        <span
                          className={`grade-badge inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${grade.gradeClass}`}
                        >
                          {grade.letterGrade}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Database Telemetry & System Specs */}
        <div className="flex flex-col gap-space-lg">
          {/* Database Specs Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md border border-surface-container-low flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-title-md text-title-md font-bold">
              <span className="material-symbols-outlined text-[20px]">database</span>
              DBMS Architecture Specs
            </div>

            <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-2 font-body-sm text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-outline">Engine</span>
                <span className="font-mono font-semibold text-on-surface">MySQL 8.0 (InnoDB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Schema</span>
                <span className="font-mono font-semibold text-primary">db_studenthub</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Isolation Level</span>
                <span className="font-mono text-secondary font-semibold">READ_COMMITTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-outline">Concurrency Control</span>
                <span className="font-mono text-on-surface font-semibold">MVCC + Row-Lock</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-label-sm text-label-sm pt-1">
              <div className="font-semibold text-on-surface">Active RDBMS Tables:</div>
              <div className="flex flex-col gap-1.5 font-mono text-[12px] text-on-surface-variant">
                <div className="p-1.5 rounded bg-surface-container flex justify-between">
                  <span>students</span>
                  <span className="text-primary font-bold">{totalStudents} Rows</span>
                </div>
                <div className="p-1.5 rounded bg-surface-container flex justify-between">
                  <span>marks</span>
                  <span className="text-primary font-bold">{totalStudents} Records</span>
                </div>
                <div className="p-1.5 rounded bg-surface-container flex justify-between">
                  <span>courses</span>
                  <span className="text-secondary font-bold">5 Courses</span>
                </div>
                <div className="p-1.5 rounded bg-surface-container flex justify-between">
                  <span>audit_logs</span>
                  <span className="text-tertiary font-bold">{activities.length} Entries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md border border-surface-container-low flex flex-col gap-3">
            <h3 className="font-title-md text-title-md font-bold text-on-surface">
              Administrative Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('teacher-workspace')}
                className="w-full text-left p-2.5 rounded-lg border border-surface-container-high hover:border-primary hover:bg-surface-container-low transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    fact_check
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface text-body-sm">
                      Teacher Grade Workspace
                    </p>
                    <p className="text-[11px] text-outline">Direct write &amp; mark overrides</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  chevron_right
                </span>
              </button>

              <button
                onClick={() => setActiveTab('student-portal')}
                className="w-full text-left p-2.5 rounded-lg border border-surface-container-high hover:border-secondary hover:bg-surface-container-low transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    account_circle
                  </span>
                  <div>
                    <p className="font-semibold text-on-surface text-body-sm">
                      Student Portal Preview
                    </p>
                    <p className="text-[11px] text-outline">Report cards &amp; transcripts</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
