import { KeychainHelper } from "keychain-helper"; // Asegúrate que esta ruta y función sean correctas
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
import TagInput from "../components/TagInput";
import { APP_NAME, APP_VERSION } from "../constants/general";
import { useArticleStore } from "../stores/articleStore";
import { useAuthStore } from "../stores/authStore";
import { useErrorStore } from "../stores/errorStore";
import { useOperationLoadingStore } from "../stores/operationLoadingStore";
import { useSuccessNotificationStore } from "../stores/successNotificationStore";
import styles from "../styles/ReviewPage.module.css"; // Crearemos este archivo
import { createAppError } from "../types/error";

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    title,
    translatedTitle,
    combinedMarkdown,
    setCurrentEditorStep,
    currentEditorStep,
  } = useArticleStore();
  const { username: author } = useAuthStore();
  const { showLoader, hideLoader } = useOperationLoadingStore();
  const { showSuccess } = useSuccessNotificationStore();
  const { setError, clearError } = useErrorStore();

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [currentTags, setCurrentTags] = useState<string[]>([]);

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

  const handlePublish = async () => {
    clearError(); // Limpiar errores previos
    if (currentTags.length < 2) {
      setError(
        createAppError(
          "Etiquetas insuficientes",
          "Se requieren al menos 2 etiquetas para publicar.",
          undefined,
          "validation"
        )
      );
      return;
    }
    if (!author) {
      setError(
        createAppError(
          "Usuario no autenticado",
          "No se pudo obtener el autor para la publicación.",
          undefined,
          "auth"
        )
      );
      return;
    }
    if (!title.trim()) {
      setError(
        createAppError(
          "Título vacío",
          "El título del artículo no puede estar vacío.",
          undefined,
          "validation"
        )
      );
      return;
    }

    // Generar permlink: para un post, es el título sanitizado.
    // Para comentarios, se suele anteponer "re-" y añadir aleatoriedad.
    // Aquí asumimos un post nuevo.
    const permlink = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Eliminar caracteres no alfanuméricos excepto espacios y guiones
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .replace(/-+/g, "-"); // Reemplazar múltiples guiones con uno solo
    const parentPermlink = currentTags[0]; // Usar la primera etiqueta como categoría principal

    const jsonMetadata = {
      tags: currentTags,
      app: `${APP_NAME.toLowerCase()}/${APP_VERSION}`,
      format: "markdown",
      // Opcional: puedes añadir una imagen principal aquí si la tienes
      // image: ["URL_DE_LA_IMAGEN_PRINCIPAL"]
    };

    showLoader("Publicando en HIVE...");
    try {
      // Usamos una promesa para envolver la llamada con callback de KeychainHelper
      const response: any = await new Promise((resolve, reject) => {
        KeychainHelper.requestPost(
          author,
          title, // Title del post
          combinedMarkdown, // Body del post
          parentPermlink, // Parent permlink (primera etiqueta)
          "", // Parent account (cadena vacía para post principal)
          JSON.stringify(jsonMetadata), // JSON Metadata
          permlink, // Permlink del post
          null, // Comment options (null para post principal)
          (keychainResponse) => {
            if (keychainResponse.success) {
              resolve(keychainResponse);
            } else {
              // Si Keychain devuelve un error en su estructura de respuesta
              reject(
                new Error(
                  keychainResponse.message || "Error desconocido de Keychain"
                )
              );
            }
          }
        );
      });

      console.log("Resultado de la publicación en HIVE:", response);
      // La respuesta de requestPost ya debería ser el objeto final de Keychain
      if (
        response &&
        (response.success || (response.result && response.result.id))
      ) {
        showSuccess("¡Artículo publicado con éxito en HIVE!");
        // Opcional: resetear el estado del artículo o navegar
        // navigate("/");
      } else {
        // Este caso podría no alcanzarse si la promesa ya rechazó
        throw new Error(
          `La publicación falló o la respuesta no fue la esperada: ${JSON.stringify(
            response
          )}`
        );
      }
    } catch (err: any) {
      // Captura errores de la promesa o de la lógica anterior
      console.error("Error al publicar en HIVE:", err);
      // Si el error viene de Keychain y tiene una estructura específica, podrías querer manejarlo.
      // Por ahora, usamos el mensaje del error capturado.
      let errorMessage = "Ocurrió un error desconocido durante la publicación.";
      if (err && err.message) {
        // Intentar obtener un mensaje más específico si el error es de Keychain
        // (ej. "User rejected the transaction", "Missing posting authority", etc.)
        errorMessage = err.message;
      }

      setError(
        createAppError(
          "Error al publicar",
          errorMessage,
          err.stack,
          "keychain",
          true,
          true,
          err
        )
      );
    } finally {
      hideLoader();
    }
  };

  const handleGoBackToFormatSelection = () => {
    setCurrentEditorStep("SELECTING_FORMAT");
    navigate("/editor/format");
  };

  const handleTagsChange = (updatedTags: string[]) => {
    setCurrentTags(updatedTags);
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

      <div className={styles.tagsSection}>
        <TagInput onTagsChange={handleTagsChange} />
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
          disabled={currentTags.length < 2}
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
