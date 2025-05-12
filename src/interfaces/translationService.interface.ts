export interface TranslateRequest {
  q: string;
  target?: string;
  source?: string;
}

export interface TranslateSuccessResponse {
  translatedText: string;
}

// Puedes definir una interfaz de error si el backend tiene un formato específico para errores 200 OK
// interface TranslateErrorResponse { error: string; } //TODO

export interface TranslationLanguage {
  code: string;
  name: string;
  targets: [string];
}
