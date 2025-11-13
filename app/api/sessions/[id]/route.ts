import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { sessions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// PATCH validation schema
const updateSessionSchema = z.object({
  status: z.enum(['Scheduled', 'Completed'])
});

// PATCH /api/sessions/[id] - Update session status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = parseInt(params.id);
    
    // Validate session ID
    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validated = updateSessionSchema.parse(body);
    
    const [updated] = await db
      .update(sessions)
      .set({ status: validated.status })
      .where(eq(sessions.id, sessionId))
      .returning();
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}