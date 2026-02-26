export type FileData = {
    id: string;
    name: string; // e.g., "Physics_Chap1.pdf"
    content: string; // The extracted text
};

export type Subject = {
    id: string; // e.g., "physics"
    name: string; // "Physics"
    files: FileData[]; // Array of uploaded files
};
