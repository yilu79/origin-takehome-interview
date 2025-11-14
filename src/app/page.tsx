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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSessions.slice(startIndex, endIndex);
  }, [filteredSessions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  // Clear all filters (functionality available but not exposed in current UI)
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("All");
    setCurrentPage(1);
  }, []);

  // Check if filters are active (for potential future UI enhancements)
  const hasActiveFilters = useMemo(
    () => searchTerm || statusFilter !== "All",
    [searchTerm, statusFilter]
  );

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

        {/* Filters and Search Bar */}
        <div className={styles.filtersSection}>
          <div className={styles.searchAndFilters}>
            {/* Search Input */}
            <div className={styles.searchWrapper}>
              <svg
                className={styles.searchIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search therapist or patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "All" | "Scheduled" | "Completed"
                )
              }
              className={styles.filterSelect}
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "therapist" | "patient")
              }
              className={styles.filterSelect}
            >
              <option value="date">Sort by Date</option>
              <option value="therapist">Sort by Therapist</option>
              <option value="patient">Sort by Patient</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className={styles.sortOrderButton}
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              <svg
                className={styles.sortIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sortOrder === "asc" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                  />
                )}
              </svg>
            </button>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className={styles.clearFiltersButton}
              >
                <svg
                  className={styles.clearIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className={styles.resultsInfo}>
            <span className={styles.resultsText}>
              Showing {paginatedSessions.length} of {filteredSessions.length}{" "}
              sessions
              {hasActiveFilters && (
                <span className={styles.filteredBadge}>
                  (filtered from {sessions.length} total)
                </span>
              )}
            </span>

            {/* Items Per Page Selector */}
            <div className={styles.perPageSelector}>
              <span className={styles.perPageLabel}>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className={styles.perPageSelect}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Session Table */}
        <SessionTable
          sessions={paginatedSessions}
          onSessionUpdate={handleSessionUpdate}
          onSessionUpdateError={handleSessionUpdateError}
          loading={loading}
        />

        {/* Pagination Controls */}
        {filteredSessions.length > 0 && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <svg
                className={styles.paginationIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <div className={styles.pageInfo}>
              <span className={styles.pageNumbers}>
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              Next
              <svg
                className={styles.paginationIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

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
