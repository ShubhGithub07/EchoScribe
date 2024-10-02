import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure API key is available
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const result = await model.generateContent([
      'Transcribe the following audio:',
      {
        inlineData: {
          mimeType: file.type,
          data: Buffer.from(buffer).toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const transcript = response.text();

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: `Error processing audio: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}