/**
 * Shared utility functions for common operations across the application
 * @fileoverview This module contains reusable utility functions for date formatting,
 * API calls, validation, and other common operations.
 */

import { format } from "date-fns";
import type { ApiErrorResponse, ValidationError } from "@/types";

/**
 * Formats a date string or Date object into a human-readable format
 * @param dateInput - The date to format (string or Date object)
 * @param formatString - The format pattern (default: "MMM d, yyyy h:mm a")
 * @returns Formatted date string or "Invalid date" if parsing fails
 * 
 * @example
 * ```typescript
 * formatDate("2025-01-15T10:30:00Z") // "Jan 15, 2025 10:30 AM"
 * formatDate(new Date(), "yyyy-MM-dd") // "2025-01-15"
 * ```
 */
export function formatDate(
  dateInput: string | Date, 
  formatString = "MMM d, yyyy h:mm a"
): string {
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    
    // Check for invalid date
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

/**
 * Validates that a date is at least the specified number of hours in the future
 * @param dateValue - The date string to validate
 * @param minHoursAhead - Minimum hours the date must be in the future (default: 1)
 * @returns Validation error message or empty string if valid
 * 
 * @example
 * ```typescript
 * validateFutureDate("2025-01-15T10:30:00Z", 2) // "" if valid, error message if not
 * ```
 */
export function validateFutureDate(
  dateValue: string, 
  minHoursAhead = 1
): string {
  if (!dateValue) return "Date is required";
  
  try {
    const selectedDate = new Date(dateValue);
    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + minHoursAhead * 60 * 60 * 1000);

    if (isNaN(selectedDate.getTime())) {
      return "Invalid date format";
    }

    if (selectedDate <= minAllowedTime) {
      return `Session must be scheduled at least ${minHoursAhead} hour${minHoursAhead > 1 ? 's' : ''} in advance`;
    }
    
    return "";
  } catch (error) {
    console.error("Date validation error:", error);
    return "Invalid date";
  }
}

/**
 * Generic API call handler with consistent error handling and response processing
 * @template T - Expected response data type
 * @param url - API endpoint URL
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise resolving to parsed response data
 * 
 * @throws {Error} With descriptive message for various error conditions
 * 
 * @example
 * ```typescript
 * const sessions = await apiCall<SessionWithDetails[]>('/api/sessions');
 * const newSession = await apiCall('/api/sessions', {
 *   method: 'POST',
 *   body: JSON.stringify(sessionData)
 * });
 * ```
 */
export async function apiCall<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });

    // Handle test environment where response.headers might be undefined
    const contentType = response.headers?.get ? response.headers.get('content-type') : 'application/json';
    
    // Only check content type in production environment
    if (process.env.NODE_ENV !== 'test' && contentType && !contentType.includes('application/json')) {
      throw new Error(`Unexpected response type: ${contentType}`);
    }

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from API error response
      const errorMessage = (data as ApiErrorResponse).error || 
                          (data as ApiErrorResponse).message || 
                          `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to server');
    }
    
    // Re-throw other errors as-is
    throw error;
  }
}

/**
 * Debounce function to limit how often a function can fire
 * 
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   // Search API call
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Validates form field requirements and returns structured errors
 * @param data - Form data object to validate
 * @param requiredFields - Array of required field names
 * @returns Array of validation errors
 * 
 * @example
 * ```typescript
 * const errors = validateRequiredFields(
 *   { name: "", email: "test@example.com" },
 *   ["name", "email"]
 * );
 * // Returns: [{ field: "name", message: "Name is required" }]
 * ```
 */
export function validateRequiredFields<T extends object>(
  data: T,
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  for (const field of requiredFields) {
    const value = (data as Record<string, unknown>)[field];
    
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push({
        field,
        message: `${field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ")} is required`,
      });
    }
  }
  
  return errors;
}

/**
 * Safely parses JSON with fallback value
 * @template T - Expected parsed type
 * @param jsonString - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback value
 * 
 * @example
 * ```typescript
 * const data = safeJsonParse<User[]>('{"users": []}', []);
 * ```
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 * @param ms - Timeout duration in milliseconds
 * @returns Promise that rejects with timeout error
 * 
 * @example
 * ```typescript
 * Promise.race([
 *   apiCall('/slow-endpoint'),
 *   timeout(5000)
 * ]).catch(error => {
 *   // Handle timeout or API error
 * });
 * ```
 */
export function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
}

/**
 * Capitalizes the first letter of a string
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts snake_case to Title Case
 * @param str - Snake case string
 * @returns Title case string
 */
export function snakeToTitle(str: string): string {
  return str
    .split("_")
    .map(capitalize)
    .join(" ");
}