import { NextRequest, NextResponse } from 'next/server';
import { analyzeText } from '@/lib/engine';
import { findSimilarPairs } from '@/lib/engine/core/pattern-matcher';
import { TrackId } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { texts, track } = await req.json() as { texts?: string[]; track?: TrackId };

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts array is required' }, { status: 400 });
    }
    if (texts.length > 50) {
      return NextResponse.json({ error: 'Max 50 texts per batch' }, { status: 400 });
    }

    const results = texts.map(t => analyzeText(t.trim(), track));
    const similarPairs = findSimilarPairs(texts, 0.6);

    return NextResponse.json({ results, similarPairs });
  } catch (error) {
    console.error('Batch error:', error);
    return NextResponse.json({ error: 'Batch analysis failed' }, { status: 500 });
  }
}
