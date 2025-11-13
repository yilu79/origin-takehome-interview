import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sessions, therapists, patients } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// POST validation schema
const createSessionSchema = z.object({
  therapist_id: z.number().int().positive(),
  patient_id: z.number().int().positive(),
  date: z.string().datetime(), // ISO 8601 format
});

// GET /api/sessions - Fetch all sessions with therapist and patient names
export async function GET() {
  try {
    const result = await db
      .select({
        id: sessions.id,
        date: sessions.date,
        status: sessions.status,
        therapist_id: sessions.therapist_id,
        patient_id: sessions.patient_id,
        therapist_name: therapists.name,
        patient_name: patients.name,
      })
      .from(sessions)
      .leftJoin(therapists, eq(sessions.therapist_id, therapists.id))
      .leftJoin(patients, eq(sessions.patient_id, patients.id))
      .orderBy(sessions.date);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createSessionSchema.parse(body);
    
    // Insert with Drizzle
    const [newSession] = await db
      .insert(sessions)
      .values({
        therapist_id: validated.therapist_id,
        patient_id: validated.patient_id,
        date: new Date(validated.date),
        status: 'Scheduled'
      })
      .returning();
    
    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}