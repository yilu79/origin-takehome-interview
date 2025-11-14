/**
 * Shared SVG Icons Module
 * @fileoverview Centralized SVG icons to eliminate code duplication and improve maintainability
 */

import React from "react";

interface IconProps {
  className?: string | undefined;
  size?: number;
  strokeWidth?: number;
}

/**
 * Check mark icon used for completed status indicators
 */
export const CheckIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Spinning loading indicator
 */
export const SpinnerIcon: React.FC<IconProps> = ({
  className = "",
  size = 16,
}) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/**
 * User/person icon
 */
export const UserIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

/**
 * Calendar icon for dates
 */
export const CalendarIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

/**
 * Plus icon for add/create actions
 */
export const PlusIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

/**
 * Refresh/reload icon
 */
export const RefreshIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

/**
 * X/Close icon
 */
export const XIcon: React.FC<IconProps> = ({
  className = "",
  size = 24,
  strokeWidth = 2,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/**
 * Error/Warning triangle icon
 */
export const ErrorIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Success check icon for success messages
 */
export const SuccessIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

/**
 * Empty state icon (inbox)
 */
export const InboxIcon: React.FC<IconProps> = ({
  className = "",
  size = 48,
  strokeWidth = 1,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-3.5-7-3.5 7M4 13l3.5-7 3.5 7"
    />
  </svg>
);
