// __tests__/components/SessionTable.test.tsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import SessionTable from "../../src/components/SessionTable";
import {
  mockSessions,
  mockSessionsWithMissingData,
  mockSessionsWithInvalidDate,
} from "../utils/test-utils";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe("SessionTable", () => {
  const mockOnSessionUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe("Loading State", () => {
    it("displays loading skeleton when loading is true", () => {
      render(
        <SessionTable
          sessions={[]}
          onSessionUpdate={mockOnSessionUpdate}
          loading={true}
        />
      );

      // Check for loading skeleton elements
      expect(screen.getAllByText("Therapist")).toBeTruthy();
      expect(screen.getAllByText("Patient")).toBeTruthy();
      expect(screen.getAllByText("Date & Time")).toBeTruthy();
      expect(screen.getAllByText("Status")).toBeTruthy();
      expect(screen.getAllByText("Actions")).toBeTruthy();

      // Check for animated skeleton rows
      const skeletonRows = document.querySelectorAll(".animate-pulse");
      expect(skeletonRows.length).toBeGreaterThan(0);
    });

    it("shows skeleton animation with proper structure", () => {
      render(
        <SessionTable
          sessions={[]}
          onSessionUpdate={mockOnSessionUpdate}
          loading={true}
        />
      );

      // Check skeleton structure
      const skeletons = document.querySelectorAll(".bg-gray-200");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    it("displays empty state when no sessions are provided", () => {
      render(
        <SessionTable
          sessions={[]}
          onSessionUpdate={mockOnSessionUpdate}
          loading={false}
        />
      );

      expect(screen.getByText("No sessions scheduled")).toBeInTheDocument();
      expect(
        screen.getByText("Get started by creating your first therapy session.")
      ).toBeInTheDocument();
    });

    it("shows calendar icon in empty state", () => {
      render(
        <SessionTable
          sessions={[]}
          onSessionUpdate={mockOnSessionUpdate}
          loading={false}
        />
      );

      const svgIcon = document.querySelector("svg");
      expect(svgIcon).toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("renders session data correctly", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      // Check therapist names are present (flexible count due to responsive design)
      expect(
        screen.getAllByText("Dr. Sarah Johnson").length
      ).toBeGreaterThanOrEqual(2);
      expect(
        screen.getAllByText("Dr. Michael Chen").length
      ).toBeGreaterThanOrEqual(1);

      // Check patient names are present
      expect(screen.getAllByText("John Smith").length).toBeGreaterThanOrEqual(
        1
      );
      expect(screen.getAllByText("Emma Wilson").length).toBeGreaterThanOrEqual(
        1
      );
      expect(screen.getAllByText("David Brown").length).toBeGreaterThanOrEqual(
        1
      );

      // Ensure all sessions are rendered (use getAllByText for names that appear in both desktop and mobile)
      expect(screen.getAllByText("John Smith")).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText("Emma Wilson")).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText("David Brown")).toHaveLength(2); // Desktop + mobile
    });

    it("formats dates correctly", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      // Check formatted dates (should use date-fns format: MMM d, yyyy h:mm a)
      expect(screen.getAllByText("Nov 15, 2025 1:00 AM")).toHaveLength(2);
      expect(screen.getAllByText("Nov 16, 2025 6:30 AM")).toHaveLength(2);
      expect(screen.getAllByText("Nov 17, 2025 3:00 AM")).toHaveLength(2);
    });

    it("displays status badges with correct styling", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const scheduledBadges = screen.getAllByText("Scheduled");
      const completedBadges = screen.getAllByText("Completed");

      expect(scheduledBadges).toHaveLength(4); // 2 scheduled sessions × 2 views
      expect(completedBadges).toHaveLength(3); // 1 completed session × 2 views + 1 action status text

      // Check status badge classes (only for actual badges, not action indicators)
      scheduledBadges.forEach((badge) => {
        expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
      });

      // Filter completed badges to only include the actual status badges (have bg-green-100 class)
      const actualCompletedBadges = completedBadges.filter((badge) =>
        badge.classList.contains("bg-green-100")
      );
      expect(actualCompletedBadges).toHaveLength(2); // 1 completed session × 2 views

      actualCompletedBadges.forEach((badge) => {
        expect(badge).toHaveClass("bg-green-100", "text-green-800");
      });
    });
  });

  describe("Responsive Design", () => {
    it("shows desktop table view for larger screens", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const desktopTable = document.querySelector(".hidden.md\\:block table");
      expect(desktopTable).toBeInTheDocument();
    });

    it("shows mobile card view for smaller screens", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const mobileCards = document.querySelector(".md\\:hidden");
      expect(mobileCards).toBeInTheDocument();
    });
  });

  describe("Mark Completed Functionality", () => {
    it("shows Mark Completed button only for scheduled sessions", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      expect(markCompletedButtons).toHaveLength(4); // 2 scheduled sessions × 2 views

      // Check that completed session does not have the button
      const completedSessionRows = screen.getAllByText("Emma Wilson");
      completedSessionRows.forEach((text) => {
        const row = text.closest("tr") || text.closest(".border");
        expect(row).not.toHaveTextContent("Mark Completed");
      });
    });

    it("calls handleMarkCompleted when Mark Completed button is clicked", async () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      const firstButton = markCompletedButtons[0];

      fireEvent.click(firstButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/sessions/1", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Completed" }),
        });
      });

      await waitFor(() => {
        expect(mockOnSessionUpdate).toHaveBeenCalledWith(1);
      });
    });

    it("shows loading state on Mark Completed button during request", async () => {
      // Mock a delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                }),
              100
            );
          })
      );

      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      const firstButton = markCompletedButtons[0];

      fireEvent.click(firstButton);

      // Check loading state (button should show "Updating..." and be disabled)
      // There will be multiple "Updating..." buttons (desktop + mobile), so check all
      await waitFor(() => {
        const updatingButtons = screen.getAllByText("Updating...");
        expect(updatingButtons.length).toBeGreaterThan(0);
        updatingButtons.forEach((button) => {
          expect(button.closest("button")).toBeDisabled();
        });
      });

      // Wait for request to complete
      await waitFor(() => {
        expect(mockOnSessionUpdate).toHaveBeenCalledWith(1);
      });
    });

    it("handles API errors gracefully", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      fireEvent.click(markCompletedButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error updating session:",
          expect.any(Error)
        );
      });

      // With optimistic updates, onSessionUpdate should be called immediately
      expect(mockOnSessionUpdate).toHaveBeenCalledWith(1);

      consoleSpy.mockRestore();
    });

    it("handles HTTP error responses", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      fireEvent.click(markCompletedButtons[0]);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // With optimistic updates, onSessionUpdate should be called immediately
      expect(mockOnSessionUpdate).toHaveBeenCalledWith(1);
      consoleSpy.mockRestore();
    });

    it("disables button during update to prevent multiple requests", async () => {
      let resolvePromise: (value: any) => void;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(delayedPromise);

      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const markCompletedButtons = screen.getAllByText("Mark Completed");
      const firstButton = markCompletedButtons[0];

      fireEvent.click(firstButton);

      // Button should be disabled (multiple buttons due to responsive design)
      await waitFor(() => {
        const updatingButtons = screen.getAllByText("Updating...");
        updatingButtons.forEach((button) => {
          expect(button.closest("button")).toBeDisabled();
        });
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      });

      await waitFor(() => {
        expect(mockOnSessionUpdate).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("Table Structure", () => {
    it("has proper table headers", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      expect(screen.getAllByText("Therapist")).toBeTruthy();
      expect(screen.getAllByText("Patient")).toBeTruthy();
      expect(screen.getAllByText("Date & Time")).toBeTruthy();
      expect(screen.getAllByText("Status")).toBeTruthy();
      expect(screen.getAllByText("Actions")).toBeTruthy();
    });

    it("has correct table structure and styling", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const table = document.querySelector("table");
      expect(table).toHaveClass("min-w-full", "divide-y", "divide-gray-200");

      const thead = document.querySelector("thead");
      expect(thead).toHaveClass("bg-gray-50");

      const tbody = document.querySelector("tbody");
      expect(tbody).toHaveClass("bg-white", "divide-y", "divide-gray-200");
    });
  });

  describe("Accessibility", () => {
    it("has accessible table structure", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const table = document.querySelector("table");
      expect(table).toBeInTheDocument();

      const headers = screen.getAllByRole("columnheader");
      expect(headers.length).toBeGreaterThan(0);
    });

    it("has accessible buttons with proper labels", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it("supports keyboard navigation", () => {
      render(
        <SessionTable
          sessions={mockSessions}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      const buttons = screen.getAllByText("Mark Completed");
      buttons.forEach((button) => {
        expect(button.closest("button")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles sessions with missing therapist or patient names", () => {
      render(
        <SessionTable
          sessions={mockSessionsWithMissingData}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      // Should still render without crashing and show available data
      expect(screen.getAllByText("John Smith")).toHaveLength(2); // Desktop + mobile
      expect(screen.getAllByText("Dr. Sarah Johnson")).toHaveLength(2); // Desktop + mobile

      // Check that table structure is maintained
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getAllByText("Therapist")).toBeTruthy();
      expect(screen.getAllByText("Patient")).toBeTruthy();
    });

    it("handles invalid date formats gracefully", () => {
      render(
        <SessionTable
          sessions={mockSessionsWithInvalidDate}
          onSessionUpdate={mockOnSessionUpdate}
        />
      );

      // Should render without crashing and show "Invalid date"
      expect(screen.getAllByText("Dr. Sarah Johnson")).toHaveLength(2);
      expect(screen.getAllByText("Invalid date")).toHaveLength(2);
    });

    it("handles empty session arrays", () => {
      render(
        <SessionTable sessions={[]} onSessionUpdate={mockOnSessionUpdate} />
      );

      expect(screen.getByText("No sessions scheduled")).toBeInTheDocument();
    });
  });
});
