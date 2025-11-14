import { pgTable, serial, text, integer, timestamp, date } from 'drizzle-orm/pg-core';

export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty'),
});

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  dob: date('dob'),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  therapist_id: integer('therapist_id').notNull(),
  patient_id: integer('patient_id').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull().default('Scheduled'),
});