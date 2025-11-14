/**
 * Database Seeding Script
 * 
 * Adds sample data to the database:
 * - 5 additional therapists
 * - 7 additional patients
 * - 10 additional sessions
 * 
 * Run: npx tsx scripts/seed-data.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, integer, timestamp, date } from 'drizzle-orm/pg-core';

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.error('Please create a .env.local file with your database connection string');
  process.exit(1);
}

// Define schema inline
const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty'),
});

const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  dob: date('dob'),
});

const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  therapist_id: integer('therapist_id').notNull(),
  patient_id: integer('patient_id').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull().default('Scheduled'),
});

// Setup database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema: { therapists, patients, sessions } });

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Add 5 more therapists
    console.log('👨‍⚕️ Adding therapists...');
    const newTherapists = await db.insert(therapists).values([
      {
        name: 'Dr. Emily Martinez',
        specialty: 'Child Psychology',
      },
      {
        name: 'Dr. Michael Chen',
        specialty: 'Cognitive Behavioral Therapy',
      },
      {
        name: 'Dr. Rachel Thompson',
        specialty: 'Family Therapy',
      },
      {
        name: 'Dr. James Wilson',
        specialty: 'Trauma Therapy',
      },
      {
        name: 'Dr. Lisa Anderson',
        specialty: 'Addiction Counseling',
      },
    ]).returning();
    
    console.log(`✅ Added ${newTherapists.length} therapists`);
    newTherapists.forEach(t => console.log(`   - ${t.name} (${t.specialty})`));

    // Add 7 more patients
    console.log('\n👥 Adding patients...');
    const newPatients = await db.insert(patients).values([
      {
        name: 'Sarah Mitchell',
        dob: '1995-03-15',
      },
      {
        name: 'David Rodriguez',
        dob: '1988-07-22',
      },
      {
        name: 'Jennifer Lee',
        dob: '1992-11-08',
      },
      {
        name: 'Robert Taylor',
        dob: '1985-05-30',
      },
      {
        name: 'Amanda White',
        dob: '1998-09-12',
      },
      {
        name: 'Christopher Brown',
        dob: '1990-01-25',
      },
      {
        name: 'Michelle Garcia',
        dob: '1987-12-18',
      },
    ]).returning();
    
    console.log(`✅ Added ${newPatients.length} patients`);
    newPatients.forEach(p => console.log(`   - ${p.name}`));

    // Get all therapists and patients for session creation
    const allTherapists = await db.select().from(therapists);
    const allPatients = await db.select().from(patients);

    console.log(`\n📊 Total therapists in database: ${allTherapists.length}`);
    console.log(`📊 Total patients in database: ${allPatients.length}`);

    // Add 10 more sessions with varied dates and statuses
    console.log('\n📅 Adding sessions...');
    const newSessions = await db.insert(sessions).values([
      {
        therapist_id: allTherapists[2]?.id || 1,
        patient_id: allPatients[3]?.id || 1,
        date: new Date('2025-11-14T09:00:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[3]?.id || 2,
        patient_id: allPatients[4]?.id || 2,
        date: new Date('2025-11-14T14:30:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[4]?.id || 1,
        patient_id: allPatients[5]?.id || 3,
        date: new Date('2025-11-15T10:00:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[5]?.id || 2,
        patient_id: allPatients[6]?.id || 4,
        date: new Date('2025-11-15T15:00:00Z'),
        status: 'Completed',
      },
      {
        therapist_id: allTherapists[6]?.id || 1,
        patient_id: allPatients[7]?.id || 5,
        date: new Date('2025-11-16T11:00:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[2]?.id || 2,
        patient_id: allPatients[8]?.id || 6,
        date: new Date('2025-11-16T13:30:00Z'),
        status: 'Completed',
      },
      {
        therapist_id: allTherapists[3]?.id || 1,
        patient_id: allPatients[9]?.id || 7,
        date: new Date('2025-11-18T09:30:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[4]?.id || 2,
        patient_id: allPatients[3]?.id || 1,
        date: new Date('2025-11-18T14:00:00Z'),
        status: 'Scheduled',
      },
      {
        therapist_id: allTherapists[5]?.id || 1,
        patient_id: allPatients[5]?.id || 3,
        date: new Date('2025-11-19T10:30:00Z'),
        status: 'Completed',
      },
      {
        therapist_id: allTherapists[6]?.id || 2,
        patient_id: allPatients[7]?.id || 5,
        date: new Date('2025-11-19T16:00:00Z'),
        status: 'Scheduled',
      },
    ]).returning();
    
    console.log(`✅ Added ${newSessions.length} sessions`);
    newSessions.forEach((s, i) => {
      const therapist = allTherapists.find(t => t.id === s.therapist_id);
      const patient = allPatients.find(p => p.id === s.patient_id);
      console.log(`   ${i + 1}. ${therapist?.name} → ${patient?.name} (${s.status})`);
    });

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Therapists: ${allTherapists.length} total`);
    console.log(`   - Patients: ${allPatients.length} total`);
    console.log(`   - Sessions: Added ${newSessions.length} new sessions`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seeding function
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error);
    process.exit(1);
  });
