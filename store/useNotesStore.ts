import { create } from 'zustand';
import { Subject, FileData } from '../types';

interface NotesState {
    subjects: Subject[];
    addFileToSubject: (subjectId: string, fileData: FileData) => void;
}

const initialSubjects: Subject[] = [
    { id: 'physics', name: 'Physics', files: [] },
    { id: 'chemistry', name: 'Chemistry', files: [] },
    { id: 'math', name: 'Math', files: [] },
];

export const useNotesStore = create<NotesState>((set) => ({
    subjects: initialSubjects,
    addFileToSubject: (subjectId, fileData) =>
        set((state) => ({
            subjects: state.subjects.map((subject) =>
                subject.id === subjectId
                    ? { ...subject, files: [...subject.files, fileData] }
                    : subject
            ),
        })),
}));
