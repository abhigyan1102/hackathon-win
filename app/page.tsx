'use client';

import { useNotesStore } from '../store/useNotesStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { UploadCloud, MessageSquare, Loader2 } from 'lucide-react';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { v4 as uuidv4 } from 'uuid';

export default function Dashboard() {
  const subjects = useNotesStore((state) => state.subjects);
  const addFileToSubject = useNotesStore((state) => state.addFileToSubject);
  const [activeTab, setActiveTab] = useState(subjects[0]?.id || 'physics');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSubject = subjects.find(s => s.id === activeTab) || subjects[0];

  // Get the active subject's text to send to the AI
  const activeSubjectContextString = activeSubject?.files?.map(f => `Source File: ${f.name}\n${f.content}`).join('\n\n') || '';

  // Use a ref so the transport body function always reads the latest context
  const contextRef = useRef(activeSubjectContextString);
  contextRef.current = activeSubjectContextString;

  const [chatTransport] = useState(() => new DefaultChatTransport({
    api: '/api/chat',
    body: () => ({ context: contextRef.current }),
  }));

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    onError: (err) => {
      console.error('Chat Error:', err);
      alert('Chat Error: ' + err.message);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const append = (msg: { role: 'user'; content: string }) => {
    if (isLoading) return;
    sendMessage({ text: msg.content });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to parse file');
      }

      const fileId = uuidv4();
      addFileToSubject(activeSubject.id, {
        id: fileId,
        name: file.name,
        content: data.text,
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert(error.message || 'Failed to upload and parse file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Subject Manager</h1>
            <p className="text-zinc-400">Upload notes and chat with your AI copilot.</p>
          </div>

        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {subjects.map((subject) => (
              <TabsTrigger
                key={subject.id}
                value={subject.id}
                className="rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 transition-all"
              >
                {subject.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Files & Upload */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-blue-400" />
                      Notes
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Upload your PDF or TXT files for {activeSubject.name}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer group relative"
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.txt"
                        disabled={isUploading}
                      />
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-zinc-800 rounded-full group-hover:scale-110 transition-transform">
                          {isUploading ? (
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                          ) : (
                            <UploadCloud className="w-6 h-6 text-blue-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-zinc-300">
                        {isUploading ? 'Parsing...' : 'Click or drop files here'}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">PDF, TXT up to 10MB</p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Uploaded Files</h4>
                      {activeSubject.files.length === 0 ? (
                        <p className="text-sm text-zinc-600 block bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                          No files uploaded yet.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {activeSubject.files.map((file) => (
                            <li key={file.id} className="text-sm bg-zinc-800 p-3 rounded-lg border border-zinc-700 flex items-center justify-between">
                              <span className="truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded">Ready</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Chat Interface */}
              <div className="lg:col-span-2">
                <Card className="bg-zinc-900 border-zinc-800 text-white shadow-xl h-[600px] flex flex-col">
                  <CardHeader className="border-b border-zinc-800 pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      Chat with {activeSubject.name} Context
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Ask questions about the uploaded notes. The AI responds strictly based on context.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-zinc-500">
                          Upload files to start asking questions.
                        </div>
                      ) : (
                        messages.map((m: any) => {
                          // Extract raw text from v3 UIMessage parts
                          const rawText = (m.parts || [])
                            .filter((p: any) => p.type === 'text')
                            .map((p: any) => p.text)
                            .join('');

                          let displayText = rawText;
                          let citationText: string | null = null;

                          if (m.role === 'assistant') {
                            try {
                              const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                              const parsed = JSON.parse(cleanJson);
                              displayText = parsed.answer || rawText;
                              if (parsed.citation && parsed.citation.trim() !== '') {
                                citationText = parsed.citation;
                              }
                            } catch (e) {
                              // Fallback for streaming or non-JSON responses (like Quizzes)
                              displayText = rawText;
                            }
                          }

                          return (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`rounded-xl px-4 py-3 max-w-[85%] whitespace-pre-wrap ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-md'}`}>
                                {displayText}
                                {citationText && (
                                  <p className="mt-2 text-xs text-zinc-400 border-t border-zinc-700 pt-2">
                                    📄 Source: {citationText}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-400 animate-pulse">
                            Thinking...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          append({
                            role: 'user',
                            content: 'Generate a study guide based STRICTLY on the uploaded notes. Put the ENTIRE study guide formatted in Markdown inside the "answer" field of your JSON response. Include: 1) 5 Multiple-Choice Questions with explanations. 2) 3 short-answer questions. You MUST include citations.'
                          });
                        }}
                        disabled={isLoading}
                        className="rounded-md bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 disabled:opacity-50 mb-2 w-full"
                      >
                        Generate Quiz
                      </button>
                      <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 mt-4">
                        <input
                          className="flex-1 rounded-md bg-zinc-800 p-3 text-white focus:outline-none"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask a question..."
                          disabled={isLoading}
                        />
                        <button
                          type="submit"
                          disabled={isLoading || !input?.trim()}
                          className="rounded-md bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
