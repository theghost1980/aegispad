// src/services/translationService.ts

import { TRANSLATION_PREFIX } from "../constants/general"; // Asumo que esta es la ruta correcta
// Actualiza la interfaz para reflejar que translatedTexts es un array
import type { TranslationLanguage } from "../interfaces/translationService.interface";
import { useAuthStore } from "../stores/authStore"; // Asumo que esta es la ruta correcta
// Import AppError como una clase
import { AppError, createAppError } from "../types/error"; // Asumo que esta es la ruta correcta
import { baseUrl } from "../utils/env.utils"; // Asumo que esta es la ruta correcta

import { attemptTokenRefreshAndRetry } from "./authService"; // Asumo que esta es la ruta correcta

// Función auxiliar para manejar respuestas de error HTTP no OK
// Retorna Promise<never> porque siempre lanza un error
const handleErrorResponse = async (
  res: Response,
  originalError?: any
): Promise<never> => {
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
    // Opcionalmente incluye el error de parseo JSON como originalError
    originalError = originalError || e;
  }

  // Lanza una instancia de la clase AppError
  throw createAppError(
    message,
    details,
    res.status,
    "network",
    true,
    true,
    originalError // Pasa el error original si está disponible
  );
};

/**
 * Envía texto o un array de textos al backend para su traducción.
 * @param q El texto o array de textos a traducir.
 * @param sourceLang El idioma de origen (ej: 'es', 'auto').
 * @param targetLang El idioma al que traducir (ej: 'en').
 * @returns Una promesa con un array de textos traducidos. (Siempre devuelve array ahora)
 * @throws AppError si la petición falla o el backend retorna un error.
 */
export const translateText = async (
  q: string | string[], // Acepta string o string[]
  sourceLang = "es",
  targetLang: string = "en"
): Promise<string[]> => {
  // Siempre retorna un array de strings
  // Si q es string y está vacío o solo son espacios
  if (typeof q === "string" && !q.trim()) {
    return [""]; // Retorna array con cadena vacía
  }
  // Si q es un array y está vacío
  if (Array.isArray(q) && q.length === 0) {
    return []; // Retorna array vacío
  }
  // Si q es un array con solo strings vacías o con espacios
  if (
    Array.isArray(q) &&
    q.every((item) => typeof item === "string" && !item.trim())
  ) {
    return q.map(() => ""); // Retorna un array de strings vacías del mismo tamaño
  }

  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw createAppError(
      "No autenticado. Por favor, inicia sesión.",
      "No access token available in auth store.",
      401,
      "auth",
      true,
      false
    );
  }

  // Aseguramos que el cuerpo de la petición siempre envíe 'q' como un array
  const requestBody = {
    q: Array.isArray(q) ? q : [q], // Si q ya es array, úsalo. Si es string, envuélvelo en un array.
    target: targetLang,
    source: sourceLang,
  };

  const originalFetchOptions: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    // Serializamos el objeto requestBody que contiene 'q' como un array
    body: JSON.stringify(requestBody),
  };

  console.log("DEBUG SERVICE: Sending request body:", requestBody); // DEBUG LOG: Verifica el cuerpo que se envía

  const translationUrl = `${baseUrl}${TRANSLATION_PREFIX}`;

  try {
    let res = await fetch(translationUrl, originalFetchOptions);

    if (res.status === 401 || res.status === 403) {
      // Intenta refrescar el token y reintentar la petición
      res = await attemptTokenRefreshAndRetry(
        translationUrl,
        originalFetchOptions
      );

      // Si después del reintento la respuesta sigue sin ser OK, maneja el error
      if (!res.ok) {
        await handleErrorResponse(res);
      }
    } else if (!res.ok) {
      // Si la respuesta original no es OK (y no fue 401/403), maneja el error
      await handleErrorResponse(res);
    }

    // La respuesta del backend ahora siempre tiene un campo 'translatedTexts' que es un array
    const data: { translatedTexts: string[] } | any = await res.json(); // Usamos any para la verificación inicial

    // Verificar que la respuesta contiene el campo 'translatedTexts' y es un array de strings
    // Esto coincide con lo que nuestro backend ahora garantiza enviar
    if (
      !data ||
      !Array.isArray(data.translatedTexts) ||
      data.translatedTexts.some((item: any) => typeof item !== "string")
    ) {
      throw createAppError(
        `Respuesta de traducción inesperada del backend`,
        `Backend returned unexpected format: missing or invalid 'translatedTexts' array. Response: ${JSON.stringify(
          data
        )}`,
        undefined,
        "general",
        true,
        true
      );
    }

    // Devolvemos el array de textos traducidos
    return data.translatedTexts;
  } catch (err: any) {
    console.error(
      "Error in translateText service (after potential retry attempt):",
      err
    );
    // Ahora verifica si el error capturado es una instancia de nuestra clase AppError
    if (err instanceof AppError) {
      throw err; // Relanza la instancia de AppError
    } else if (err instanceof Error) {
      // Si es un Error JS básico inesperado
      throw createAppError(
        `Fallo en el servicio de traducción: ${err.message}`,
        err.stack || err.message,
        undefined,
        "network",
        true,
        true,
        err // Pasa la instancia de Error original
      );
    } else {
      // Algo completamente inesperado
      throw createAppError(
        `Ocurrió un error desconocido en traducción`,
        JSON.stringify(err),
        undefined,
        "general",
        true,
        true,
        err // Pasa el valor desconocido
      );
    }
  }
};

