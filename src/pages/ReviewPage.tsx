import React, { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPaperPlane,
  FaSave,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MarkdownPreview } from "../components/MarkdownPreview";
import { useArticleStore } from "../stores/articleStore";
import styles from "../styles/ReviewPage.module.css"; // Crearemos este archivo

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    title,
    translatedTitle,
    getCombinedMarkdown,
    setCurrentEditorStep,
    currentEditorStep,
  } = useArticleStore();

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const combinedMarkdown = getCombinedMarkdown(); // Obtener el markdown combinado

  useEffect(() => {
    // Asegurarse de que el step sea el correcto al cargar esta página
    if (currentEditorStep !== "REVIEWING") {
      setCurrentEditorStep("REVIEWING");
    }
  }, [setCurrentEditorStep, currentEditorStep]);

  const togglePreview = () => {
    setIsPreviewVisible(!isPreviewVisible);
  };

  const handleSaveAsTemplate = () => {
    alert("// TODO: Lógica para Guardar como plantilla");
  };

  const handleSchedulePost = () => {
    alert("// TODO: Lógica para Programar publicación");
  };

  const handlePublish = () => {
    console.log("Publicando artículo...");
    console.log("Título:", title);
    console.log("Título Traducido:", translatedTitle);
    console.log("Contenido Combinado:", combinedMarkdown);
    // TODO: Aquí iría la lógica real de publicación
    alert("Artículo enviado a la consola para simular publicación.");
    // Opcionalmente, navegar a otra página o mostrar un mensaje de éxito
  };

  const handleGoBackToFormatSelection = () => {
    setCurrentEditorStep("SELECTING_FORMAT");
    navigate("/editor/format");
  };

  return (
    <div className={styles.reviewPageContainer}>
      {(title || translatedTitle) && (
        <div className={styles.titleDisplayContainer}>
          {title && <h1>{title}</h1>}
          {translatedTitle && <h2>{translatedTitle}</h2>}
        </div>
      )}

      <div className={styles.contentArea}>
        <div
          className={`${styles.rawMarkdownPane} ${
            !isPreviewVisible ? styles.fullWidth : ""
          }`}
        >
          <textarea
            value={combinedMarkdown}
            readOnly
            className={styles.markdownTextarea}
            aria-label="Markdown crudo del artículo"
          />
        </div>

        {isPreviewVisible && (
          <div className={styles.previewPane}>
            <MarkdownPreview markdown={combinedMarkdown} />
          </div>
        )}

        <button
          onClick={togglePreview}
          className={styles.togglePreviewButton}
          title={
            isPreviewVisible
              ? "Ocultar Previsualización"
              : "Mostrar Previsualización"
          }
        >
          {isPreviewVisible ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      <div className={styles.actionMenuContainer}>
        <button onClick={handleSaveAsTemplate} className={styles.actionButton}>
          <FaSave className={styles.actionButtonIcon} />
          <span className={styles.actionButtonText}>Guardar Plantilla</span>
        </button>
        <button onClick={handleSchedulePost} className={styles.actionButton}>
          <FaClock className={styles.actionButtonIcon} />
          <span className={styles.actionButtonText}>Programar</span>
        </button>
        <button
          onClick={handlePublish}
          className={`${styles.actionButton} ${styles.publishButton}`}
        >
          <FaPaperPlane className={styles.actionButtonIcon} />
          <span className={styles.actionButtonText}>Publicar</span>
        </button>
      </div>

      <div className={styles.navigationButtons}>
        <button
          onClick={handleGoBackToFormatSelection}
          className={`${styles.navButton} ${styles.backButton}`}
        >
          <FaChevronLeft style={{ marginRight: "8px" }} />
          Volver a Formato
        </button>
        {/* No hay botón "Siguiente" aquí, ya que es el último paso antes de acciones finales */}
      </div>
    </div>
  );
};

export default ReviewPage;
