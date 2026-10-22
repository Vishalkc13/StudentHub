├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # AI Studio application metadata
├── package.json                 # Project dependencies and run scripts
├── server.ts                    # Express server with Vite middleware & Gemini API routes
├── src/
│   ├── App.tsx                  # Main application orchestrator & tab routing
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Tailwind theme tokens & typography classes
│   ├── types.ts                 # TypeScript interfaces (Student, Quiz, Chat)
│   ├── data.ts                  # Default syllabus data, courses, & calculations
│   └── components/
│       ├── Sidebar.tsx          # Navigation sidebar & DBMS telemetry card
│       ├── Header.tsx           # Breadcrumbs, system status, & faculty profile
│       ├── TeacherWorkspace.tsx # Interactive grade entry & evaluation table
│       ├── QuizTestPage.tsx     # Timed quiz simulator, grading & review
│       ├── GeminiChatbot.tsx    # Dual-mode AI study coach & quiz generator
│       ├── Dashboard.tsx        # Department performance KPIs & charts
│       ├── StudentsView.tsx     # Searchable cohort directory
│       ├── StudentPortal.tsx    # Printable report card & SGPA calculator
│       └── StudentDossierDrawer.tsx # Slide-out profile & dossier editor
└── tsconfig.json                # TypeScript configuration
