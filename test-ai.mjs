import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

async function test() {
  try {
    const result = await streamText({
      model: google('gemini-1.5-pro-latest'),
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log("Success streaming text!");
  } catch (e) {
    console.error("Crash!", e);
  }
}
test();
