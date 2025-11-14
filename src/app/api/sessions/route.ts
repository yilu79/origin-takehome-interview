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
    
    const response = NextResponse.json(result);
    
    // Add cache headers for performance (revalidate every 30 seconds)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60');
    
    return response;
  } catch (error) {
    console.error('Database error in GET /api/sessions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sessions',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Enhanced validation with better error messages
    const validated = createSessionSchema.parse(body);
    
    // Business logic validation: Check if therapist and patient exist
    const [therapistExists, patientExists] = await Promise.all([
      db.select({ id: therapists.id }).from(therapists).where(eq(therapists.id, validated.therapist_id)).limit(1),
      db.select({ id: patients.id }).from(patients).where(eq(patients.id, validated.patient_id)).limit(1)
    ]);
    
    if (therapistExists.length === 0) {
      return NextResponse.json(
        { error: 'Invalid therapist ID' },
        { status: 400 }
      );
    }
    
    if (patientExists.length === 0) {
      return NextResponse.json(
        { error: 'Invalid patient ID' },
        { status: 400 }
      );
    }
    
    // Insert with optimized single query for complete data
    const [newSession] = await db
      .insert(sessions)
      .values({
        therapist_id: validated.therapist_id,
        patient_id: validated.patient_id,
        date: new Date(validated.date),
        status: 'Scheduled',
      })
      .returning();

    if (!newSession) {
      return NextResponse.json(
        { error: 'Failed to create session - no session returned' },
        { status: 500 }
      );
    }

    // Fetch the complete session with related data in a single optimized query
    const [completeSession] = await db
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
      .where(eq(sessions.id, newSession.id))
      .limit(1);

    const response = NextResponse.json(completeSession, { status: 201 });
    
    // Invalidate cache on creation
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  } catch (error) {
    console.error('Database error in POST /api/sessions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues.map((err) => ({ 
            field: err.path.join('.'), 
            message: err.message 
          }))
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create session',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}