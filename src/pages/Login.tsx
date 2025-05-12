import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiveAccountSuggestions } from "../components/HiveAccountSuggestions";
import { loginWithHive } from "../keychain/loginWithHive";
import { useErrorStore } from "../stores/errorStore";
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
    <div>
      <h1>Iniciar sesión con Hive</h1>{" "}
      <input
        ref={inputRef}
        placeholder="Tu usuario Hive"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Iniciar sesión</button>
      <HiveAccountSuggestions
        text={username}
        anchorRef={inputRef as React.RefObject<HTMLElement>}
        onSelect={handleSelect}
      />
    </div>
  );
}
