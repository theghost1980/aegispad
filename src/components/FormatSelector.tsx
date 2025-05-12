import React, { useEffect } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import detailsFormat from "../assets/formats/detalle.png";
import simpleFormat from "../assets/formats/simple.png";
import { useArticleStore, type FormatOption } from "../stores/articleStore";
import styles from "../styles/FormatSelector.module.css";
import { MarkdownPreview } from "./MarkdownPreview";

const FormatSelector: React.FC = () => {
  const navigate = useNavigate();
  const {
    originalMarkdown,
    translatedMarkdown,
    selectedFormatOption,
    combinedMarkdown,
    setSelectedFormatOption,
    setCurrentEditorStep,
    title, // Para mostrar el título si existe
  } = useArticleStore();

  // Establecer una opción por defecto si no hay ninguna seleccionada y hay traducción
  useEffect(() => {
    if (translatedMarkdown && !selectedFormatOption) {
      setSelectedFormatOption("simple"); // 'simple' como opción por defecto
    }
  }, [translatedMarkdown, selectedFormatOption, setSelectedFormatOption]);

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFormatOption(event.target.value as FormatOption);
  };

  const handleNextStep = () => {
    setCurrentEditorStep("REVIEWING");
    navigate("/editor/review");
  };

  const handleGoBackToEditor = () => {
    setCurrentEditorStep("WRITING_TRANSLATING");
    navigate("/editor", { state: { fromFormatSelection: true } });
  };

  if (!originalMarkdown && !translatedMarkdown) {
    return (
      <p>
        No hay contenido para formatear. Por favor,{" "}
        <Link to="/editor">vuelve al editor</Link>.
      </p>
    );
  }

  return (
    <div className={styles.formatSelectorContainer}>
      {title && (
        <h2 className={styles.articleTitlePreview}>Revisando: {title}</h2>
      )}

      <div className={styles.optionsContainer}>
        <label className={styles.optionLabel}>
          <input
            type="radio"
            name="formatOption"
            value="simple"
            checked={selectedFormatOption === "simple"}
            onChange={handleFormatChange}
            disabled={!translatedMarkdown} // Deshabilitar si no hay traducción
          />
          <div className={styles.optionContent}>
            <img
              src={simpleFormat}
              alt="Formato Simple"
              className={styles.optionImage}
            />
            <span>Simple</span> {/* Texto más corto */}
          </div>
        </label>
        <label className={styles.optionLabel}>
          <input
            type="radio"
            name="formatOption"
            value="details"
            checked={selectedFormatOption === "details"}
            onChange={handleFormatChange}
            disabled={!translatedMarkdown} // Deshabilitar si no hay traducción
          />
          <div className={styles.optionContent}>
            <img
              src={detailsFormat}
              alt="Formato Detalles"
              className={styles.optionImage}
            />
            <span>Detalles</span> {/* Texto más corto */}
          </div>
        </label>
      </div>

      <div className={styles.previewSection}>
        <h4>Previsualización del Contenido Combinado</h4>
        {selectedFormatOption || !translatedMarkdown ? ( // Mostrar preview si hay formato o si no hay traducción (muestra solo original)
          <MarkdownPreview markdown={combinedMarkdown || originalMarkdown} />
        ) : (
          <p className={styles.noFormatSelected}>
            Selecciona un formato para ver la previsualización combinada.
          </p>
        )}
      </div>

      <div className={styles.navigationButtons}>
        <button
          onClick={handleGoBackToEditor}
          className={`${styles.navButton} ${styles.backButton}`}
        >
          Volver al Editor
        </button>
        <button
          onClick={handleNextStep}
          className={`${styles.navButton} ${styles.nextButton}`}
          disabled={!selectedFormatOption && !!translatedMarkdown} // Deshabilitar si hay traducción pero no se ha elegido formato
        >
          Siguiente: Revisar y Publicar
          <FaChevronRight style={{ marginLeft: "8px" }} />
        </button>
      </div>
    </div>
  );
};

export default FormatSelector;
