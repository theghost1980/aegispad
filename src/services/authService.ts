import { AUTH_PREFIX } from "../constants/general";
import type {
  ChallengeResponse,
  LogoutSuccessResponse,
  RefreshTokenSuccessResponse,
  ValidateTokenErrorResponse,
  ValidateTokenSuccessResponse,
  VerifySignatureSuccessResponse,
} from "../interfaces/authservice.interface";
import { useAuthStore } from "../stores/authStore";
import { AppError, createAppError } from "../types/error";
import { baseUrl } from "../utils/env.utils";

const handleErrorResponse = async (res: Response): Promise<never> => {
  let details = `HTTP Status: ${res.status}`;
  let message = `Request failed`;

  try {
    const errorData: any = await res.json();
    if (errorData && typeof errorData === "object") {
      if (typeof errorData.error === "string") {
        message = errorData.error;
        details += ` - Backend Error: ${message}`;
      } else if (
        errorData.success === false &&
        typeof errorData.message === "string"
      ) {
        message = errorData.message;
        details += ` - Backend Message: ${message}`;
      } else {
        details += ` - Unexpected response body: ${JSON.stringify(errorData)}`;
      }
    } else {
      details += ` - Non-JSON response or empty body`;
    }
  } catch (e: any) {
    details += ` - Failed to parse response body: ${e.message}`;
  }

  throw createAppError(message, details, res.status, "network", true, true);
};

export const getChallenge = async (
  username: string
): Promise<ChallengeResponse> => {
  const res = await fetch(`${baseUrl}${AUTH_PREFIX}challenge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    await handleErrorResponse(res);
  }

  return res.json();
};

export const verifySignature = async (
  username: string,
  signature: string
): Promise<VerifySignatureSuccessResponse> => {
  const res = await fetch(`${baseUrl}${AUTH_PREFIX}verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, signature }),
  });

  if (!res.ok) {
    await handleErrorResponse(res);
  }

  return res.json() as Promise<VerifySignatureSuccessResponse>;
};

export const validateToken = async (
  accessToken: string
): Promise<ValidateTokenSuccessResponse> => {
  const res = await fetch(`${baseUrl}${AUTH_PREFIX}validate-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    await handleErrorResponse(res);
  }

  const data: ValidateTokenSuccessResponse | ValidateTokenErrorResponse =
    await res.json();

  if (data.success === false) {
    throw createAppError(
      data.message,
      `Validation failed: ${data.message}`,
      undefined,
      "auth",
      true,
      true
    );
  }

  return data;
};

export const refreshToken = async (
  refreshToken: string
): Promise<RefreshTokenSuccessResponse> => {
  const res = await fetch(`${baseUrl}${AUTH_PREFIX}refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await handleErrorResponse(res);
  }

  return res.json() as Promise<RefreshTokenSuccessResponse>;
};

export const logout = async (
  refreshToken: string
): Promise<LogoutSuccessResponse> => {
  const res = await fetch(`${baseUrl}${AUTH_PREFIX}logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await handleErrorResponse(res);
  }

  return res.json() as Promise<LogoutSuccessResponse>;
};

/**
 * Intenta refrescar el token de acceso y reintentar la petición original.
 * Debe usarse cuando una petición protegida falla con 401 o 403.
 * @param url La URL de la petición original.
 * @param options Las opciones de fetch de la petición original.
 * @returns La respuesta de la petición reintentada.
 * @throws AppError si no hay refresh token, si el refresh falla, o si la petición reintentada falla.
 */
export const attemptTokenRefreshAndRetry = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  const currentRefreshToken = useAuthStore.getState().refreshToken;

  if (!currentRefreshToken) {
    useAuthStore.getState().logout();
    throw createAppError(
      "No refresh token available. Please log in again.",
      "attemptTokenRefreshAndRetry: Missing refresh token.",
      401,
      "auth",
      true,
      true
    );
  }

  try {
    const refreshResult = await refreshToken(currentRefreshToken);

    const newAccessToken = refreshResult.accessToken;

    // Update auth store with the new access token (keep the refresh token)
    useAuthStore.getState().setAuth({
      username: useAuthStore.getState().username!, // Assuming username is always available here
      accessToken: newAccessToken,
      refreshToken: currentRefreshToken, // Keep the old refresh token
    });

    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...((options.headers as Record<string, string>) || {}),
        Authorization: `Bearer ${newAccessToken}`, // Use the new access token
      },
    };

    const retryResponse = await fetch(url, retryOptions);

    return retryResponse;
  } catch (err: any) {
    // Catch any error from the refreshToken call
    console.error("Token refresh failed:", err);
    useAuthStore.getState().logout(); // Force logout on refresh failure

    // Check if the caught error is an instance of our AppError class
    if (err instanceof AppError) {
      throw err; // Re-throw the AppError instance
    } else if (err instanceof Error) {
      throw createAppError(
        "Failed to refresh session. Please log in again.",
        `Refresh token process error: ${err.message}`,
        undefined,
        "auth",
        true,
        true,
        err // Pass the original Error instance
      );
    } else {
      throw createAppError(
        "An unexpected error occurred during session refresh.",
        JSON.stringify(err),
        undefined,
        "auth",
        true,
        true,
        err // Pass the unknown value
      );
    }
  }
};