/**
 * Obtiene la lista de idiomas disponibles para traducción desde el backend.
 * @returns Una promesa con un array de objetos TranslationLanguage.
 * @throws AppError si la petición falla o el backend retorna un error.
 */
export const getLanguages = async (): Promise<TranslationLanguage[]> => {
  const accessToken = useAuthStore.getState().accessToken;

  if (!accessToken) {
    throw createAppError(
      "No autenticado. Por favor, inicia sesión para obtener la lista de idiomas.",
      "No access token available in auth store for getLanguages.",
      401,
      "auth",
      true,
      false
    );
  }

  const languagesUrl = `${baseUrl}${TRANSLATION_PREFIX}/languages`;

  const originalFetchOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  try {
    let res = await fetch(languagesUrl, originalFetchOptions);

    if (res.status === 401 || res.status === 403) {
      // Intenta refrescar el token y reintentar la petición
      res = await attemptTokenRefreshAndRetry(
        languagesUrl,
        originalFetchOptions
      );

      // Si después del reintento la respuesta sigue sin ser OK, maneja el error
      if (!res.ok) {
        await handleErrorResponse(res);
      }
    } else if (!res.ok) {
      // Si la respuesta original no es OK (y no fue 401/403), maneja el error
      await handleErrorResponse(res);
    }

    // Asumiendo que el backend retorna { success: true, list: TranslationLanguage[] } en éxito
    const data: { success: true; list: TranslationLanguage[] } | any =
      await res.json(); // Usamos any para la verificación inicial

    if (!data || data.success !== true || !Array.isArray(data.list)) {
      throw createAppError(
        `Respuesta de idiomas inesperada`,
        `Backend returned unexpected format for languages: ${JSON.stringify(
          data
        )}`,
        undefined,
        "general",
        true,
        true
      );
    }

    // Validar que los elementos del array tengan la estructura esperada (opcional pero recomendado)
    // data.list.forEach(lang => {
    //     if (typeof lang.code !== 'string' || typeof lang.name !== 'string' || !Array.isArray(lang.targets)) {
    //          console.warn("Unexpected language object format:", lang);
    //          // Podrías lanzar un error aquí o simplemente filtrar/ignorar
    //     }
    // });

    return data.list as TranslationLanguage[]; // Retorna la lista de idiomas
  } catch (err: any) {
    console.error(
      "Error in getLanguages service (after potential retry attempt):",
      err
    );
    // Ahora verifica si el error capturado es una instancia de nuestra clase AppError
    if (err instanceof AppError) {
      throw err; // Relanza la instancia de AppError
    } else if (err instanceof Error) {
      // Si es un Error JS básico inesperado
      throw createAppError(
        `Fallo al obtener la lista de idiomas: ${err.message}`,
        err.stack || err.message,
        undefined,
        "network",
        true,
        true,
        err // Pasa la instancia de Error original
      );
    } else {
      // Algo completamente inesperado
      throw createAppError(
        `Ocurrió un error desconocido al obtener idiomas`,
        JSON.stringify(err),
        undefined,
        "general",
        true,
        true,
        err // Pasa el valor desconocido
      );
    }
  }
};
