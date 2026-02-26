import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        console.log('API Route Hit', {
            messageCount: messages?.length,
            hasContext: !!context,
            contextLength: context?.length || 0,
        });

        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: `You are a strict study assistant. Answer ONLY using the provided Context. You MUST respond in valid JSON format with the keys: "answer", "citation", "confidence", "evidence". If the answer is not in the context, set "answer" to EXACTLY: "Not found in your notes for this Subject".\n\nContext:\n${context || 'No context provided.'}`,
            messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error('API CRASH:', error);
        return new Response(error.message || 'Internal Server Error', {
            status: 500,
        });
    }
}
