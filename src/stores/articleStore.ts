import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type EditorStep =
  | "WRITING_TRANSLATING"
  | "SELECTING_FORMAT"
  | "REVIEWING";

export type FormatOption = "simple" | "details"; // simple: arriba/abajo, details: original arriba, traducción en <details>

interface ArticleState {
  title: string;
  translatedTitle: string;
  originalMarkdown: string;
  translatedMarkdown: string;
  selectedFormatOption: FormatOption | null;
  combinedMarkdown: string;
  currentEditorStep: EditorStep;
  // Actions
  setTitle: (title: string) => void;
  setTranslatedTitle: (title: string) => void;
  setOriginalMarkdown: (md: string) => void;
  setTranslatedMarkdown: (md: string) => void;
  setSelectedFormatOption: (option: FormatOption | null) => void;
  setCurrentEditorStep: (step: EditorStep) => void;
  resetArticleState: () => void;
  _updateCombinedMarkdown: () => void;
}

const initialState = {
  title: "",
  translatedTitle: "",
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

      setTitle: (title) => {
        set({ title, translatedTitle: "" }); // Limpiar título traducido si el original cambia
        get()._updateCombinedMarkdown();
      },
      setTranslatedTitle: (translatedTitle) => {
        set({ translatedTitle });
        get()._updateCombinedMarkdown();
      },

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
        const {
          title,
          translatedTitle,
          originalMarkdown,
          translatedMarkdown,
          selectedFormatOption,
          // No necesitamos combinedMarkdown aquí ya que lo vamos a setear
        } = get();

        if (
          !originalMarkdown &&
          !translatedMarkdown &&
          !title &&
          !translatedTitle
        )
          return set({ combinedMarkdown: "" });

        // Lógica para construir el combinedMarkdown
        let combined = "";
        const titlePart = title ? `# ${title}\n` : "";
        // Añadir el título traducido solo si existe.
        const translatedTitlePart = translatedTitle
          ? `## ${translatedTitle}\n\n`
          : title
          ? "\n"
          : "";

        const originalBody = originalMarkdown || "";

        if (translatedMarkdown && selectedFormatOption) {
          const translatedBody = translatedMarkdown || "";
          if (selectedFormatOption === "simple") {
            // Formato simple: Original, separador, Traducción (con títulos)
            combined = `${titlePart}${translatedTitlePart}${originalBody}\n\n---\n\n${translatedBody}`;
          } else if (selectedFormatOption === "details") {
            // Formato details: Títulos, luego Original, y la Traducción dentro de <details>
            const summaryText = "Traducción AegisPad";
            combined = `${titlePart}${translatedTitlePart}${originalBody}\n\n<details>\n<summary>${summaryText}</summary>\n\n${translatedBody}\n</details>`;
          }
        } else {
          // Si no hay formato seleccionado o no hay traducción del cuerpo, mostrar títulos y cuerpo original.
          combined = `${titlePart}${translatedTitlePart}${originalBody}`;
        }
        set({ combinedMarkdown: combined });
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
