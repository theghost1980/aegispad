// src/keychain/loginWithHive.ts

import { KeychainHelper } from "keychain-helper";
import { getChallenge, verifySignature } from "../services/authService";
import { getAccountByUsername } from "../services/hiveService"; // Assuming correct path
import { useAuthStore } from "../stores/authStore";
// Import AppError as a class
import { AppError, createAppError } from "../types/error";

// loginWithHive now returns a Promise that resolves when the auth flow is complete
export async function loginWithHive(usernameFromInput: string): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const username = usernameFromInput || localStorage.getItem("username");
      if (!username) {
        // Reject with an AppError instance
        return reject(
          createAppError(
            "El nombre de usuario es necesario.",
            undefined,
            undefined,
            "validation",
            true,
            false
          )
        );
      }

      const hiveAccount = await getAccountByUsername(username);

      if (!hiveAccount) {
        // Reject with an AppError instance
        return reject(
          createAppError(
            `La cuenta Hive "${username}" no existe.`,
            undefined,
            undefined,
            "validation",
            true,
            false
          )
        );
      }

      const challengeResponse = await getChallenge(username);

      if (!challengeResponse.challenge) {
        if (challengeResponse.error) {
          // Reject with an AppError instance
          return reject(
            createAppError(
              `Error obteniendo el desafío: ${challengeResponse.error}`,
              `getChallenge returned error: ${challengeResponse.error}`,
              undefined,
              "auth",
              true,
              true
            )
          );
        } else {
          // Reject with an AppError instance
          return reject(
            createAppError(
              "Error inesperado al obtener el desafío.",
              "getChallenge returned no challenge and no error.",
              undefined,
              "general",
              true,
              true
            )
          );
        }
      }

      const challenge = challengeResponse.challenge;

      // Call KeychainHelper.requestLogin. The rest of the logic happens in the callback.
      KeychainHelper.requestLogin(
        username,
        challenge,
        async (keychainResponse) => {
          // This callback executes when the user interacts with Keychain

          if (!keychainResponse.success) {
            console.error(
              "Error al firmar con Keychain:",
              keychainResponse.message
            );
            // Reject with an AppError instance
            return reject(
              createAppError(
                `Error al confirmar la operación en Keychain: ${
                  keychainResponse.message || "Operación cancelada/fallida"
                }`,
                `Keychain login failed: ${keychainResponse.message}`,
                keychainResponse.code,
                "keychain",
                true,
                false // Don't log to external service if it's user cancellation
              )
            );
          }

          // If Keychain was successful, proceed to verify the signature with the backend
          try {
            const verificationResult = await verifySignature(
              username,
              keychainResponse.result // keychainResponse.result contains the signature hex
            );

            // If signature verification is successful:
            // 1. Update the auth store
            useAuthStore
              .getState()
              .setAuth({
                username,
                accessToken: verificationResult.accessToken,
                refreshToken: verificationResult.refreshToken,
              });

            console.log("Inicio de sesión exitoso");
            // 2. Resolve the main loginWithHive promise
            resolve(); // <-- This resolves the promise, allowing Login.tsx to navigate
          } catch (err: any) {
            // If verifySignature fails (throws AppError), reject the main promise
            console.error("Error durante la verificación de firma:", err);
            // Check if the caught error is an instance of our AppError class
            if (err instanceof AppError) {
              return reject(err); // Re-throw the AppError instance
            } else if (err instanceof Error) {
              return reject(
                createAppError(
                  `Error durante la verificación de firma: ${err.message}`,
                  err.stack || err.message,
                  undefined,
                  "auth",
                  true,
                  true,
                  err // Pass the original Error instance
                )
              );
            } else {
              return reject(
                createAppError(
                  "Ocurrió un error inesperado durante la verificación de firma.",
                  JSON.stringify(err),
                  undefined,
                  "auth",
                  true,
                  true,
                  err // Pass the unknown value
                )
              );
            }
          }
        },
        "AegisPad Login" // Message for Keychain
      );
    } catch (err: any) {
      // This catch will only catch SYNCHRONOUS errors that occur *before* calling KeychainHelper.requestLogin
      // (e.g., errors in getAccountByUsername or getChallenge).
      console.error(
        "Error sincrónico en loginWithHive antes de Keychain:",
        err
      );
      // Reject the main promise with the caught error
      // Check if the caught error is an instance of our AppError class
      if (err instanceof AppError) {
        return reject(err); // Re-throw the AppError instance
      } else if (err instanceof Error) {
        return reject(
          createAppError(
            `Error durante el inicio de sesión: ${err.message}`,
            err.stack || err.message,
            undefined,
            "general",
            true,
            true,
            err // Pass the original Error instance
          )
        );
      } else {
        return reject(
          createAppError(
            "Ocurrió un error inesperado durante el inicio de sesión.",
            JSON.stringify(err),
            undefined,
            "general",
            true,
            true,
            err // Pass the unknown value
          )
        );
      }
    }
  });
}
