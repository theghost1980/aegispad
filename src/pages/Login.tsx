import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiveAccountSuggestions } from "../components/HiveAccountSuggestions";
import { loginWithHive } from "../keychain/loginWithHive";
import { useErrorStore } from "../stores/errorStore";
import styles from "../styles/LoginPage.module.css";
import { AppError, createAppError } from "../types/error";

export function Login() {
  const [username, setUsername] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { setError, clearError } = useErrorStore();

  const handleLogin = async () => {
    clearError();
    try {
      await loginWithHive(username.trim());
      navigate("/profile");
    } catch (err: any) {
      console.error("Error al iniciar sesión (capturado en Login.tsx):", err);
      if (err instanceof AppError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(
          createAppError(
            `Error inesperado: ${err.message}`,
            err.stack || err.message,
            undefined,
            "general",
            true,
            true,
            err
          )
        );
      } else {
        setError(
          createAppError(
            "Ocurrió un error inesperado durante el inicio de sesión.",
            JSON.stringify(err),
            undefined,
            "general",
            true,
            true,
            err
          )
        );
      }
    }
  };

  const handleSelect = (account: string) => {
    setUsername(account);
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.loginFormContainer}>
        <img
          src="/src/assets/logos/aegispad256.png"
          alt="Aegispad Logo"
          className={styles.logo}
        />
        <h1 className={styles.loginTitle}>Bienvenido a Aegispad</h1>
        <p className={styles.loginSubtitle}>
          Inicia sesión con tu cuenta de Hive
        </p>
        <div className={styles.inputGroup}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Tu usuario Hive"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())} // Convertir a minúsculas
            className={styles.loginInput}
            aria-label="Nombre de usuario de Hive"
          />
          <HiveAccountSuggestions
            text={username}
            anchorRef={inputRef as React.RefObject<HTMLElement>}
            onSelect={handleSelect}
          />
        </div>
        <button onClick={handleLogin} className={styles.loginButton}>
          Iniciar sesión con Keychain
        </button>
        <p className={styles.loginBenefits}>
          Redacta en Markdown, traduce al instante y publica directo en HIVE.
          ¡Todo sin salir de Aegispad!
        </p>
      </div>
    </div>
  );
}
