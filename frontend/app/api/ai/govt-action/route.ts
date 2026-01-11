import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/ai/govt-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Govt Action API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get government action' },
      { status: 500 }
    );
  }
}