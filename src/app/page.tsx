"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SessionWithDetails } from "@/types";
import SessionTable from "@/components/SessionTable";
import CreateSessionModal from "@/components/CreateSessionModal";
import { PlusIcon, RefreshIcon, SuccessIcon } from "@/components/Icons";
import styles from "@/styles/components/Dashboard.module.css";

export default function Home() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Scheduled" | "Completed"
  >("All");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "therapist" | "patient">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/sessions");

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();
      // Handle malformed API responses
      if (Array.isArray(data)) {
        setSessions(data);
      } else {
        console.error("Invalid API response format:", data);
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized optimistic update for session status
  const handleSessionUpdate = useCallback((sessionId: number) => {
    // Optimistically update the UI immediately
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, status: "Completed" as const }
          : session
      )
    );

    // Show success message
    setSuccessMessage("Session marked as completed");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  // Memoized session update error handler
  const handleSessionUpdateError = useCallback(
    (sessionId: number, originalStatus: string) => {
      // Revert the optimistic update
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                status: originalStatus as "Scheduled" | "Completed",
              }
            : session
        )
      );

      setError("Failed to update session. Please try again.");
      setTimeout(() => setError(null), 3000);
    },
    []
  );

  // Memoized session creation success handler
  const handleSessionCreated = useCallback(() => {
    fetchSessions(); // Refresh data after creation
    setSuccessMessage("Session created successfully");
    setTimeout(() => setSuccessMessage(null), 3000);
  }, [fetchSessions]);

  /**
   * Memoized filtering and sorting for optimal performance
   * Only recalculates when dependencies change
   */
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        // Text search: matches either therapist OR patient name (case-insensitive)
        const matchesSearch =
          session.therapist_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          session.patient_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          "";

        // Status filter: show all or specific status
        const matchesStatus =
          statusFilter === "All" || session.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let aValue: string | Date;
        let bValue: string | Date;

        // Dynamic sorting based on selected criteria
        switch (sortBy) {
          case "date":
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case "therapist":
            aValue = a.therapist_name || "";
            bValue = b.therapist_name || "";
            break;
          case "patient":
            aValue = a.patient_name || "";
            bValue = b.patient_name || "";
            break;
          default:
            aValue = new Date(a.date);
            bValue = new Date(b.date);
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [sessions, searchTerm, statusFilter, sortBy, sortOrder]);

  // Clear all filters (functionality available but not exposed in current UI)
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
  }, []);

  // Check if filters are active (for potential future UI enhancements)
  const hasActiveFilters = useMemo(
    () => searchTerm || statusFilter !== "All",
    [searchTerm, statusFilter]
  );

  // Prevent unused variable warnings in production build
  // These are kept for potential future UI enhancements (sorting controls, clear filters button)
  void clearFilters;
  void hasActiveFilters;
  void setSortBy;
  void setSortOrder;

  if (error) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Origin Therapy - Session Dashboard</h1>
          <div className={styles.errorCard}>
            <div className={styles.errorContent}>
              <svg
                className={styles.errorIcon}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className={styles.errorText}>Error: {error}</span>
            </div>
            <button onClick={fetchSessions} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Success Message */}
        {successMessage && (
          <div className={styles.successMessage}>
            <SuccessIcon className={styles.successIcon || ""} />
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Session Dashboard</h1>
            <span className={styles.sessionCount}>
              {sessions?.length || 0}{" "}
              {(sessions?.length || 0) === 1 ? "session" : "sessions"}
            </span>
          </div>

          <div className={styles.actions}>
            <button
              onClick={fetchSessions}
              disabled={loading}
              className={styles.refreshButton}
            >
              <RefreshIcon className={styles.refreshIcon || ""} />
              Refresh
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className={styles.newSessionButton}
            >
              <PlusIcon className={styles.newSessionIcon || ""} />
              New Session
            </button>
          </div>
        </div>

        {/* Session Table */}
        <SessionTable
          sessions={filteredSessions}
          onSessionUpdate={handleSessionUpdate}
          onSessionUpdateError={handleSessionUpdateError}
          loading={loading}
        />

        {/* Create Session Modal */}
        <CreateSessionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleSessionCreated();
          }}
        />
      </div>
    </main>
  );
}
