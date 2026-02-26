# Task List

## [x] Task 1: Main Dashboard Layout (Subject Manager)
Description: Create the main `app/page.tsx` layout. Build the Subject Manager using Shadcn Tabs for "Physics", "Chemistry", and "Math".
Expected Output: A centered dashboard with 3 distinct tabs, each showing an empty state for files and chat.
Validation Method: Renders correctly with Shadcn Tabs switching between subjects.

## [x] Task 2: File Upload Interface & Ingestion
Description: Add a drag-and-drop or file input area within each subject tab for PDF/TXT files. Wire it up to the `parsePDF` Server Action and save the extracted text + filename to the Zustand store.
Expected Output: A user can upload a file, and the Zustand state logs the new `FileData` under the correct subject.
Validation Method: Store accurately reflects uploaded files; `console.log` shows extracted text.

## [x] Task 3: Chat Interface & Context Injection
Description: Create the Chat UI (messages area + input) using Shadcn ScrollArea. Implement the strict context-injection system prompt using the Vercel AI SDK and Gemini 1.5 Pro.
Expected Output: The user can chat. System prompt gets injected with all text from the currently selected subject's files. The AI responds strictly with answers and citations.
Validation Method: AI correctly refuses non-notes questions and answers notes questions with `[Filename, Section]` citations format.

## [x] Task 4: Study Mode (Quiz Generator)
Description: Add a "Generate Quiz" button to the UI that fires a specific prompt to Gemini to create 5 MCQs and 3 Short-Answer Questions with citations.
Expected Output: structured quiz output appears in the chat or a separate modal.
Validation Method: Verify output includes correct answers, explanations, and accurate citations.