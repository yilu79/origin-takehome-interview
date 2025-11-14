// __tests__/components/CreateSessionModal.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateSessionModal from "../../src/components/CreateSessionModal";
import { mockTherapists, mockPatients } from "../utils/test-utils";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.Mock;

describe("CreateSessionModal", () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders modal when isOpen is true", async () => {
      // Setup successful fetch responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Wait for modal to load and data to be fetched
      await waitFor(() => {
        expect(screen.getByText("Schedule New Session")).toBeInTheDocument();
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Patient/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date & Time/)).toBeInTheDocument();
      });
    });

    it("does not render when isOpen is false", () => {
      render(
        <CreateSessionModal
          isOpen={false}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(
        screen.queryByText("Schedule New Session")
      ).not.toBeInTheDocument();
    });

    it("has proper form structure", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Patient/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date & Time/)).toBeInTheDocument();
      });

      expect(
        screen.getByRole("button", { name: "Cancel" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Create Session" })
      ).toBeInTheDocument();
    });
  });

  describe("Dropdown Population", () => {
    it("loads and displays therapist options", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Wait for therapist names to be loaded (they appear with specialty)
      await waitFor(() => {
        expect(screen.getByText(/Dr. Sarah Johnson/)).toBeInTheDocument();
        expect(screen.getByText(/Physical Therapy/)).toBeInTheDocument();
      });
    });

    it("loads and displays patient options", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("John Smith")).toBeInTheDocument();
        expect(screen.getByText("Emma Wilson")).toBeInTheDocument();
        expect(screen.getByText("David Brown")).toBeInTheDocument();
      });
    });

    it("shows error message on fetch failure", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Failed to fetch dropdown data"))
        .mockRejectedValueOnce(new Error("Failed to fetch dropdown data"));

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText("Failed to fetch dropdown data")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Form Interaction", () => {
    beforeEach(() => {
      // Setup successful dropdown data for each test
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });
    });

    it("can select therapist and patient", async () => {
      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      const therapistSelect = screen.getByLabelText(/Therapist/);
      const patientSelect = screen.getByLabelText(/Patient/);

      fireEvent.change(therapistSelect, { target: { value: "1" } });
      fireEvent.change(patientSelect, { target: { value: "1" } });

      expect(therapistSelect).toHaveValue("1");
      expect(patientSelect).toHaveValue("1");
    });

    it("validates required fields", async () => {
      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      // Get the form element and submit it directly to bypass HTML5 validation
      const form = document.querySelector("form");

      if (form) {
        // Submit form directly using fireEvent.submit to bypass browser validation
        fireEvent.submit(form);
      } else {
        // Fallback to clicking the button
        const submitButton = screen.getByRole("button", {
          name: "Create Session",
        });
        fireEvent.click(submitButton);
      }

      await waitFor(() => {
        expect(
          screen.getByText("Please select a therapist")
        ).toBeInTheDocument();
      });
    });

    it("calls onClose when Cancel is clicked", async () => {
      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Form Submission", () => {
    it("submits form successfully", async () => {
      // Setup dropdown data
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      // Mock successful session creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1 }),
      });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      // Fill out form
      fireEvent.change(screen.getByLabelText(/Therapist/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Patient/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Date & Time/), {
        target: { value: "2025-12-01T10:00" },
      });

      // Submit
      fireEvent.click(screen.getByRole("button", { name: "Create Session" }));

      // Check API call was made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/sessions",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
        );
      });

      // Check callbacks were called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // onClose should not be called automatically on success - parent handles this
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("handles submission errors", async () => {
      // Setup dropdown data
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        });

      // Mock failed session creation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Server error" }),
      });

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/Therapist/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Patient/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Date & Time/), {
        target: { value: "2025-11-15T10:00" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create Session" }));

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });

      // Should not call success callbacks
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("disables form elements during submission", async () => {
      // Setup dropdown data
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTherapists,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPatients,
        })
        // Mock slow submission
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ id: 1 }),
                  }),
                100
              )
            )
        );

      render(
        <CreateSessionModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeInTheDocument();
      });

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/Therapist/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Patient/), {
        target: { value: "1" },
      });
      fireEvent.change(screen.getByLabelText(/Date & Time/), {
        target: { value: "2025-11-15T10:00" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create Session" }));

      // Check elements are disabled during loading
      await waitFor(() => {
        expect(screen.getByLabelText(/Therapist/)).toBeDisabled();
        expect(screen.getByLabelText(/Patient/)).toBeDisabled();
        expect(screen.getByLabelText(/Date & Time/)).toBeDisabled();
      });
    });
  });
});
