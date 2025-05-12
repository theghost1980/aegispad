import React from "react";
import EditorStepper from "../components/EditorStepper"; // Importamos el stepper
import FormatSelector from "../components/FormatSelector";
import { MarkdownEditorWithTranslation } from "../components/MarkdownEditorWithTranslation";
import { useArticleStore } from "../stores/articleStore";
import styles from "../styles/EditorPage.module.css"; // Estilos para esta página

const EditorPage: React.FC = () => {
  const currentEditorStep = useArticleStore((state) => state.currentEditorStep);
  const title = useArticleStore((state) => state.title); // Para el título del artículo
  const setTitle = useArticleStore((state) => state.setTitle);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <div className={styles.editorPageContainer}>
      <EditorStepper /> {/* El stepper siempre visible en esta página */}
      {/* Campo para el título del artículo, visible en todas las etapas del editor */}
      <div className={styles.titleInputContainer}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título de tu artículo..."
          className={styles.titleInput}
        />
      </div>
      {currentEditorStep === "WRITING_TRANSLATING" && (
        <MarkdownEditorWithTranslation />
      )}
      {currentEditorStep === "SELECTING_FORMAT" && <FormatSelector />}
      {/* Más adelante aquí irá el componente para REVIEWING_PUBLISHING cuando se navegue a /editor/review */}
    </div>
  );
};

export default EditorPage;
