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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}