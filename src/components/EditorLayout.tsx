import React from "react";
import { Outlet } from "react-router-dom";
import EditorStepper from "../components/EditorStepper";
import styles from "../styles/EditorLayout.module.css"; // Crearemos este archivo

const EditorLayout: React.FC = () => {
  return (
    <div className={styles.editorLayoutContainer}>
      <EditorStepper />
      <div className={styles.editorContent}>
        <Outlet /> {/* Aquí se renderizarán las páginas hijas */}
      </div>
    </div>
  );
};
export default EditorLayout;
