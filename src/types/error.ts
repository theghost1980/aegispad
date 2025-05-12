export type ErrorType =
  | "auth"
  | "network"
  | "validation"
  | "keychain"
  | "general"
  | "configuration";

/**
 * Custom Error class for application-specific errors.
 * Extends the built-in Error class for better compatibility with error handling mechanisms.
 */
export class AppError extends Error {
  details?: string;
  code?: string | number;
  type?: ErrorType;
  shouldDisplay: boolean; // Explicitly boolean, not optional
  shouldLog: boolean; // Explicitly boolean, not optional

  constructor(
    message: string,
    details?: string,
    code?: string | number,
    type?: ErrorType,
    shouldDisplay: boolean = true,
    shouldLog: boolean = true,
    // Optional: pass the original error if wrapping one
    originalError?: any
  ) {
    // Call the parent Error constructor
    super(message);

    // Set the name of the error (useful for debugging)
    this.name = "AppError";

    // Set custom properties
    this.details = details;
    this.code = code;
    this.type = type;
    this.shouldDisplay = shouldDisplay;
    this.shouldLog = shouldLog;

    // Capture stack trace (V8 engine specific, but common)
    // TypeScript ahora lo reconocerá debido a la declaración de interfaz arriba
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    console.error(
      `AppError [${this.type || "general"}] (Code: ${this.code || "N/A"})`,
      {
        message: this.message,
        details: this.details,
        originalError: originalError,
      }
    );
  }
}

/**
 * Helper function to create an instance of AppError.
 * @param message - A user-friendly message.
 * @param details - Optional technical details.
 * @param code - Optional error code (e.g., HTTP status).
 * @param type - Optional error category.
 * @param shouldDisplay - Whether to display this error to the user (defaults to true).
 * @param shouldLog - Whether to log this error to an external service (defaults to true).
 * @param originalError - Optional original error object being wrapped.
 * @returns An instance of AppError.
 */
export const createAppError = (
  message: string,
  details?: string,
  code?: string | number,
  type?: ErrorType,
  shouldDisplay: boolean = true,
  shouldLog: boolean = true,
  originalError?: any
): AppError => {
  // Simply return a new instance of the AppError class
  return new AppError(
    message,
    details,
    code,
    type,
    shouldDisplay,
    shouldLog,
    originalError
  );
};
