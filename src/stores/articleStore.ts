import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type EditorStep =
  | "WRITING_TRANSLATING"
  | "SELECTING_FORMAT"
  | "REVIEWING_PUBLISHING";

export type FormatOption = "simple" | "details"; // simple: arriba/abajo, details: original arriba, traducción en <details>

interface ArticleState {
  title: string;
  originalMarkdown: string;
  translatedMarkdown: string;
  selectedFormatOption: FormatOption | null;
  combinedMarkdown: string;
  currentEditorStep: EditorStep;
  // Actions
  setTitle: (title: string) => void;
  setOriginalMarkdown: (md: string) => void;
  setTranslatedMarkdown: (md: string) => void;
  setSelectedFormatOption: (option: FormatOption | null) => void;
  setCurrentEditorStep: (step: EditorStep) => void;
  resetArticleState: () => void;
  // Internal helper (not directly called by components usually)
  _updateCombinedMarkdown: () => void;
}

const initialState = {
  title: "",
  originalMarkdown: "",
  translatedMarkdown: "",
  selectedFormatOption: null,
  combinedMarkdown: "",
  currentEditorStep: "WRITING_TRANSLATING" as EditorStep,
};

export const useArticleStore = create<ArticleState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTitle: (title) => set({ title }),

      setOriginalMarkdown: (md) => {
        set({ originalMarkdown: md });
        get()._updateCombinedMarkdown();
      },

      setTranslatedMarkdown: (md) => {
        set({ translatedMarkdown: md });
        get()._updateCombinedMarkdown();
      },

      setSelectedFormatOption: (option) => {
        set({ selectedFormatOption: option });
        get()._updateCombinedMarkdown();
      },

      setCurrentEditorStep: (step) => set({ currentEditorStep: step }),

      _updateCombinedMarkdown: () => {
        const { originalMarkdown, translatedMarkdown, selectedFormatOption } =
          get();
        let newCombinedMarkdown = originalMarkdown; // Por defecto, si no hay traducción o formato

        if (translatedMarkdown) {
          if (selectedFormatOption === "simple") {
            newCombinedMarkdown = `${originalMarkdown}\n\n---\n\n${translatedMarkdown}`;
          } else if (selectedFormatOption === "details") {
            // TODO: Obtener el idioma de destino para el summary, por ahora hardcodeado
            const summaryText = "Ver Traducción";
            newCombinedMarkdown = `${originalMarkdown}\n\n<details>\n<summary>${summaryText}</summary>\n\n${translatedMarkdown}\n</details>`;
          } else {
            // Si no hay formato seleccionado pero hay traducción, podríamos decidir un default o dejar solo el original.
            // Por ahora, si hay traducción pero no formato, mostramos solo el original.
            // O podríamos hacer que 'simple' sea el default si hay traducción.
            // Para este caso, si no hay formato, y hay traducción, dejemos el original.
            // El usuario debe seleccionar un formato para ver la combinación.
            newCombinedMarkdown = originalMarkdown;
          }
        }
        set({ combinedMarkdown: newCombinedMarkdown });
      },

      resetArticleState: () => {
        set(initialState);
        // También podrías querer limpiar el localStorage aquí si es necesario,
        // aunque el persist middleware podría manejar la sobreescritura con initialState.
        // Opcional: localStorage.removeItem('article-storage'); y luego recargar o re-setear.
      },
    }),
    {
      name: "article-storage", // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage), // Usar localStorage
      // Opcional: partialize para elegir qué partes del estado persistir
      // partialize: (state) => ({ originalMarkdown: state.originalMarkdown, ... }),
    }
  )
);
