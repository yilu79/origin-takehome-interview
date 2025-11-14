// __tests__/utils/test-utils.tsx
import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { SessionWithDetails } from "../../src/types";

// Mock data for tests
export const mockTherapists = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Physical Therapy" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Occupational Therapy" },
  { id: 3, name: "Dr. Emily Davis", specialty: "Speech Therapy" },
];

export const mockPatients = [
  { id: 1, name: "John Smith", dob: "1985-03-15" },
  { id: 2, name: "Emma Wilson", dob: "1992-07-22" },
  { id: 3, name: "David Brown", dob: "1978-11-08" },
];

export const mockSessions: SessionWithDetails[] = [
  {
    id: 1,
    therapist_id: 1,
    patient_id: 1,
    date: new Date("2025-11-15T09:00:00Z"),
    status: "Scheduled" as const,
    therapist_name: "Dr. Sarah Johnson",
    patient_name: "John Smith",
  },
  {
    id: 2,
    therapist_id: 2,
    patient_id: 2,
    date: new Date("2025-11-16T14:30:00Z"),
    status: "Completed" as const,
    therapist_name: "Dr. Michael Chen",
    patient_name: "Emma Wilson",
  },
  {
    id: 3,
    therapist_id: 1,
    patient_id: 3,
    date: new Date("2025-11-17T11:00:00Z"),
    status: "Scheduled" as const,
    therapist_name: "Dr. Sarah Johnson",
    patient_name: "David Brown",
  },
];

export const mockSessionsWithMissingData: SessionWithDetails[] = [
  {
    id: 1,
    therapist_id: 1,
    patient_id: 1,
    date: new Date("2025-11-15T09:00:00Z"),
    status: "Scheduled" as const,
    therapist_name: "",
    patient_name: "John Smith",
  },
  {
    id: 2,
    therapist_id: 2,
    patient_id: 2,
    date: new Date("2025-11-16T14:30:00Z"),
    status: "Completed" as const,
    therapist_name: "Dr. Sarah Johnson",
    patient_name: "",
  },
];

export const mockSessionsWithInvalidDate: SessionWithDetails[] = [
  {
    id: 1,
    therapist_id: 1,
    patient_id: 1,
    date: "invalid-date" as any,
    status: "Scheduled" as const,
    therapist_name: "Dr. Sarah Johnson",
    patient_name: "John Smith",
  },
];

// Custom render function that includes any providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Helper function to simulate fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
};

// Helper to wait for async operations
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
