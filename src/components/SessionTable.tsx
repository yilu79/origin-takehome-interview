"use client";

import { useState, useCallback } from "react";
import type { SessionTableProps } from "@/types";
import { formatDate, apiCall } from "@/lib/utils";
import { CalendarIcon, SpinnerIcon, CheckIcon, UserIcon } from "./Icons";
import styles from "@/styles/components/SessionTable.module.css";

/**
 * SessionTable Component
 *
 * Displays therapy sessions in a responsive table format with desktop and mobile layouts.
 * Features optimistic UI updates, loading states, and action buttons for session management.
 *
 * @component
 * @param {SessionTableProps} props - Component properties
 * @param {readonly SessionWithDetails[]} props.sessions - Array of session data with therapist and patient details
 * @param {function} props.onSessionUpdate - Callback when session is successfully updated
 * @param {function} [props.onSessionUpdateError] - Callback when session update fails (for reverting optimistic updates)
 * @param {boolean} [props.loading=false] - Whether to show loading skeleton instead of data
 *
 * @example
 * ```tsx
 * <SessionTable
 *   sessions={sessions}
 *   onSessionUpdate={(id) => console.log('Updated session:', id)}
 *   onSessionUpdateError={(id, status) => console.log('Update failed:', id)}
 *   loading={isLoading}
 * />
 * ```
 */
