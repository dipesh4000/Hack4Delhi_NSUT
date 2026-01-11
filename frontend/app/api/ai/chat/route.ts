
import { NextResponse } from 'next/server';
import { generateGrokResponse, GrokMessage } from '@/lib/grok';

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const systemPrompt = `
You are the "WardAir AI Assistant", a helpful and knowledgeable AI for the Delhi Pollution Control Authority.
Your goal is to help citizens understand air quality, health risks, and government actions.

Current Context:
AQI: ${context?.aqi || 'Unknown'}
Location: ${context?.location || 'Delhi'}
Status: ${context?.status || 'Unknown'}

Guidelines:
- **FORMATTING IS CRITICAL**: Always use bullet points, numbered lists, and bold headers.
- **DO NOT** write long paragraphs. Break text into small, readable chunks.
- **Structure**:
  - **Header**: Brief summary.
  - **Points**: Key details in a list.
  - **Action**: What the user should do.
- Be polite, concise, and helpful.
- Explain technical terms simply.
- If asked about medical advice, give general suggestions but advise consulting a doctor.
- Use the provided context to give relevant answers.
- If you don't know something, admit it.
`;

    const messages: GrokMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await generateGrokResponse(messages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
