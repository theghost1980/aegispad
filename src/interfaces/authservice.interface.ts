export interface ChallengeResponse {
  challenge?: string;
  error?: string;
}

export interface VerifySignatureSuccessResponse {
  success: true;
  accessToken: string;
  refreshToken: string;
  role: "admin" | "user";
}

export interface BackendErrorResponse {
  error: string;
}

export interface ValidateTokenSuccessResponse {
  success: true;
  username: string;
}

export interface ValidateTokenErrorResponse {
  success: false;
  message: string;
}

export interface RefreshTokenSuccessResponse {
  accessToken: string;
}

export interface RefreshTokenErrorResponse {
  error: string;
}

export interface LogoutSuccessResponse {
  success: true;
  message: string;
}
