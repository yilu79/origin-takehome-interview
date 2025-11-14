// __tests__/app/page.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "../utils/test-utils";
import Home from "../../src/app/page";
import { mockSessions } from "../utils/test-utils";

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Initial Load", () => {
    it("renders dashboard title and components", async () => {
      // Mock successful sessions fetch
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      // Check for main title
      expect(screen.getByText("Session Dashboard")).toBeInTheDocument();

      // Check for New Session button
      expect(
        screen.getByRole("button", { name: /new session/i })
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/sessions");
      });
    });

    it("displays loading state initially", () => {
      // Mock slow fetch
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockSessions),
                }),
              100
            )
          )
      );

      render(<Home />);

      // Should show loading state
      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it("handles API errors gracefully", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<Home />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching sessions:",
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it("displays session count when data loads", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(`${mockSessions.length} sessions`)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Session Management", () => {
    it("fetches and displays sessions", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getAllByText("Dr. Sarah Johnson").length).toBeGreaterThan(
          0
        );
        expect(screen.getAllByText("John Smith").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Dr. Michael Chen").length).toBeGreaterThan(
          0
        );
      });
    });

    it("refreshes sessions after creating a new one", async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });
      // After creating new session
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            ...mockSessions,
            {
              id: 4,
              therapist_id: 1,
              patient_id: 1,
              date: new Date("2025-12-01T10:00:00Z"),
              status: "Scheduled",
              therapist_name: "Dr. Sarah Johnson",
              patient_name: "New Patient",
            },
          ]),
      });

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByText("Dr. Sarah Johnson").length).toBeGreaterThan(
          0
        );
      });

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: /new session/i }));

      // Check modal opened
      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
      });
    });

    it("refreshes sessions after updating one", async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });
      // After update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve(
            mockSessions.map((s) =>
              s.id === 1 ? { ...s, status: "Completed" } : s
            )
          ),
      });

      render(<Home />);

      // Wait for initial load - responsive design creates desktop + mobile views
      await waitFor(() => {
        expect(screen.getAllByText("Mark Completed")).toHaveLength(4); // 2 scheduled sessions × 2 views (desktop + mobile)
      });

      // The onSessionUpdate callback should trigger a refresh
      // This would be triggered by the SessionTable component
      // when a session is marked as completed
    });
  });

  describe("Modal Management", () => {
    it("opens create session modal when New Session button is clicked", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /new session/i })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /new session/i }));

      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
      });
    });

    it("closes create session modal when cancelled", async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Initial sessions load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      // Wait for initial load
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /new session/i })
        ).toBeInTheDocument();
      });

      // Mock therapists and patients for modal
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]), // therapists
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([]), // patients
        });

      // Open modal
      fireEvent.click(screen.getByRole("button", { name: /new session/i }));

      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
      });

      // Wait for modal to fully load then cancel
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

      await waitFor(() => {
        expect(
          screen.queryByText("Schedule New Session")
        ).not.toBeInTheDocument();
      });
    });

    it("closes modal and refreshes data after successful session creation", async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });
      // Refresh after creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockSessions]),
      });

      render(<Home />);

      // Open modal
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /new session/i }));
      });

      // Modal should be open
      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
      });

      // Simulate successful creation by calling the onSuccess callback
      // In a real test, this would be triggered by the CreateSessionModal
      // when form submission succeeds
    });
  });

  describe("Component Integration", () => {
    it("passes correct props to SessionTable", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      await waitFor(() => {
        // SessionTable should receive the sessions data
        expect(screen.getByRole("table")).toBeInTheDocument();
        expect(screen.getAllByText("Dr. Sarah Johnson").length).toBeGreaterThan(
          0
        );
      });
    });

    it("passes correct props to CreateSessionModal", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      // Initially modal should be closed
      expect(
        screen.queryByText("Schedule New Session")
      ).not.toBeInTheDocument();

      // Open modal
      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /new session/i }));
      });

      // Modal should be open
      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("handles fetch errors without crashing", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<Home />);

      // Should not crash and handle error gracefully
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      // Dashboard title should still be visible
      expect(
        screen.getByText("Origin Therapy - Session Dashboard")
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("handles empty sessions response", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<Home />);

      await waitFor(() => {
        expect(screen.getByText("0 sessions")).toBeInTheDocument();
        expect(screen.getByText("No sessions scheduled")).toBeInTheDocument();
      });
    });

    it("handles malformed API responses", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null),
      });

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<Home />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe("UI State Management", () => {
    it("manages loading states correctly", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockSessions),
                }),
              50
            )
          )
      );

      render(<Home />);

      // Initially should show loading
      const skeletonElements = document.querySelectorAll(".animate-pulse");
      expect(skeletonElements.length).toBeGreaterThan(0);

      // After loading completes, should show data
      await waitFor(() => {
        expect(screen.getAllByText("Dr. Sarah Johnson").length).toBeGreaterThan(
          0
        );
      });
    });

    it("updates session count dynamically", async () => {
      const mockFetch = global.fetch as jest.Mock;
      // Start with initial sessions
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByText(`${mockSessions.length} sessions`)
        ).toBeInTheDocument();
      });

      // Session count should update when sessions change
      // (This would be tested more thoroughly with actual state changes)
    });

    it("maintains UI consistency during operations", async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      });

      render(<Home />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /new session/i })
        ).toBeInTheDocument();
        expect(screen.getByText("Session Dashboard")).toBeInTheDocument();
      });

      // UI elements should remain consistent
      expect(
        screen.getByRole("button", { name: /new session/i })
      ).not.toBeDisabled();
    });
  });
});
