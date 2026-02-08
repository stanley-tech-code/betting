
import { NextResponse } from 'next/server';
import { syncPropellerStats } from '@/lib/ai-syncer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const action = searchParams.get('action');

  if (action === 'sync') {
    const result = await syncPropellerStats(date || undefined);
    return NextResponse.json(result);
  }

  return NextResponse.json({ message: 'AI Sync Endpoint Ready. Use ?action=sync' });
}
