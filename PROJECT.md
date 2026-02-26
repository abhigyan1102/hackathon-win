# Project: AskMyNotes (Study Copilot)

## Goal
A subject-scoped RAG (Retrieval Augmented Generation) app where users chat with multiple PDF/TXT notes per subject.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind, Shadcn UI (Tabs, Cards, ScrollArea).
- **Backend:** Next.js Server Actions (for PDF parsing).
- **AI Engine:** Google Gemini 1.5 Pro (via Vercel AI SDK `streamObject` or `useChat`).
- **Parsing:** `pdf-parse` (for PDFs) and raw text handling.

## Data Structure (CRITICAL for Citations)
*We must store the filename to enable file-level citations.*
```typescript
type FileData = {
  id: string;
  name: string; // e.g., "Physics_Chap1.pdf"
  content: string; // The extracted text
};

type Subject = {
  id: string; // e.g., "physics"
  name: string; // "Physics"
  files: FileData[]; // Array of uploaded files
};
Core Features (Strictly per Problem Statement)
Subject Manager:

Create exactly 3 fixed buckets: Physics, Chemistry, Math.

The user must upload notes for each subject (PDF/TXT minimum; multiple files allowed per subject).

Subject-scoped Q&A: The user must be able to select one subject at a time and ask questions in a chat interface.

Ingestion Engine:

Upload PDF/TXT -> Extract Text -> Store in State (Client-side or LocalStorage for speed).

Requirement: Handle multiple files per subject and keep track of filenames for citations.

Strict Chat:

System Prompt: "You are a strict assistant. Answer ONLY using the provided Context."

Context Injection: When a subject is selected, inject ALL text from that subject's files into the prompt.

Output Format: JSON format with:

answer: string

citation: string (The filename + page/section)

confidence: "High" | "Medium" | "Low"

evidence: string (The top supporting snippet used to form the answer)

Study Mode:

A button "Generate Quiz" that triggers a predefined prompt for the Selected Subject.

Output 1: 5 Multiple-Choice Questions (MCQs) with Correct option and a brief explanation.

Output 2: 3 Short-Answer Questions with model answers.

Constraint: Must include citations for all generated content.

Constraints
Strict "Not Found" Handling: If the notes do not contain sufficient information to answer a question, the system must respond: "Not found in your notes for [Subject]" (No guessing or fabricated information).

CITATIONS ARE MANDATORY: Every answer must cite the specific uploaded file name and section.


---