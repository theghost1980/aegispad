import type { Root, Text } from "mdast";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaChevronLeft, FaChevronRight, FaCog } from "react-icons/fa";
import { IoLanguage } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom"; // Importar useNavigate
import { translateText } from "../services/translationService";
import { useArticleStore } from "../stores/articleStore";
import { useErrorStore } from "../stores/errorStore";
import { useOperationLoadingStore } from "../stores/operationLoadingStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useSuccessNotificationStore } from "../stores/successNotificationStore";
import styles from "../styles/MarkdownEditorWithTranslation.module.css";
import { AppError, createAppError } from "../types/error";
import { debounce } from "../utils/debounce";
import {
  cleanMarkdownForTranslation,
  reinsertMarkdownElements,
} from "../utils/markdownCleaner";
import { OperationTimer } from "../utils/timeTracker";
import { countWords } from "../utils/wordCount";
import { ConfirmTranslationModal } from "./ConfirmTranslationModal";
import { MarkdownPreview } from "./MarkdownPreview";
import { MarkdownToolbar } from "./MarkdownToolbar";

export function MarkdownEditorWithTranslation() {
  const [markdownText, setMarkdownText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [debounceProgress, setDebounceProgress] = useState(0);
  const { setError, clearError } = useErrorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate(); // Hook para la navegación

  const [isTranslationPaneVisible, setIsTranslationPaneVisible] =
    useState(true);

  const { preferredSourceLanguage, preferredTargetLanguage } =
    useSettingsStore();

  const {
    showLoader,
    hideLoader,
    isLoading: isOperationLoading,
  } = useOperationLoadingStore();

  const wordCount = useMemo(() => countWords(markdownText), [markdownText]);

  const { showSuccess } = useSuccessNotificationStore();

  const {
    setOriginalMarkdown,
    setTranslatedMarkdown,
    setCurrentEditorStep,
    originalMarkdown: storeOriginalMarkdown,
    translatedMarkdown: storeTranslatedMarkdown,
  } = useArticleStore();

  const DEBOUNCE_DELAY = 500;

  const debouncedTranslate = useCallback(
    debounce(
      async (text: string) => {
        if (
          !text.trim() ||
          !preferredSourceLanguage ||
          !preferredTargetLanguage
        ) {
          setTranslatedText("");
          if (!preferredSourceLanguage || !preferredTargetLanguage) {
            console.warn("Translation languages not set in settings.");
          }
          return;
        }
        showLoader("Traduciendo texto...");
        clearError();
        let originalTree: Root | null = null;
        let extractedFragments: { node: Text; value: string }[] = [];
        const translationTimer = new OperationTimer("Traducción de Markdown");
        translationTimer.start();
        let finalTranslation = "";
        try {
          const {
            tree: originalTree,
            textFragments,
            tableAlignments: originalTableAlignments,
          } = cleanMarkdownForTranslation(markdownText);

          extractedFragments = textFragments;

          console.log("DEBUG EDITOR: AST después de limpieza:", originalTree);
          console.log(
            "DEBUG EDITOR: Fragmentos de texto extraídos:",
            extractedFragments
          );

          const textsToTranslate = extractedFragments.map(
            (fragment) => fragment.value
          );
          console.log(
            "DEBUG EDITOR: Textos enviados a traducción (fragmentos):",
            textsToTranslate
          );

          const translatedTexts = await translateText(
            textsToTranslate,
            preferredSourceLanguage.code,
            preferredTargetLanguage.code
          );

          console.log(
            "DEBUG EDITOR: Array de textos traducidos recibido:",
            translatedTexts
          );

          if (
            originalTree &&
            extractedFragments.length === translatedTexts.length
          ) {
            const finalTranslatedMarkdown = reinsertMarkdownElements(
              originalTree,
              originalTableAlignments,
              translatedTexts,
              textFragments
            );
            finalTranslation = finalTranslatedMarkdown;
            setTranslatedText(finalTranslatedMarkdown);
            // Solo si la traducción y reinserción son exitosas, actualizamos el store y notificamos
            setOriginalMarkdown(markdownText);
            setTranslatedMarkdown(finalTranslatedMarkdown);
            const duration = translationTimer.stop();
            if (duration !== null) {
              const formattedTime = translationTimer.getFormattedDuration();
              showSuccess(`Traducción realizada en ${formattedTime}.`);
              console.log(`La operación de traducción tardó: ${formattedTime}`);
            }
            console.log(
              "DEBUG EDITOR: translatedText state updated with:",
              finalTranslatedMarkdown
            );
          } else {
            translationTimer.stop();
            console.error(
              "DEBUG EDITOR: Inconsistencia entre fragmentos extraídos y traducidos.",
              {
                extractedCount: extractedFragments.length,
                translatedCount: translatedTexts.length,
                translatedTexts,
                translatedTextsArray: translatedTexts,
              }
            );
            const errorMsg =
              "Error: El servicio de traducción devolvió una estructura inesperada.";
            setError(
              createAppError(
                errorMsg,
                "Inconsistent fragment count from translation service.",
                undefined,
                "traduccion",
                true,
                true
              )
            );
            setTranslatedText(errorMsg); // Mostrar error en la preview
            setTranslatedMarkdown(""); // Limpiar traducción en el store
          }
        } catch (err: any) {
          translationTimer.stop();
          console.error("Error during translation process:", err);
          const detailedError =
            err instanceof AppError
              ? err
              : createAppError(
                  `Error en el proceso de traducción: ${
                    err.message || "Error desconocido"
                  }`,
                  err.stack || JSON.stringify(err),
                  undefined,
                  "traduccion",
                  true,
                  true,
                  err
                );
          setError(detailedError);
          setTranslatedText(`Error al traducir: ${detailedError.message}`);
          setTranslatedMarkdown("");
        } finally {
          hideLoader();
          setDebounceProgress(0);
        }
      },
      DEBOUNCE_DELAY,
      (progress) => {
        setDebounceProgress(progress);
      }
    ),
    [
      markdownText,
      setError,
      clearError,
      preferredSourceLanguage,
      preferredTargetLanguage,
      showLoader,
      hideLoader,
      setOriginalMarkdown,
      setTranslatedMarkdown,
      showSuccess,
    ]
  );

  useEffect(() => {
    return () => {
      debouncedTranslate.cancel();
    };
  }, [debouncedTranslate]);

  const handleMarkdownChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMarkdownText(event.target.value);
    console.log(
      "DEBUG EDITOR: markdownText state updated to:",
      event.target.value
    );
  };

  const handleTranslateButtonClick = () => {
    if (!markdownText.trim()) {
      setError(
        createAppError(
          "No hay texto para traducir.",
          "Intento de traducir texto vacío.",
          undefined,
          "validation"
        )
      );
      return;
    }
    setIsConfirmModalVisible(true);
  };

  const applyFormat = (
    prefix: string,
    suffix: string = prefix,
    defaultText: string = ""
  ) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText;
    let newStart;
    let newEnd;

    if (selectedText) {
      newText =
        textarea.value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        textarea.value.substring(end);
      newStart = start + prefix.length;
      newEnd = newStart + selectedText.length;
    } else {
      newText =
        textarea.value.substring(0, start) +
        prefix +
        defaultText +
        suffix +
        textarea.value.substring(end);
      newStart = start + prefix.length;
      newEnd = newStart + defaultText.length;
    }

    setMarkdownText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const handleBold = () => {
    applyFormat("**", "**");
  };

  const handleItalic = () => {
    applyFormat("*", "*");
  };

  const handleInsertLink = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const linkText = selectedText || "texto del enlace";
    let url = window.prompt("Introduce la URL del enlace:", "https://");

    if (url === null) return;
    url = url.trim();
    if (!url) {
      alert("La URL no puede estar vacía.");
      return;
    }

    const altText =
      selectedText ||
      window.prompt(
        "Introduce el texto alternativo para el enlace:",
        "texto alternativo"
      );
    if (altText === null) return;

    const markdownToInsert = `[${altText}](${url})`;

    const newText =
      textarea.value.substring(0, start) +
      markdownToInsert +
      textarea.value.substring(end);

    setMarkdownText(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        const selectionStart = start + linkText.length + 3;
        const selectionEnd = selectionStart + url.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        const selectionStart = start + 1;
        const selectionEnd = selectionStart + linkText.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      }
    }, 0);
  };

  const handleInsertImage = () => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let imageUrl = window.prompt("Introduce la URL de la imagen:", "https://");
    if (imageUrl === null) return;
    imageUrl = imageUrl.trim();
    if (!imageUrl) {
      alert("La URL de la imagen no puede estar vacía.");
      return;
    }

    const altText =
      selectedText ||
      window.prompt(
        "Introduce el texto alternativo para la imagen:",
        "texto alternativo"
      );
    if (altText === null) return;

    const markdownToInsert = `![${altText}](${imageUrl})`;

    const newText =
      textarea.value.substring(0, start) +
      markdownToInsert +
      textarea.value.substring(end);

    setMarkdownText(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        const selectionStart = start + altText.length + 4;
        const selectionEnd = selectionStart + imageUrl.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        const selectionStart = start + 2;
        const selectionEnd = selectionStart + altText.length;
        textarea.setSelectionRange(selectionStart, selectionEnd);
      }
    }, 0);
  };

  const handleInsertCodeBlock = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText;
    let newStart;
    let newEnd;

    if (selectedText) {
      if (selectedText.includes("\n")) {
        newText =
          textarea.value.substring(0, start) +
          "```\n" +
          selectedText +
          "\n```" +
          textarea.value.substring(end);
        newStart = start + 4;
        newEnd = newStart + selectedText.length;
      } else {
        newText =
          textarea.value.substring(0, start) +
          "`" +
          selectedText +
          "`" +
          textarea.value.substring(end);
        newStart = start + 1;
        newEnd = newStart + selectedText.length;
      }
    } else {
      const placeholder = "código aquí";
      newText =
        textarea.value.substring(0, start) +
        "```\n" +
        placeholder +
        "\n```" +
        textarea.value.substring(end);
      newStart = start + 4;
      newEnd = newStart + placeholder.length;
    }

    setMarkdownText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  const handleInsertDetailsBlock = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    const summaryPlaceholder = "Título del detalle";
    let detailsContent = selectedText || "Contenido aquí...";

    if (selectedText && selectedText.includes("\n")) {
      detailsContent = `\n${selectedText}\n`;
    } else if (selectedText) {
      detailsContent = `\n${selectedText}\n`;
    } else {
      detailsContent = `\n${detailsContent}\n`;
    }

    const markdownToInsert = `<details>\n<summary>${summaryPlaceholder}</summary>${detailsContent}</details>`;

    const newText =
      textarea.value.substring(0, start) +
      markdownToInsert +
      textarea.value.substring(end);

    setMarkdownText(newText);

    const summaryStart = start + "<details>\n<summary>".length;
    const summaryEnd = summaryStart + summaryPlaceholder.length;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(summaryStart, summaryEnd);
    }, 0);
  };

  const handleToggleTranslationPane = () => {
    const newVisibility = !isTranslationPaneVisible;
    setIsTranslationPaneVisible(newVisibility);
    console.log(
      "DEBUG EDITOR: Translation pane visibility toggled to:",
      newVisibility
    );
  };

  const handleContinueToFormatSelection = () => {
    if (markdownText !== storeOriginalMarkdown) {
      // Asegurarse de que el markdown más reciente esté en el store
      setOriginalMarkdown(markdownText);
    }
    setCurrentEditorStep("SELECTING_FORMAT");
    navigate("/editor/format"); // Navegar a la nueva página
  };

  const handleConfirmTranslation = () => {
    setIsConfirmModalVisible(false);
    if (
      markdownText.trim() &&
      preferredSourceLanguage &&
      preferredTargetLanguage
    ) {
      debouncedTranslate(markdownText);
    } else if (!preferredSourceLanguage || !preferredTargetLanguage) {
      setError(
        createAppError(
          "Idiomas no configurados.",
          "Por favor, configure los idiomas de origen y destino en su perfil.",
          undefined,
          "configuration",
          true,
          true
        )
      );
    }
  };

  const handleCancelTranslation = () => {
    setIsConfirmModalVisible(false);
  };

  const handleHelpModal = () => {
    alert("//TODO in future FAQ section!");
  };

  return (
    <div
      className={`${styles.editorContainer} ${
        !isTranslationPaneVisible ? styles.translationHidden : ""
      }`}
    >
      <div
        className={`${styles.editorPane} ${
          !isTranslationPaneVisible ? styles.editorPaneFullWidth : ""
        }`}
      >
        <div className={styles.paneHeader}>
          <MarkdownToolbar
            onBold={handleBold}
            onItalic={handleItalic}
            onInsertImage={handleInsertImage}
            onInsertLink={handleInsertLink}
            onInsertCodeBlock={handleInsertCodeBlock}
            onInsertDetailsBlock={handleInsertDetailsBlock}
          />
          <span className={styles.wordCount}>{wordCount} palabras</span>
          <button
            onClick={handleTranslateButtonClick}
            className={styles.translateButton}
            title={"Traducir"}
          >
            <IoLanguage style={{ marginRight: "8px" }} />
          </button>
        </div>
        {(debounceProgress > 0 || isOperationLoading) && !translatedText && (
          <div className={styles.debounceProgressBarContainer}>
            <div
              className={styles.debounceProgressBar}
              style={{ width: `${debounceProgress}%` }}
            ></div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className={styles.editorTextarea}
          value={markdownText}
          onChange={handleMarkdownChange}
          placeholder="Escribe tu artículo en Markdown aquí..."
        />
        {storeTranslatedMarkdown && (
          <div className={styles.continueButtonContainer}>
            <button
              onClick={handleContinueToFormatSelection}
              className={styles.continueButton}
              disabled={!storeTranslatedMarkdown.trim()}
              title="Continuar para seleccionar el formato de presentación"
            >
              Continuar a Selección de Formato
              <FaChevronRight style={{ marginLeft: "8px" }} />
            </button>
          </div>
        )}
      </div>

      {isTranslationPaneVisible && (
        <div className={styles.translationPane}>
          <div className={styles.paneHeader}>
            <span>{translatedText ? "Traducción" : "Previsualización"}</span>
            {preferredSourceLanguage && preferredTargetLanguage ? (
              <span className={styles.translationLanguagesDisplay}>
                {preferredSourceLanguage.name} ({preferredSourceLanguage.code})
                → {preferredTargetLanguage.name} ({preferredTargetLanguage.code}
                )
              </span>
            ) : (
              <Link
                to="/profile#language-settings"
                className={styles.configureLanguagesButton}
                title="Configurar idiomas de traducción"
              >
                <FaCog />
              </Link>
            )}
          </div>
          <div className={styles.translationOutput}>
            {translatedText ? (
              <MarkdownPreview markdown={translatedText} />
            ) : markdownText ? (
              <MarkdownPreview markdown={markdownText} />
            ) : (
              <p style={{ color: "#888", fontStyle: "italic" }}>
                La previsualización aparecerá aquí...
              </p>
            )}
            {isOperationLoading && !translatedText && (
              <p
                style={{
                  color: "#888",
                  fontStyle: "italic",
                  marginTop: "10px",
                }}
              >
                Traduciendo...
              </p>
            )}
          </div>
        </div>
      )}

      <button
        className={styles.togglePaneButton}
        onClick={handleToggleTranslationPane}
        title={
          isTranslationPaneVisible
            ? "Ocultar panel derecho"
            : "Mostrar panel derecho"
        }
      >
        {isTranslationPaneVisible ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <ConfirmTranslationModal
        isOpen={isConfirmModalVisible}
        onConfirm={handleConfirmTranslation}
        onCancel={handleCancelTranslation}
        onHelp={handleHelpModal}
      />
    </div>
  );
}
