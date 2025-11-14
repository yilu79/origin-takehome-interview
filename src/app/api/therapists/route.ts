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
    
    const response = NextResponse.json(result);
    
    // Cache therapists data for longer since it changes infrequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    
    return response;
  } catch (error) {
    console.error('Database error in GET /api/therapists:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch therapists',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}