import React from "react";
import { MarkdownEditorWithTranslation } from "../components/MarkdownEditorWithTranslation";
import { useArticleStore } from "../stores/articleStore";
import styles from "../styles/EditorPage.module.css";

const EditorPage: React.FC = () => {
  const currentEditorStep = useArticleStore((state) => state.currentEditorStep);

  return (
    <div className={styles.editorPageContainer}>
      {currentEditorStep === "WRITING_TRANSLATING" && (
        <MarkdownEditorWithTranslation />
      )}
    </div>
  );
};

export default EditorPage;
