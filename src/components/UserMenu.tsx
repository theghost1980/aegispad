import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout as logoutService } from "../services/authService";
import { useArticleStore } from "../stores/articleStore";
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";
import styles from "../styles/UserMenu.module.css";
import { AppError, createAppError } from "../types/error";

export function UserMenu() {
  const { username, refreshToken, logout: storeLogout } = useAuthStore(); // Get username, refreshToken, and the logout action from the store
  const { setError } = useErrorStore(); // Get the action to set errors
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { resetArticleState } = useArticleStore();
  const navigate = useNavigate();

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
      storeLogout();
      return;
    }

    try {
      await logoutService(refreshToken); // Call the backend logout service
      storeLogout(); // Clear the authentication state in the Zustand store
      resetArticleState();
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
      navigate("/ogin"); // Redirige a la página de inicio o login
      window.location.reload();
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
              Perfil
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link to="/my-posts" onClick={() => setIsMenuOpen(false)}>
              {" "}
              Mis Publicaciones
            </Link>
          </li>
          <li className={styles.menuItem}>
            <button onClick={handleLogout}> Cerrar Sesión</button>
          </li>
        </ul>
      )}
    </div>
  );
}
