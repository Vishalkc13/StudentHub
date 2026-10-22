import React, { useState } from 'react';
import { Student } from '../types';
import { computeGradeInfo } from '../data';

interface StudentsViewProps {
  students: Student[];
  onOpenDossier: (student: Student) => void;
  onOpenAddModal: () => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onOpenDossier,
  onOpenAddModal,
  onDeleteStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStanding, setFilterStanding] = useState('ALL');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStanding === 'ALL') return true;
    const grade = computeGradeInfo(s.internal, s.external);
    if (filterStanding === 'DISTINCTION') return grade.total >= 90;
    if (filterStanding === 'OUTSTANDING') return grade.total >= 80 && grade.total < 90;
    if (filterStanding === 'FIRST_CLASS') return grade.total >= 70 && grade.total < 80;
    if (filterStanding === 'PASS') return grade.total >= 50 && grade.total < 70;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
            MCA Student Directory &amp; Records
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Official cohort roster for Master of Computer Applications (MCA Batch 2026).
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-md hover:bg-surface-tint transition-all cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          + Add Student
        </button>
      </div>

      {/* Filter and Search Utility Belt */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-space-sm bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-low mb-space-lg">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students by name, roll no, or institutional email..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Roster' },
            { id: 'DISTINCTION', label: 'Distinction' },
            { id: 'OUTSTANDING', label: 'Outstanding' },
            { id: 'FIRST_CLASS', label: 'First Class' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStanding(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterStanding === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-surface-container-low">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/70 font-label-sm text-label-sm uppercase text-outline tracking-wider">
                <th className="py-3 px-space-md">Student Profile</th>
                <th className="py-3 px-space-md">Roll No</th>
                <th className="py-3 px-space-md">Attendance</th>
                <th className="py-3 px-space-md">Course</th>
                <th className="py-3 px-space-md">Marks (100)</th>
                <th className="py-3 px-space-md">Standing</th>
                <th className="py-3 px-space-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-body-md text-body-md">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-outline">
                    <span className="material-symbols-outlined text-[36px] text-outline-variant mb-2 block">
                      search_off
                    </span>
                    No students match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const grade = computeGradeInfo(student.internal, student.external);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-surface-container-low/50 transition-colors group"
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

                      {/* Attendance */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-on-surface">
                            {student.attendance}%
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              student.attendance >= 90
                                ? 'bg-secondary'
                                : student.attendance >= 75
                                ? 'bg-tertiary'
                                : 'bg-error'
                            }`}
                          ></span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-space-md">
                        <span className="font-mono font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
                          {student.courseCode}
                        </span>
                      </td>

                      {/* Total Marks */}
                      <td className="py-3.5 px-space-md">
                        <div className="flex flex-col gap-1 w-24">
                          <span className="font-mono font-title-md font-bold text-on-surface">
                            {grade.total.toFixed(2)}%
                          </span>
                          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-secondary h-full rounded-full"
                              style={{ width: `${Math.min(100, grade.total)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Standing */}
                      <td className="py-3.5 px-space-md">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${grade.gradeClass}`}
                        >
                          {grade.gradeLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-space-md text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenDossier(student)}
                            className="p-1.5 rounded-md hover:bg-surface-container text-primary transition-colors cursor-pointer"
                            title="View Full Academic Dossier"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              account_box
                            </span>
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 rounded-md hover:bg-error-container text-error transition-colors cursor-pointer"
                            title="Remove Student"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-lowest flex items-center justify-between border-t border-surface-container font-label-sm text-outline">
          <span>
            Displaying {filteredStudents.length} of {students.length} students
          </span>
          <span className="font-mono">Roster Engine: PostgreSQL / MySQL Synchronized</span>
        </div>
      </div>
    </div>
  );
};
