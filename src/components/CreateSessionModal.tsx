"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Therapist,
  Patient,
  CreateSessionModalProps,
  CreateSessionFormData,
} from "@/types";
import {
  validateFutureDate,
  validateRequiredFields,
  apiCall,
} from "@/lib/utils";
import { XIcon, SpinnerIcon, ErrorIcon } from "./Icons";
import styles from "@/styles/components/CreateSessionModal.module.css";

/**
 * CreateSessionModal Component
 *
 * A modal dialog for creating new therapy sessions. Features form validation,
 * dropdown loading states, and comprehensive error handling.
 *
 * @component
 * @param {CreateSessionModalProps} props - Component properties
 * @param {boolean} props.isOpen - Whether the modal is currently visible
 * @param {function} props.onClose - Callback to close the modal
 * @param {function} props.onSuccess - Callback when session is successfully created
 *
 * @example
 * ```tsx
 * <CreateSessionModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => {
 *     setShowModal(false);
 *     refreshSessions();
 *   }}
 * />
 * ```
 */
export default function CreateSessionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSessionModalProps) {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSessionFormData>({
    therapist_id: "",
    patient_id: "",
    date: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Memoized date validation using shared utility function.
   * Enforces business rule that sessions must be scheduled at least 1 hour in advance.
   *
   * @param dateValue - The date string to validate
   * @returns Error message or empty string if valid
   */
  const validateDate = useCallback((dateValue: string) => {
    return validateFutureDate(dateValue, 1);
  }, []);

  /**
   * Memoized comprehensive form validation.
   * Combines required field validation with custom business rules.
   *
   * @returns True if form is valid, false otherwise. Sets field errors as side effect.
   */
  const validateForm = useCallback(() => {
    const errors: { [key: string]: string } = {};

    // Required field validation using utility
    const requiredErrors = validateRequiredFields(formData, [
      "therapist_id",
      "patient_id",
      "date",
    ]);
    requiredErrors.forEach(({ field, message }) => {
      if (field === "therapist_id")
        errors.therapist_id = "Please select a therapist";
      else if (field === "patient_id")
        errors.patient_id = "Please select a patient";
      else errors[field] = message;
    });

    // Date validation with business rules
    const dateError = validateDate(formData.date);
    if (dateError) errors.date = dateError;

    // Update UI with errors and return validation status
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, validateDate]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  /**
   * Memoized data fetcher to load therapists and patients for dropdown options.
   * Uses Promise.all for concurrent API calls and shared utility for consistent error handling.
   */
  const fetchDropdownData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch both datasets concurrently using utility function
      const [therapistsData, patientsData] = await Promise.all([
        apiCall<Therapist[]>("/api/therapists"),
        apiCall<Patient[]>("/api/patients"),
      ]);

      setTherapists(therapistsData);
      setPatients(patientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setFieldErrors({});

      // Create session using utility function
      await apiCall("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          therapist_id: parseInt(formData.therapist_id),
          patient_id: parseInt(formData.patient_id),
          date: new Date(formData.date).toISOString(),
        }),
      });

      // Reset form and close modal
      setFormData({ therapist_id: "", patient_id: "", date: "" });
      setFieldErrors({});
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Real-time validation for date field
    if (field === "date" && value) {
      const dateError = validateDate(value);
      if (dateError) {
        setFieldErrors((prev) => ({ ...prev, [field]: dateError }));
      }
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ therapist_id: "", patient_id: "", date: "" });
      setFieldErrors({});
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate default datetime (tomorrow at 9 AM)
  const getDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Schedule New Session</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={loading}
          >
            <XIcon className={styles.closeIcon || ""} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          {loading && therapists.length === 0 ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingField}>
                <div className={styles.loadingLabel}></div>
                <div className={styles.loadingInput}></div>
              </div>
              <div className={styles.loadingField}>
                <div className={styles.loadingLabelSmall}></div>
                <div className={styles.loadingInput}></div>
              </div>
              <div className={styles.loadingField}>
                <div className={styles.loadingLabelMedium}></div>
                <div className={styles.loadingInput}></div>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.fieldContainer}>
                <label htmlFor="therapist" className={styles.label}>
                  Therapist <span className={styles.requiredIndicator}>*</span>
                </label>
                <select
                  id="therapist"
                  value={formData.therapist_id}
                  onChange={(e) =>
                    handleInputChange("therapist_id", e.target.value)
                  }
                  className={`${styles.inputBase} ${styles.selectField} ${
                    fieldErrors.therapist_id
                      ? styles.inputError
                      : styles.inputValid
                  }`}
                  disabled={loading || isSubmitting}
                  required
                >
                  <option value="">Select a therapist</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.id} value={therapist.id}>
                      {therapist.name}{" "}
                      {therapist.specialty ? `(${therapist.specialty})` : ""}
                    </option>
                  ))}
                </select>
                {fieldErrors.therapist_id && (
                  <p className={styles.fieldError}>
                    <ErrorIcon className={styles.fieldErrorIcon || ""} />
                    {fieldErrors.therapist_id}
                  </p>
                )}
              </div>

              <div className={styles.fieldContainer}>
                <label htmlFor="patient" className={styles.label}>
                  Patient <span className={styles.requiredIndicator}>*</span>
                </label>
                <select
                  id="patient"
                  value={formData.patient_id}
                  onChange={(e) =>
                    handleInputChange("patient_id", e.target.value)
                  }
                  className={`${styles.inputBase} ${styles.selectField} ${
                    fieldErrors.patient_id
                      ? styles.inputError
                      : styles.inputValid
                  }`}
                  disabled={loading || isSubmitting}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.patient_id && (
                  <p className={styles.fieldError}>
                    <ErrorIcon className={styles.fieldErrorIcon || ""} />
                    {fieldErrors.patient_id}
                  </p>
                )}
              </div>

              <div className={styles.fieldContainer}>
                <label htmlFor="datetime" className={styles.label}>
                  Date & Time{" "}
                  <span className={styles.requiredIndicator}>*</span>
                </label>
                <input
                  type="datetime-local"
                  id="datetime"
                  value={formData.date || getDefaultDateTime()}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={`${styles.inputBase} ${styles.dateField} ${
                    fieldErrors.date ? styles.inputError : styles.inputValid
                  }`}
                  disabled={loading || isSubmitting}
                  required
                />
                {fieldErrors.date && (
                  <p className={styles.fieldError}>
                    <ErrorIcon className={styles.fieldErrorIcon || ""} />
                    {fieldErrors.date}
                  </p>
                )}
                {!fieldErrors.date && (
                  <p className={styles.fieldHelp}>
                    Session must be scheduled at least 1 hour in advance
                  </p>
                )}
              </div>
            </>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={`${styles.buttonBase} ${styles.cancelButton}`}
              disabled={loading || isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.buttonBase} ${styles.submitButton} ${
                isSubmitting ? styles.submitButtonLoading : ""
              }`}
              disabled={loading || isSubmitting}
            >
              {isSubmitting && <SpinnerIcon className={styles.spinner || ""} />}
              {isSubmitting ? "Creating Session..." : "Create Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
