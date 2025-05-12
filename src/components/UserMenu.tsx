// src/components/UserMenu.tsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { logout as logoutService } from "../services/authService"; // Import the logout service function
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";
// Import AppError as a class
import styles from "../styles/UserMenu.module.css";
import { AppError, createAppError } from "../types/error";

export function UserMenu() {
  const { username, refreshToken, logout: storeLogout } = useAuthStore(); // Get username, refreshToken, and the logout action from the store
  const { setError } = useErrorStore(); // Get the action to set errors
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Reference to detect clicks outside

  // Close the menu if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (!refreshToken) {
      // Use createAppError to create an AppError instance
      setError(
        createAppError(
          "No refresh token found.",
          "Logout attempt with no refresh token in store.",
          undefined,
          "auth",
          true,
          true
        )
      );
      storeLogout(); // Clear the store locally just in case
      return;
    }

    try {
      await logoutService(refreshToken); // Call the backend logout service
      storeLogout(); // Clear the authentication state in the Zustand store
      // Optional: Redirect the user to the home or login page
      // navigate('/'); // If using useNavigate here, UserMenu would need to be a hook or receive navigate via prop
      console.log("Sesión cerrada exitosa");
    } catch (err: any) {
      console.error("Error durante el logout:", err);
      // Check if the caught error is an instance of our AppError class
      if (err instanceof AppError) {
        setError(err); // Set the caught AppError instance
      } else if (err instanceof Error) {
        setError(
          createAppError(
            `Error al cerrar sesión: ${err.message}`,
            err.stack || err.message,
            undefined,
            "auth",
            true,
            true,
            err // Pass the original Error instance
          )
        );
      } else {
        setError(
          createAppError(
            "Ocurrió un error inesperado al cerrar sesión.",
            JSON.stringify(err),
            undefined,
            "auth",
            true,
            true,
            err // Pass the unknown value
          )
        );
      }
    } finally {
      setIsMenuOpen(false); // Close the menu after attempting logout
    }
  };

  return (
    <div className={styles.userMenuContainer} ref={menuRef}>
      <button
        className={styles.usernameButton}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {username} {/* Show the username */}
      </button>

      {isMenuOpen && (
        <ul className={styles.dropdownMenu}>
          <li className={styles.menuItem}>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              {" "}
              {/* Link to profile */}
              Perfil
            </Link>
          </li>
          <li className={styles.menuItem}>
            <button onClick={handleLogout}>
              {" "}
              {/* Logout button */}
              Cerrar Sesión
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
