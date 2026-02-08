
import { NextResponse } from 'next/server';
import { executeAIAction, AIActionRequest } from '@/lib/ai-action-executor';

export async function POST(request: Request) {
  try {
    const body: AIActionRequest = await request.json();

    // Basic validation
    if (!body.actionType || !body.campaignId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await executeAIAction(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Execution Endpoint Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
