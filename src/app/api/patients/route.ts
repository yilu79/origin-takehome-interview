import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/schema';

// GET /api/patients - Fetch all patients
export async function GET() {
  try {
    const result = await db
      .select({
        id: patients.id,
        name: patients.name,
        dob: patients.dob,
      })
      .from(patients)
      .orderBy(patients.name);
    
    const response = NextResponse.json(result);
    
    // Cache patients data for longer since it changes infrequently
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    
    return response;
  } catch (error) {
    console.error('Database error in GET /api/patients:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch patients',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}