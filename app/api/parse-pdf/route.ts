export const runtime = 'nodejs'; // Force Node.js runtime instead of Edge
import { NextRequest, NextResponse } from 'next/server';

// Next.js strips DOM elements from server runtimes. Polyfill them to prevent pdf-parse from crashing.
if (typeof global !== 'undefined') {
    (global as any).DOMMatrix = (global as any).DOMMatrix || function () { };
    (global as any).Path2D = (global as any).Path2D || function () { };
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Bypass pdf-parse index.js "isDebugMode = !module.parent" which crashes in Webpack bundles
        const pdf = require('pdf-parse/lib/pdf-parse.js');
        const parsedData = await pdf(buffer);

        return NextResponse.json({ success: true, text: parsedData.text });
    } catch (error: any) {
        console.error('PDF Parse API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to parse PDF' },
            { status: 500 }
        );
    }
}
