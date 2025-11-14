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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);
    
    // Enhanced validation for session ID
    if (isNaN(sessionId) || sessionId <= 0) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const validated = updateSessionSchema.parse(body);
    
    // Check if session exists before attempting update
    const existingSession = await db
      .select({ id: sessions.id, status: sessions.status })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);
    
    if (existingSession.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Prevent unnecessary updates
    if (existingSession.length > 0 && existingSession[0]?.status === validated.status) {
      return NextResponse.json(
        { message: 'Session already has the requested status', session: existingSession[0] },
        { status: 200 }
      );
    }
    
    // Update session status with optimized query
    const [updatedSession] = await db
      .update(sessions)
      .set({ status: validated.status })
      .where(eq(sessions.id, sessionId))
      .returning();
    
    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    const response = NextResponse.json({
      message: 'Session updated successfully',
      session: updatedSession
    });
    
    // Invalidate cache on update
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  } catch (error) {
    console.error('Database error in PATCH /api/sessions/[id]:', error);
    
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
        error: 'Failed to update session',
        message: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}