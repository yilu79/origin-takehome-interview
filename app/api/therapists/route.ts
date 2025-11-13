import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { therapists } from '@/lib/schema';

// GET /api/therapists - Fetch all therapists
export async function GET() {
  try {
    const result = await db
      .select({
        id: therapists.id,
        name: therapists.name,
        specialty: therapists.specialty,
      })
      .from(therapists)
      .orderBy(therapists.name);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch therapists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch therapists' },
      { status: 500 }
    );
  }
}