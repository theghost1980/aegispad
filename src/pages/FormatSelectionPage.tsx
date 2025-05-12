import React, { useEffect } from "react";
import EditorStepper from "../components/EditorStepper";
import FormatSelector from "../components/FormatSelector";
import { useArticleStore } from "../stores/articleStore";
import styles from "../styles/EditorPage.module.css"; // Reutilizamos algunos estilos de EditorPage

const FormatSelectionPage: React.FC = () => {
  const title = useArticleStore((state) => state.title);
  const setCurrentEditorStep = useArticleStore(
    (state) => state.setCurrentEditorStep
  );

  // Asegurarse de que el step sea el correcto al cargar esta página directamente
  useEffect(() => {
    setCurrentEditorStep("SELECTING_FORMAT");
  }, [setCurrentEditorStep]);

  return (
    <div className={styles.editorPageContainer}>
      <EditorStepper />
      {/* Podríamos mostrar el título aquí si es relevante, o manejarlo dentro de FormatSelector */}
      {/* <div className={styles.titleInputContainer}>
        <h2>{title || "Seleccionar Formato"}</h2>
      </div> */}
      <FormatSelector />
    </div>
  );
};

export default FormatSelectionPage;
