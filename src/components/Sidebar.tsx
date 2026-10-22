import React from 'react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  studentCount: number;
  quizQuestionsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  studentCount,
  quizQuestionsCount = 5,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: { id: ActiveTab; label: string; badge?: string | number; badgeColor?: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'students', label: 'Students', badge: studentCount, icon: 'groups' },
    { id: 'teacher-workspace', label: 'Teacher Workspace', icon: 'fact_check' },
    { id: 'quiz-test', label: 'Class Quiz Test', badge: `${quizQuestionsCount} Qs`, badgeColor: 'bg-secondary-container/40 text-on-secondary-container', icon: 'quiz' },
    { id: 'ai-study-quiz', label: 'AI Study & Quiz Bot', badge: 'Gemini', badgeColor: 'bg-primary-fixed text-on-primary-fixed-variant', icon: 'psychology' },
    { id: 'student-portal', label: 'Student Portal', icon: 'account_circle' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Logo & Brand Header */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container-low lg:border-b-0">
            <div
              className="flex items-center gap-space-sm cursor-pointer"
              onClick={() => setActiveTab('teacher-workspace')}
            >
              <img
                alt="StudentHub Logo"
                className="h-8 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida/AEtjO1Uz2Kh5sWBgY9gQjB_4Sl9oP9_YIuS5OszU9kHmIraidW2STvldh0ceZvyq5ZTY16WvRSS13Jyr3VEZNN7ZOj3wHjNyqVxuxFZsFiXSN4k0wJGLqahh4wA-fVrFOHkrHxJ0sTT-MrLHY8SR5LDe0B9NhDTrwvnfJFDRTxq2W2-J-MqDmTRfyUo2PiuAyJr56F2qyZv4vwkWObnhpstyWx22ICCQ2nW93peSfERavlkTLQE0IoIDvbo29HQ"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex lg:hidden items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate leading-none font-bold">
                  StudentHub
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">
                  Student Management System
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-outline hover:bg-surface-container"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-space-md pt-space-md">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline px-space-xs font-semibold">
              Navigation
            </span>
            <nav className="flex flex-col gap-space-xs mt-space-xs">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`group w-full flex items-center justify-between px-space-sm py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-surface-container-low text-primary font-title-md font-semibold relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-primary before:rounded-r"
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    <span className="font-label-lg text-label-lg flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-[18px] shrink-0">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full font-label-sm text-xs font-semibold shrink-0 ml-1.5 ${
                          isActive
                            ? 'bg-primary text-on-primary'
                            : item.badgeColor || 'bg-surface-container text-primary'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Database Status & Footer */}
        <div className="p-space-md flex flex-col gap-space-md">
          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-1.5 border border-outline-variant/30">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed-dim opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
              <span className="font-label-md text-label-md font-medium text-on-surface truncate">
                MySQL Database: Connected
              </span>
            </div>
            <div className="flex flex-col font-label-sm text-label-sm text-on-surface-variant pl-4">
              <span className="truncate">localhost:3306</span>
              <span className="font-mono text-outline truncate text-[11px]">db_studenthub</span>
            </div>
          </div>

          <div className="flex flex-col px-space-xs text-left">
            <span className="font-label-sm text-label-sm text-on-surface font-medium">
              DBMS Mini Project 2026
            </span>
            <span className="font-label-sm text-label-sm text-outline">
              MCA Dept. • v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
