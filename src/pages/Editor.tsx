import React from "react";
import EditorStepper from "../components/EditorStepper";
import { MarkdownEditorWithTranslation } from "../components/MarkdownEditorWithTranslation";
import { useArticleStore } from "../stores/articleStore";
import styles from "../styles/EditorPage.module.css";

const EditorPage: React.FC = () => {
  const currentEditorStep = useArticleStore((state) => state.currentEditorStep);
  const title = useArticleStore((state) => state.title);
  const setTitle = useArticleStore((state) => state.setTitle);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  return (
    <div className={styles.editorPageContainer}>
      <EditorStepper />
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
    </div>
  );
};

export default EditorPage;