export default function SessionTable({
  sessions,
  onSessionUpdate,
  onSessionUpdateError,
  loading = false,
}: SessionTableProps) {
  const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(
    null
  );

  /**
   * Handles marking a session as completed with optimistic UI updates.
   *
   * This function implements the optimistic update pattern:
   * 1. Immediately updates the UI for better perceived performance
   * 2. Makes API call to persist the change to the database
   * 3. Reverts the UI change if the API call fails
   * 4. Shows appropriate loading states during the process
   *
   * @param sessionId - The ID of the session to mark as completed
   * @returns Promise that resolves when the operation is complete
   *
   * @example
   * ```tsx
   * await handleMarkCompleted(123);
   * ```
   */
  const handleMarkCompleted = useCallback(
    async (sessionId: number) => {
      const session = sessions.find((s) => s.id === sessionId);
      const originalStatus = session?.status;

      try {
        setUpdatingSessionId(sessionId);

        // Optimistic update: Update UI immediately for better perceived performance
        // This makes the app feel fast and responsive
        onSessionUpdate(sessionId);

        // Call API to persist the change to the database using utility function
        await apiCall(`/api/sessions/${sessionId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "Completed" }),
        });

        // Success - optimistic update was correct, no additional UI changes needed
      } catch (error) {
        console.error("Error updating session:", error);
        // Revert optimistic update on API failure to maintain data consistency
        if (onSessionUpdateError && originalStatus) {
          onSessionUpdateError(sessionId, originalStatus);
        }
      } finally {
        // Always clean up loading state regardless of success/failure
        setUpdatingSessionId(null);
      }
    },
    [sessions, onSessionUpdate, onSessionUpdateError]
  );

  /**
   * Memoized date formatter to prevent recreation on every render
   * Uses shared utility function for consistent date formatting
   */
  const formatSessionDate = useCallback((dateString: string | Date) => {
    return formatDate(dateString, "MMM d, yyyy h:mm a");
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        {/* Desktop loading skeleton */}
        <div className={`${styles.desktopView} hidden md:block`}>
          <div className={styles.tableWrapper}>
            <table
              className={`${styles.table} min-w-full divide-y divide-gray-200`}
            >
              <thead className={`${styles.tableHead} bg-gray-50`}>
                <tr>
                  <th className={styles.headerCell}>Therapist</th>
                  <th className={styles.headerCell}>Patient</th>
                  <th className={styles.headerCell}>Date & Time</th>
                  <th className={styles.headerCell}>Status</th>
                  <th className={styles.headerCell}>Actions</th>
                </tr>
              </thead>
              <tbody
                className={`${styles.tableBody} bg-white divide-y divide-gray-200`}
              >
                {[...Array(3)].map((_, i) => (
                  <tr key={i} className={`${styles.loadingRow} animate-pulse`}>
                    <td className={styles.loadingCell}>
                      <div
                        className={`${styles.loadingSkeletonTherapist} bg-gray-200`}
                      ></div>
                    </td>
                    <td className={styles.loadingCell}>
                      <div
                        className={`${styles.loadingSkeletonPatient} bg-gray-200`}
                      ></div>
                    </td>
                    <td className={styles.loadingCell}>
                      <div
                        className={`${styles.loadingSkeletonDate} bg-gray-200`}
                      ></div>
                    </td>
                    <td className={styles.loadingCell}>
                      <div
                        className={`${styles.loadingSkeletonStatus} bg-gray-200`}
                      ></div>
                    </td>
                    <td className={styles.loadingCell}>
                      <div
                        className={`${styles.loadingSkeletonButton} bg-gray-200`}
                      ></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile loading skeleton */}
        <div className={`${styles.mobileView} md:hidden`}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`${styles.mobileCard} ${styles.loadingField} animate-pulse border`}
            >
              <div className={styles.mobileHeader}>
                <div
                  className={`${styles.loadingSkeletonTherapist} bg-gray-200`}
                ></div>
                <div
                  className={`${styles.loadingSkeletonStatus} bg-gray-200`}
                ></div>
              </div>
              <div
                className={`${styles.loadingSkeletonDate} bg-gray-200`}
                style={{ marginBottom: "0.5rem" }}
              ></div>
              <div
                className={`${styles.loadingSkeletonPatient} bg-gray-200`}
                style={{ marginBottom: "0.75rem" }}
              ></div>
              <div
                className={`${styles.loadingSkeletonButton} bg-gray-200`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <CalendarIcon className="w-full h-full" strokeWidth={1} />
        </div>
        <h3 className={styles.emptyTitle}>No sessions scheduled</h3>
        <p className={styles.emptyMessage}>
          Get started by creating your first therapy session.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Desktop Table View */}
      <div className={`${styles.desktopView} hidden md:block`}>
        <div className={styles.tableWrapper}>
          <table
            className={`${styles.table} min-w-full divide-y divide-gray-200`}
          >
            <thead className={`${styles.tableHead} bg-gray-50`}>
              <tr>
                <th className={styles.headerCell}>Therapist</th>
                <th className={styles.headerCell}>Patient</th>
                <th className={styles.headerCell}>Date & Time</th>
                <th className={styles.headerCell}>Status</th>
                <th className={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody
              className={`${styles.tableBody} bg-white divide-y divide-gray-200`}
            >
              {sessions.map((session) => (
                <tr key={session.id} className={styles.tableRow}>
                  <td className={styles.cellTherapist}>
                    {session.therapist_name}
                  </td>
                  <td className={styles.cellPatient}>{session.patient_name}</td>
                  <td className={styles.cellDate}>
                    {formatSessionDate(session.date)}
                  </td>
                  <td className={styles.cellStatus}>
                    <span
                      className={`${styles.statusBadge} ${
                        session.status === "Completed"
                          ? `${styles.statusCompleted} bg-green-100 text-green-800`
                          : `${styles.statusScheduled} bg-yellow-100 text-yellow-800`
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className={styles.cellActions}>
                    {session.status === "Scheduled" && (
                      <button
                        onClick={() => handleMarkCompleted(session.id)}
                        disabled={updatingSessionId === session.id}
                        className={styles.markCompletedButton}
                      >
                        {updatingSessionId === session.id && (
                          <SpinnerIcon className="animate-spin -ml-1 mr-2 h-3 w-3 text-green-600 inline" />
                        )}
                        {updatingSessionId === session.id
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>
                    )}
                    {session.status === "Completed" && (
                      <span className={styles.completedIndicator}>
                        <CheckIcon className={styles.completedIcon || ""} />
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className={`${styles.mobileView} md:hidden`}>
        {sessions.map((session) => (
          <div key={session.id} className={`${styles.mobileCard} border`}>
            <div className={styles.mobileHeader}>
              <h3 className={styles.mobileTherapistName}>
                {session.therapist_name}
              </h3>
              <span
                className={`${styles.mobileStatusBadge} ${
                  session.status === "Completed"
                    ? `${styles.mobileStatusCompleted} bg-green-100 text-green-800`
                    : `${styles.mobileStatusScheduled} bg-yellow-100 text-yellow-800`
                }`}
              >
                {session.status}
              </span>
            </div>
            <div className={styles.mobileDetails}>
              <p className={styles.mobileDetailRow}>
                <UserIcon className={styles.mobileIcon || ""} />
                Patient:{" "}
                <span className={styles.mobilePatientName}>
                  {session.patient_name}
                </span>
              </p>
              <p className={styles.mobileDetailRow}>
                <CalendarIcon className={styles.mobileIcon || ""} />
                {formatSessionDate(session.date)}
              </p>
            </div>
            {session.status === "Scheduled" && (
              <button
                onClick={() => handleMarkCompleted(session.id)}
                disabled={updatingSessionId === session.id}
                className={styles.mobileActionButton}
              >
                {updatingSessionId === session.id && (
                  <SpinnerIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" />
                )}
                {updatingSessionId === session.id
                  ? "Updating..."
                  : "Mark Completed"}
              </button>
            )}
            {session.status === "Completed" && (
              <div className={styles.mobileCompletedIndicator}>
                <CheckIcon className={styles.completedIcon || ""} />
                Session Completed
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
