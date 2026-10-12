import { NextRequest, NextResponse } from 'next/server';

const XAI_URL = 'https://api.x.ai/v1/chat/completions';

interface AiSummaryBody {
  type?: 'dashboard' | 'department';
  data?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'XAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { type = 'dashboard', data = {} }: AiSummaryBody = await request.json();

    const contextLabel =
      type === 'department'
        ? 'department view (employees and shifts of one department)'
        : 'executive dashboard (requests, shifts, budget, staffing alerts)';

    const response = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || 'grok-3-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an operations analyst for HubOffice, a medical-center staff management system. ' +
              'Write a concise, actionable executive summary in Hebrew (right-to-left). ' +
              'Use short bullet points. Highlight urgent items first: pending approvals, ' +
              'uncovered shifts, and budget concerns. Do not invent data that is not provided.',
          },
          {
            role: 'user',
            content:
              `Analyze this ${contextLabel} data and give me a short summary with key insights:\n` +
              JSON.stringify(data, null, 2),
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('xAI error:', response.status, errText);
      return NextResponse.json(
        { error: `AI request failed (${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const summary = result?.choices?.[0]?.message?.content;

    if (!summary) {
      return NextResponse.json(
        { error: 'Empty response from AI' },
        { status: 502 }
      );
    }

    return NextResponse.json({ summary }, { status: 200 });
  } catch (error: any) {
    console.error('AI summary error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
