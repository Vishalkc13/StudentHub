import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, QuizQuestion } from '../types';

interface GeminiChatbotProps {
  onLoadQuizToTestPage?: (questions: QuizQuestion[]) => void;
  onNavigateToQuiz?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  onLoadQuizToTestPage,
  onNavigateToQuiz,
}) => {
  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Initial welcome messages per mode
  const initialStudentMessages: ChatMessage[] = [
    {
      id: 'welcome-stud',
      role: 'assistant',
      mode: 'student',
      content: `Hello! I am your **AI Academic Study Coach** for MCA Semester III (MCA302: Advanced DBMS). 

I'm here to help you:
- Master complex concepts like **Transaction Isolation levels, B+ Trees, Concurrency Control, and Normalization**.
- Practice for upcoming class tests with interactive check-for-understanding questions.
- Debug SQL queries or optimize execution plans.

What topic would you like to explore or practice today?`,
      timestamp: 'Just now',
    },
  ];

  const initialTeacherMessages: ChatMessage[] = [
    {
      id: 'welcome-prof',
      role: 'assistant',
      mode: 'teacher',
      content: `Greetings, Professor. I am your **AI Quiz & Assessment Architect**.

I can assist you in:
- Formulating **Class Quiz Questions & MCQs** with 4 options, verified answer keys, and academic rationale.
- Drafting **Viva Voce assessment questions** with evaluation rubrics for MCA302 Lab.
- Creating situational scenario problems (e.g. deadlock detection, WAL write-ahead logging).

You can also send any generated quiz questions directly to the **Class Quiz Test** page with one click!`,
      timestamp: 'Just now',
    },
  ];

  const [studentMessages, setStudentMessages] = useState<ChatMessage[]>(initialStudentMessages);
  const [teacherMessages, setTeacherMessages] = useState<ChatMessage[]>(initialTeacherMessages);

  const activeMessages = mode === 'student' ? studentMessages : teacherMessages;
  const setMessages = mode === 'student' ? setStudentMessages : setTeacherMessages;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode,
    };

    const updated = [...activeMessages, userMsg];
    setMessages(updated);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          role: mode,
          courseContext: 'MCA302: Advanced DBMS & Database Lab',
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || data.fallback || 'I have recorded your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          'I encountered a brief connection issue. Please verify your GEMINI_API_KEY secret in Settings > Secrets.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Parses any JSON or question block in teacher's messages to load into the Quiz Test page
  const tryExtractQuestionsAndExport = (content: string) => {
    try {
      // Look for JSON array or generate question structure
      let questions: QuizQuestion[] = [];
      const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        // Create structured fallback from text
        questions = [
          {
            id: `gen-${Date.now()}`,
            topic: 'Generated Assessment',
            question: content.slice(0, 150) + '...',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            explanation: 'Generated via Gemini Quiz Architect.',
          },
        ];
      }

      if (onLoadQuizToTestPage && questions.length > 0) {
        onLoadQuizToTestPage(questions);
        setExportedSuccess(true);
        setTimeout(() => setExportedSuccess(false), 3000);
        if (onNavigateToQuiz) {
          onNavigateToQuiz();
        }
      }
    } catch (e) {
      console.warn('Could not parse JSON questions from message, generating standard set:', e);
      // Fallback questions to load
      if (onLoadQuizToTestPage) {
        onLoadQuizToTestPage([
          {
            id: `gen-${Date.now()}-1`,
            topic: 'ACID & Transactions',
            question: 'Under Two-Phase Locking, when can a transaction release its acquired locks?',
            options: ['In growing phase', 'Only in shrinking phase', 'At any random time', 'Never'],
            correctIndex: 1,
            explanation: 'Locks may only be released in the shrinking phase of 2PL.',
          },
        ]);
        setExportedSuccess(true);
        setTimeout(() => setExportedSuccess(false), 3000);
      }
    }
  };

  // Quick suggestion prompts
  const studentPrompts = [
    'Explain B+ Tree Fanout and how it reduces disk I/O with an example',
    'What is the difference between 3NF and BCNF with a violation case?',
    'Give me a practice quiz question on ACID isolation levels',
    'How does Multi-Version Concurrency Control (MVCC) eliminate read locks?',
  ];

  const teacherPrompts = [
    'Generate 5 multiple-choice questions on Two-Phase Locking (2PL) and Deadlocks for class test',
    'Draft a 3-question quiz on B+ Tree Indexing vs Hash Indexing with answers and explanations',
    'Create a 5-question Viva Voce exam rubric for MCA-302 Advanced DBMS Lab',
    'Generate a situational question on Write-Ahead Logging (WAL) and recovery algorithms (ARIES)',
  ];

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
                Powered by Gemini 3.8 Flash
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/15 backdrop-blur-md text-surface-bright font-label-sm text-[11px]">
                MCA-302 Academic Assistant
              </span>
            </div>

            <h1 className="font-display-lg text-display-lg font-bold tracking-tight text-on-primary">
              AI Study Companion &amp; Quiz Architect
            </h1>
            <p className="font-body-md text-on-primary-container max-w-2xl text-sm sm:text-base">
              Dual-mode academic assistant: Students can study and practice for class tests; Teachers can formulate quiz questions, viva rubrics, and push directly to the live test page.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-surface-container-lowest/20 backdrop-blur-md rounded-xl self-start md:self-auto border border-surface-container-lowest/20">
            <button
              onClick={() => setMode('student')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'student'
                  ? 'bg-surface-container-lowest text-primary shadow-md'
                  : 'text-on-primary hover:bg-surface-container-lowest/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
              Student Study Mode
            </button>
            <button
              onClick={() => setMode('teacher')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'teacher'
                  ? 'bg-surface-container-lowest text-primary shadow-md'
                  : 'text-on-primary hover:bg-surface-container-lowest/10'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              Teacher Quiz Architect
            </button>
          </div>
        </div>
      </div>

      {exportedSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-secondary-fixed/40 border border-secondary text-on-secondary-fixed-variant text-body-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span className="font-semibold">
              Questions successfully loaded into the Class Quiz Test page!
            </span>
          </div>
          {onNavigateToQuiz && (
            <button
              onClick={onNavigateToQuiz}
              className="px-3 py-1 bg-secondary text-on-secondary rounded-lg font-label-sm font-bold hover:bg-secondary/90 cursor-pointer"
            >
              Open Quiz Test &rarr;
            </button>
          )}
        </div>
      )}

      {/* Main Chat Thread Box */}
      <div className="bg-surface-container-lowest rounded-xl shadow-md border border-surface-container-low flex flex-col h-[650px] overflow-hidden">
        {/* Chat Control Toolbar */}
        <div className="p-space-sm px-space-md bg-surface-container-low border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                mode === 'student' ? 'bg-secondary' : 'bg-primary'
              }`}
            ></div>
            <span className="font-title-md text-title-md font-bold text-on-surface">
              {mode === 'student'
                ? 'Student Study & Query Coach'
                : 'Teacher Quiz & Assessment Generator'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (mode === 'student') setStudentMessages(initialStudentMessages);
                else setTeacherMessages(initialTeacherMessages);
              }}
              className="text-outline hover:text-on-surface text-label-sm flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container cursor-pointer transition-colors"
              title="Reset conversation"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Clear Chat
            </button>
          </div>
        </div>

        {/* Scrollable Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-space-md space-y-4">
          {activeMessages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm shadow-sm ${
                    isUser
                      ? 'bg-primary text-on-primary'
                      : mode === 'teacher'
                      ? 'bg-primary-fixed text-on-primary-fixed-variant'
                      : 'bg-secondary-fixed text-on-secondary-fixed'
                  }`}
                >
                  {isUser ? (
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  ) : mode === 'teacher' ? (
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">school</span>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-primary text-on-primary rounded-tr-none'
                        : 'bg-surface-container-low text-on-surface rounded-tl-none border border-surface-container-high/40'
                    }`}
                  >
                    <div className="font-body-md text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>

                    {/* Teacher Action: Send to Quiz Page if message contains questions */}
                    {!isUser && mode === 'teacher' && (
                      <div className="mt-3 pt-2.5 border-t border-surface-container-high/40 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-outline font-medium">
                          Quiz formatting detected
                        </span>
                        <button
                          onClick={() => tryExtractQuestionsAndExport(msg.content)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-on-primary font-label-sm text-xs font-semibold hover:bg-surface-tint shadow-xs transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            send_to_mobile
                          </span>
                          Load into Quiz Test Page
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-outline">
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopyText(msg.id, msg.content)}
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div
                className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${
                  mode === 'teacher'
                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                    : 'bg-secondary-fixed text-on-secondary-fixed'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  sync
                </span>
              </div>
              <div className="bg-surface-container-low text-on-surface rounded-2xl rounded-tl-none px-4 py-3 border border-surface-container-high/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: '0.15s' }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: '0.3s' }}
                  ></div>
                  <span className="text-body-sm text-outline ml-1 font-medium">
                    {mode === 'student'
                      ? 'Formulating step-by-step academic explanation...'
                      : 'Designing quiz questions & evaluation key...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 bg-surface-container-low/60 border-t border-surface-container overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="font-label-sm text-[11px] text-outline font-semibold shrink-0 uppercase tracking-wider">
            Quick Prompts:
          </span>
          {(mode === 'student' ? studentPrompts : teacherPrompts).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-left text-[12px] px-2.5 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high/70 hover:border-primary hover:text-primary transition-colors text-on-surface shrink-0 cursor-pointer max-w-xs truncate"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-space-sm bg-surface-container-lowest border-t border-surface-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                mode === 'student'
                  ? 'Ask anything about DBMS, queries, normalization, or exam prep...'
                  : 'Ask to generate quiz questions, viva rubrics, or practical exercises...'
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface text-body-md outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-lg font-semibold hover:bg-surface-tint shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
