import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { computeGradeInfo } from '../data';

interface StudentDossierDrawerProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (updatedStudent: Student) => void;
}

export const StudentDossierDrawer: React.FC<StudentDossierDrawerProps> = ({
  student,
  isOpen,
  onClose,
  onSaveStudent,
}) => {
  const [formData, setFormData] = useState<Student | null>(null);

  useEffect(() => {
    if (student) {
      setFormData({ ...student });
    }
  }, [student]);

  if (!isOpen || !formData) return null;

  const grade = computeGradeInfo(formData.internal, formData.external);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveStudent(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-inverse-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-surface-container"
      >
        <div>
          {/* Header */}
          <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${formData.avatarBg} ${formData.avatarColor} flex items-center justify-center font-bold text-base`}
              >
                {formData.initials}
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  {formData.name}
                </h3>
                <span className="font-mono text-outline font-semibold text-label-sm">
                  {formData.roll} • Semester {formData.semester}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form */}
          <form id="dossierForm" onSubmit={handleSubmit} className="p-space-md flex flex-col gap-4">
            {/* Academic Standing Banner */}
            <div className="p-space-sm rounded-xl bg-surface-container-low border border-surface-container-high/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-outline uppercase font-semibold block">
                  Current Assessment Standing
                </span>
                <span className="font-title-md font-bold text-on-surface">
                  {grade.total.toFixed(2)}% ({grade.gradeLabel})
                </span>
              </div>
              <span className="font-mono text-primary font-bold text-lg bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm">
                Grade {grade.letterGrade}
              </span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={formData.roll}
                  onChange={(e) =>
                    setFormData({ ...formData, roll: e.target.value.toUpperCase() })
                  }
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Internal (Max 40)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={formData.internal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      internal: Math.min(40, Math.max(0, parseFloat(e.target.value) || 0)),
                    })
                  }
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  End-Term (Max 60)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  value={formData.external}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      external: Math.min(60, Math.max(0, parseFloat(e.target.value) || 0)),
                    })
                  }
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-medium text-on-surface">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attendance: Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
                    })
                  }
                  className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-mono text-body-md outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-medium text-on-surface">
                Parent / Guardian
              </label>
              <input
                type="text"
                value={formData.guardian || ''}
                onChange={(e) => setFormData({ ...formData, guardian: e.target.value })}
                placeholder="Guardian name"
                className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-medium text-on-surface">
                Address
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Residential Address"
                className="px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md font-medium text-on-surface">
                Faculty Remarks &amp; Feedback
              </label>
              <textarea
                rows={3}
                value={formData.remarks || ''}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        {/* Footer actions */}
        <div className="p-space-md bg-surface-container-low border-t border-surface-container flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-label-lg text-on-surface-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dossierForm"
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-lg font-semibold hover:bg-surface-tint shadow transition-all cursor-pointer"
          >
            Save Dossier Changes
          </button>
        </div>
      </div>
    </div>
  );
};
