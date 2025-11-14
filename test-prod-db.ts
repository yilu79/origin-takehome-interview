import { db } from './src/lib/db';
import { sessions, therapists, patients } from './src/lib/schema';
import { eq } from 'drizzle-orm';

async function testDB() {
  try {
    console.log('Testing database connection in production mode...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
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
    
    console.log('Success! Found', result.length, 'sessions');
    console.log('First session:', JSON.stringify(result[0], null, 2));
  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  }
}

testDB();
