import { InferSelectModel } from 'drizzle-orm';
import * as schema from '@/lib/schema';

export type Therapist = InferSelectModel<typeof schema.therapists>;
export type Patient = InferSelectModel<typeof schema.patients>;
export type Session = InferSelectModel<typeof schema.sessions>;

export type SessionWithDetails = Session & {
  therapist_name: string;
  patient_name: string;
};

export type SessionStatus = 'Scheduled' | 'Completed';