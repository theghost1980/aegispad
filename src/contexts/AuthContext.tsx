import type { ReactNode } from "react";
import React, { createContext, useContext, useEffect, useState } from "react";

//TODO decide if use or not, not being used for now!

interface User {
  username: string;
  isLoggedIn: boolean;
  isPremium: boolean;
  quota: number | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Aquí iría la lógica real para verificar sesión (ej: localStorage, backend)
        const storedUser = localStorage.getItem("currentUser");

        if (storedUser) {
          const userData: User = JSON.parse(storedUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string) => {
    setIsLoading(true);
    try {
      // Lógica REAL de Inicio de Sesión con keychain-helper
      // Ejemplo (puede variar según la API exacta de keychain-helper):
      // const authResult = await keychainLogin(username, 'challenge_string', 'Login'); // Asumiendo una función login

      // Después de la autenticación exitosa con Keychain,
      // probablemente llamas a tu Backend para obtener datos completos del usuario
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula llamada a backend

      const fetchedUserData: User = {
        username: username,
        isLoggedIn: true,
        isPremium: username === "premiumuser",
        quota: username === "premiumuser" ? null : 5000,
      };

      setUser(fetchedUserData);
      localStorage.setItem("currentUser", JSON.stringify(fetchedUserData));
    } catch (error) {
      console.error("Login error:", error);
      setUser(null);
      localStorage.removeItem("currentUser");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Lógica REAL de Cierre de Sesión (backend, keychain-helper si tiene logout)
      // Ejemplo: await keychainLogout(); // Si keychain-helper tiene una función de logout

      await new Promise((resolve) => setTimeout(resolve, 500)); // Simula limpieza en backend

      setUser(null);
      localStorage.removeItem("currentUser");
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      localStorage.removeItem("currentUser");
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
