import type { ReactNode } from "react"; // Importación de tipo explícita si usas verbatimModuleSyntax
import React, { createContext, useContext, useEffect, useState } from "react";

// 1. Definir los Tipos para el estado del Tema
// Podemos usar uniones de strings literales para los nombres de los temas
type Theme = "light" | "dark";

// Definir los Tipos para el valor del Contexto (estado + funciones)
interface ThemeContextType {
  theme: Theme; // El tema actual
  setTheme: (theme: Theme) => void; // Función para establecer el tema
  toggleTheme: () => void; // Función para cambiar entre 'light' y 'dark'
}

// Función de utilidad para obtener el tema por defecto (ej: de localStorage o preferencia del sistema)
const getInitialTheme = (): Theme => {
  // Intenta obtener el tema de localStorage primero
  const storedTheme = localStorage.getItem("app-theme") as Theme;
  if (storedTheme) {
    return storedTheme;
  }

  // Si no hay en localStorage, usa la preferencia del sistema
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  // Por defecto, usa el tema claro
  return "light";
};

// 2. Crear el Contexto con un valor por defecto inicial
// El valor por defecto aquí es solo para dar una estructura inicial a TypeScript,
// el valor real lo proporcionará el Provider.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Crear el componente Provider
interface ThemeProviderProps {
  children: ReactNode; // Define que el Provider envolverá otros componentes
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Inicializar el estado del tema usando la función getInitialTheme
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // useEffect para guardar el tema en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    // Opcional: podrías aplicar una clase al body o al elemento root aquí
    // document.body.className = theme;
  }, [theme]); // Este efecto se ejecuta cada vez que 'theme' cambia

  // Función para establecer el tema
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Función para cambiar entre temas
  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // El valor que se proporcionará a los consumidores del contexto
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children} {/* Renderiza los componentes hijos envueltos */}
    </ThemeContext.Provider>
  );
};

// 4. Crear el hook personalizado para consumir el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
