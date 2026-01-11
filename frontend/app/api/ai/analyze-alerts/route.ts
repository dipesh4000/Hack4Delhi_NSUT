
import { NextResponse } from 'next/server';
import { analyzeAlertWithGrok, AlertAnalysisRequest } from '@/lib/grok';

export async function POST(req: Request) {
  try {
    const data: AlertAnalysisRequest = await req.json();

    // Basic validation
    if (data.aqi === undefined) {
      return NextResponse.json({ error: 'AQI data is required' }, { status: 400 });
    }

    const analysis = await analyzeAlertWithGrok(data);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Alert Analysis API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
