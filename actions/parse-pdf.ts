'use server';

export async function parsePDF(formData: FormData): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
        const m = await import('pdf-parse');
        const pdf = (m as any).PDFParse || (m as any).default || m;

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, error: 'No file provided' };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const parsedData = await pdf(buffer);

        return { success: true, text: parsedData.text };
    } catch (error: any) {
        console.error('PDF Parse Error:', error);
        return { success: false, error: error.message || 'Failed to parse file' };
    }
}
