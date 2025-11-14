import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '@/lib/schema';

// Base types inferred from database schema
export type Therapist = InferSelectModel<typeof schema.therapists>;
export type Patient = InferSelectModel<typeof schema.patients>;
export type Session = InferSelectModel<typeof schema.sessions>;

// Insert types for form data
export type TherapistInsert = InferInsertModel<typeof schema.therapists>;
export type PatientInsert = InferInsertModel<typeof schema.patients>;
export type SessionInsert = InferInsertModel<typeof schema.sessions>;

// Enhanced session type with required related data
export type SessionWithDetails = Session & {
  readonly therapist_name: string;
  readonly patient_name: string;
};

// Strict session status enumeration
export type SessionStatus = 'Scheduled' | 'Completed';

// API Response types for better type safety
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Form types for better validation
export interface CreateSessionFormData {
  therapist_id: string;
  patient_id: string;
  date: string;
}

export interface SessionUpdateData {
  status: SessionStatus;
}

// Component prop types
export interface SessionTableProps {
  sessions: readonly SessionWithDetails[];
  onSessionUpdate: (sessionId: number) => void;
  onSessionUpdateError?: (sessionId: number, originalStatus: string) => void;
  loading?: boolean;
}

export interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Utility types for better type safety
export type NonEmptyArray<T> = [T, ...T[]];
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Date utility types
export type DateString = string; // ISO date string
export type TimestampString = string; // ISO datetime string

// Error types for better error handling
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface DatabaseError {
  message: string;
  code?: string | number;
  constraint?: string;
}