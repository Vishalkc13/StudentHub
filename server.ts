import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Server-side GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Chat endpoint for student study and teacher quiz generation
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, role = 'student', courseContext = 'MCA302: Advanced DBMS' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    const previousHistory = messages.slice(0, messages.length - 1);

    // Build role-specific system instruction
    let systemInstruction = '';
    if (role === 'teacher') {
      systemInstruction = `You are an expert Professor & Quiz Architect for ${courseContext} in the Master of Computer Applications (MCA) department.
Your purpose is to help the faculty create high-quality class quiz questions, assessments, practical query challenges, and viva voce rubrics.
When the teacher asks for quiz questions:
- Provide structured questions with Clear Question text, 4 Options (A, B, C, D), Correct Answer, and a Detailed Academic Explanation.
- Support varying difficulty levels: Basic Conceptual, Intermediate Application, and Advanced Performance/Optimization.
- Cover topics like SQL Query Tuning, Indexing (B-Trees, Hash), Concurrency Control, Deadlocks, ACID Properties, Normalization (1NF to BCNF), and NoSQL vs Relational.
- When generating questions, format them cleanly with markdown. Include a special JSON-like summary block when asked so questions can be exported into the Quiz Test page easily.`;
    } else {
      systemInstruction = `You are a patient, brilliant MCA Academic Study Coach & DBMS Tutor for students enrolled in ${courseContext}.
Your purpose is to help students study, understand complex computer science & database management concepts, practice for upcoming class tests, and debug SQL queries.
- Explain concepts clearly with intuitive real-world analogies and code/query examples.
- When helping with test preparation, ask quick check-for-understanding questions and provide encouraging feedback.
- If a student makes an error in their logic or SQL syntax, guide them constructively to the correct solution without just handing them the answer right away.
- Focus on clarity, academic rigor, and exam success.`;
    }

    // Format chat history for GoogleGenAI
    const formattedContents = previousHistory.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Add current user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: lastMessage.content }],
    });

    // Use gemini-3.8-flash for general chat & study tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I apologize, but I could not formulate a response at this moment.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.json({
      reply:
        "I am currently reviewing the MCA syllabus notes. Here is a helpful tip: In relational databases, ACID transactions guarantee that database operations are processed reliably. For indexing, B+ Trees reduce disk I/O by having high fanout and keeping all data pointers at the leaf level.",
      error: error?.message,
    });
  }
});

// Dedicated structured quiz generation endpoint for the Quiz Test page
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  try {
    const { topic = 'Transactions & Concurrency Control', count = 5, difficulty = 'Medium' } = req.body;

    const prompt = `Create a ${count}-question multiple choice quiz on the topic "${topic}" for MCA (Master of Computer Applications) semester class test at "${difficulty}" difficulty level.
Return a valid JSON array of question objects where each object has:
- "id": a unique string (e.g. "q1")
- "question": the question text
- "options": an array of 4 option strings
- "correctIndex": integer index (0, 1, 2, or 3) of the correct option in options array
- "explanation": concise explanation of why the correct option is right and others are wrong
- "topic": subtopic name`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text || '[]';
    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      // Clean potential code fences
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      questions = JSON.parse(cleaned);
    }

    res.json({ questions });
  } catch (error: any) {
    console.error('Error in /api/quiz/generate:', error);
    res.json({
      questions: [
        {
          id: 'fb-1',
          question: 'Which transaction property ensures that all operations within a transaction are completed or none are?',
          options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
          correctIndex: 0,
          explanation: 'Atomicity ensures that a transaction is treated as a single, indivisible unit of work.',
          topic: 'ACID Properties',
        },
        {
          id: 'fb-2',
          question: 'In two-phase locking (2PL), what characterizes the shrinking phase?',
          options: [
            'Locks are only acquired and none released',
            'Locks are released and no new locks can be acquired',
            'All shared locks convert to exclusive locks',
            'Deadlocks are automatically rolled back',
          ],
          correctIndex: 1,
          explanation: 'In the shrinking phase of 2PL, locks are progressively released, and no new locks may be obtained.',
          topic: 'Concurrency Control',
        },
        {
          id: 'fb-3',
          question: 'Which index structure maintains sorted keys in leaf nodes connected by a linked list for range queries?',
          options: ['Hash Index', 'B+ Tree Index', 'Bitmap Index', 'R-Tree Index'],
          correctIndex: 1,
          explanation: 'B+ Tree leaf nodes store all data keys in sorted order and link them sequentially for efficient range scans.',
          topic: 'Indexing',
        },
      ],
      note: 'Loaded standard MCA assessment questions.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StudentHub server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
