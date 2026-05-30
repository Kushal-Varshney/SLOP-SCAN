import { NextRequest, NextResponse } from 'next/server';
import { analyzeText, analyzeAllTracks } from '@/lib/engine';
import { TrackId } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, track, allTracks } = body as { text?: string; track?: TrackId; allTracks?: boolean };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json({ error: 'Text too long (max 50,000 characters)' }, { status: 400 });
    }

    const result = analyzeText(text.trim(), track);

    if (allTracks) {
      result.trackScores = analyzeAllTracks(text.trim());
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
