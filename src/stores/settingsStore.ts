import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TranslationLanguage } from "../interfaces/translationService.interface"; // Importa la interfaz de idioma

// Define la forma del estado dentro del store de configuración
interface SettingsState {
  preferredSourceLanguage: TranslationLanguage | null;
  preferredTargetLanguage: TranslationLanguage | null;
  // Acciones para modificar el estado
  setPreferredLanguages: (
    source: TranslationLanguage | null,
    target: TranslationLanguage | null
  ) => void;
  clearPreferredLanguages: () => void;
}

// Crea el store de Zustand con persistencia
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Estado inicial
      preferredSourceLanguage: null,
      preferredTargetLanguage: null,

      // Acción para establecer los idiomas preferidos
      setPreferredLanguages: (source, target) =>
        set({
          preferredSourceLanguage: source,
          preferredTargetLanguage: target,
        }),

      // Acción para limpiar los idiomas preferidos
      clearPreferredLanguages: () =>
        set({
          preferredSourceLanguage: null,
          preferredTargetLanguage: null,
        }),
    }),
    {
      name: "user-settings", // Nombre clave en el almacenamiento (ej. localStorage)
      storage: createJSONStorage(() => localStorage), // Usa localStorage como almacenamiento
      // Opcional: solo guardar ciertas partes del estado
      // partialize: (state) => ({ preferredSourceLanguage: state.preferredSourceLanguage, preferredTargetLanguage: state.preferredTargetLanguage }),
      // Opcional: migración de versiones si la estructura del estado cambia
      // version: 1,
      // migrate: (persistedState, version) => {
      //   if (version === 0) {
      //     // Migrar estado de la versión 0 a la versión 1
      //     // const state = persistedState as any;
      //     // return { ...state, newField: 'defaultValue' };
      //   }
      //   return persistedState as any;
      // },
    }
  )
);
