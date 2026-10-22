import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onSwitchRole?: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignoutNotice, setShowSignoutNotice] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Analytics & Overview';
      case 'students':
        return 'Student Directory';
      case 'teacher-workspace':
        return 'MCA';
      case 'quiz-test':
        return 'Class Quiz Test';
      case 'ai-study-quiz':
        return 'AI Study & Quiz Architect';
      case 'student-portal':
        return 'Student Portal';
      default:
        return 'MCA';
    }
  };

  const handleSignOutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowSignoutNotice(true);
    setTimeout(() => setShowSignoutNotice(false), 3000);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 lg:px-space-lg border-b border-surface-container-low">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-space-sm">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <span className="material-symbols-outlined text-outline text-[18px]">school</span>
        <div className="flex items-center gap-1.5 font-label-md text-label-md">
          <span className="text-on-surface-variant hidden sm:inline">Academic Workspace</span>
          <span className="text-outline-variant hidden sm:inline">/</span>
          <span className="text-primary font-medium">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Right: Status badge & User profile */}
      <div className="flex items-center gap-3 lg:gap-space-md">
        {/* System Online badge */}
        <div className="hidden sm:flex items-center gap-2 px-space-sm py-1 rounded-full bg-secondary-container/20 text-on-secondary-container">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
          </span>
          <span className="font-label-sm text-label-sm font-medium">System Online</span>
        </div>

        {/* User profile */}
        <div className="relative">
          <div
            className="flex items-center gap-space-sm pl-space-sm cursor-pointer select-none"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="flex flex-col text-right hidden md:flex">
              <div className="flex items-center gap-1.5 justify-end">
                <span className="font-title-md text-title-md text-on-surface font-semibold">
                  Vikas Kumar (VK)
                </span>
                <span className="px-1.5 py-0.5 rounded font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed-variant font-medium">
                  Admin
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant text-[11px]">
                Student Records
              </span>
            </div>

            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover shadow-[0_1px_4px_rgba(0,0,0,0.08)] ring-2 ring-primary/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWgeFwct9I9TsG00HP2ws3sv37e070sLqciqZ1Ay0-Sue1wN44DF8SXziTpJb3ZGfwe7UHqkxqZbLZH-HfD4RDLJMzgFbn4cZhb_X9qGKjFvHLe-tptWuSAVIRyrPc8nJLOAxj8n4wCxrAUFrAjS_mtwO747SHD5RypB6za90HOuI2RD21PV3Am3SelRoLNggAomUtTxvUu-nk5pxA5ZdQ4-mp-YYaQ74bUa7DkO0dNAiVnjxkxNqF"
              onError={(e) => {
                // Fallback avatar
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />

            <button
              onClick={handleSignOutClick}
              className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-1.5 rounded-lg hover:bg-surface-container"
              title="Sign out / Switch Session"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>

          {/* Quick Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container-low p-2 z-50 text-left">
              <div className="p-2 border-b border-surface-container-low">
                <p className="font-title-md text-on-surface font-bold">Prof. Vikas Kumar</p>
                <p className="text-body-sm text-outline">vikas.kumar@university.edu</p>
                <span className="inline-block mt-1 font-mono text-[10px] bg-secondary-fixed/30 text-on-secondary-fixed-variant px-1.5 py-0.5 rounded">
                  Faculty ID: #TCH-8802
                </span>
              </div>
              <div className="py-1">
                <div className="px-2 py-1.5 text-label-sm text-outline font-semibold uppercase">
                  Current Session
                </div>
                <div className="px-2 py-1 text-body-sm text-on-surface flex justify-between">
                  <span>Course Assigned</span>
                  <span className="font-mono text-primary font-bold">MCA-302</span>
                </div>
                <div className="px-2 py-1 text-body-sm text-on-surface flex justify-between">
                  <span>Semester</span>
                  <span className="font-semibold">Semester III</span>
                </div>
                <div className="px-2 py-1 text-body-sm text-on-surface flex justify-between">
                  <span>Active Session Lock</span>
                  <span className="text-secondary font-medium">autocommit=1</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign out Notice Toast */}
      {showSignoutNotice && (
        <div className="fixed top-20 right-6 bg-surface-container-lowest border border-primary/20 shadow-xl rounded-xl p-3 z-50 flex items-center gap-2 text-on-surface text-body-sm animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          <div>
            <p className="font-semibold">DBMS Session Cleanly Synced</p>
            <p className="text-outline text-[11px]">Ready to lock session or switch faculty credentials.</p>
          </div>
        </div>
      )}
    </header>
  );
};
