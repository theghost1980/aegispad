import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { translateText } from "../services/translationService";
import { useErrorStore } from "../stores/errorStore";
import { useSettingsStore } from "../stores/settingsStore";
import styles from "../styles/MarkdownEditorWithTranslation.module.css";
import { AppError, createAppError } from "../types/error";
import { debounce } from "../utils/debounce";
import {
  cleanMarkdownForTranslation,
  reinsertMarkdownElements,
} from "../utils/markdownCleaner";
import { MarkdownPreview } from "./MarkdownPreview";
import { MarkdownToolbar } from "./MarkdownToolbar";
// Importa el tipo Root y Node
import type { Root, Text } from "mdast"; // Importa Root y Text desde mdast
import { FaChevronLeft, FaChevronRight, FaCog } from "react-icons/fa";
import { MdTranslate } from "react-icons/md";
import { useArticleStore } from "../stores/articleStore";
import { useOperationLoadingStore } from "../stores/operationLoadingStore";
import { useSuccessNotificationStore } from "../stores/successNotificationStore";
import { OperationTimer } from "../utils/timeTracker";
import { countWords } from "../utils/wordCount";
import { ConfirmTranslationModal } from "./ConfirmTranslationModal";

export function MarkdownEditorWithTranslation() {
  const [markdownText, setMarkdownText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [debounceProgress, setDebounceProgress] = useState(0);
  const { setError, clearError } = useErrorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isTranslationPaneVisible, setIsTranslationPaneVisible] =
    useState(true);

  const { preferredSourceLanguage, preferredTargetLanguage } =
    useSettingsStore();

  const {
    showLoader,
    hideLoader,
    isLoading: isOperationLoading,
  } = useOperationLoadingStore(); // Volver a obtener isLoading

  const wordCount = useMemo(() => countWords(markdownText), [markdownText]);

  const { showSuccess } = useSuccessNotificationStore();

  const {
    setOriginalMarkdown,
    setTranslatedMarkdown,
    setCurrentEditorStep,
    originalMarkdown: storeOriginalMarkdown,
    translatedMarkdown: storeTranslatedMarkdown, // Para saber si ya hay una traducción
  } = useArticleStore();

  /**
   * ms = millisecons
   */
  const DEBOUNCE_DELAY = 500;

  // Inicializar markdownText desde el store si existe (por persistencia)
  // useEffect(() => {
  //   if (storeOriginalMarkdown && !markdownText) {
  //     // Solo si markdownText está vacío
  //     setMarkdownText(storeOriginalMarkdown);
  //   }
  // }, [storeOriginalMarkdown, markdownText]);

  const debouncedTranslate = useCallback(
    debounce(
      async (text: string) => {
        if (
          !text.trim() ||
          !preferredSourceLanguage ||
          !preferredTargetLanguage
        ) {
          setTranslatedText("");
          // Si el loader global estaba activo por esta operación, ocultarlo
          // Leemos el estado actual del loader directamente para evitar dependencias innecesarias
          // if (useOperationLoadingStore.getState().isLoading) {
          //   hideLoader();
          // }
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
            tree: originalTree, // Renombrado para claridad
            textFragments,
            tableAlignments: originalTableAlignments, // Obtener las alineaciones
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

          // reinsertMarkdownElements espera Root como primer argumento
          if (
            originalTree &&
            extractedFragments.length === translatedTexts.length
          ) {
            const finalTranslatedMarkdown = reinsertMarkdownElements(
              originalTree,
              originalTableAlignments, // Pasar las alineaciones
              translatedTexts,
              textFragments
            );
            finalTranslation = finalTranslatedMarkdown;
            setTranslatedText(finalTranslatedMarkdown);
            console.log(
              "DEBUG EDITOR: translatedText state updated with:",
              finalTranslatedMarkdown
            );
          } else {
            console.error(
              "DEBUG EDITOR: Inconsistencia entre fragmentos extraídos y traducidos.",
              {
                extractedCount: extractedFragments.length,
                translatedCount: translatedTexts.length,
                translatedTexts,
              }
            );
            setTranslatedText(
              "Error en el proceso de traducción: El servicio devolvió un número inesperado de fragmentos."
            );
          }
        } catch (err: any) {
          console.error("Error during translation process:", err);
          if (err instanceof AppError) {
            setError(err);
          } else if (err instanceof Error) {
            setError(
              createAppError(
                `Error en el proceso de traducción: ${err.message}`,
                err.stack || err.message,
                undefined,
                "general",
                true,
                true,
                err
              )
            );
          } else {
            setError(
              createAppError(
                "Ocurrió un error inesperado en el proceso de traducción.",
                JSON.stringify(err),
                undefined,
                "general",
                true,
                true,
                err
              )
            );
          }
          setTranslatedText("Error en el proceso de traducción.");
        } finally {
          const duration = translationTimer.stop();
          // Aquí usamos el nuevo método para obtener el tiempo formateado
          if (duration !== null) {
            const formattedTime = translationTimer.getFormattedDuration();
            console.log(`La operación de traducción tardó: ${formattedTime}`);
            showSuccess(`Traducción realizada en ${formattedTime}.`);

            // Guardar en el store, PERO NO cambiar de paso automáticamente
            setOriginalMarkdown(markdownText); // El markdownText actual en el editor
            // Asegurarse de que finalTranslation tenga un valor antes de usarlo
            if (finalTranslation) {
              setTranslatedMarkdown(finalTranslation);
            }
          }
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
      setError,
      clearError,
      preferredSourceLanguage,
      preferredTargetLanguage,
      showLoader,
      hideLoader,
      setOriginalMarkdown, // Añadir como dependencia
      setTranslatedMarkdown, // Añadir como dependencia
    ]
  );

  useEffect(() => {
    // if (
    //   isTranslationEnabled &&
    //   preferredSourceLanguage &&
    //   preferredTargetLanguage
    // ) {
    //   if (!markdownText.trim()) {
    //     setTranslatedText("");
    //     debouncedTranslate.cancel();
    //     setDebounceProgress(0);
    //     // No llamar a hideLoader aquí, porque no se llamó a showLoader
    //     return;
    //   }
    //   debouncedTranslate(markdownText);
    // } else {
    //   setTranslatedText("");
    //   if (useOperationLoadingStore.getState().isLoading) {
    //     hideLoader();
    //   }
    //   debouncedTranslate.cancel();
    //   setDebounceProgress(0);
    // }
    return () => {
      debouncedTranslate.cancel();
      // El hideLoader en el finally de debouncedTranslate o en la lógica de arriba
      // debería ser suficiente. Si el componente se desmonta mientras el debounce está
      // activo pero antes de que se ejecute el callback, la cancelación es lo importante.
      // Si se desmonta DURANTE la traducción (después de showLoader), el finally lo manejará.
    };
  }, [
    // markdownText,
    // isTranslationEnabled,
    // preferredSourceLanguage, // Asegurar que esté como dependencia
    // preferredTargetLanguage,
    debouncedTranslate,
  ]);

  const handleMarkdownChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMarkdownText(event.target.value);
    console.log(
      "DEBUG EDITOR: markdownText state updated to:",
      event.target.value
    );
  };

  // const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const isChecked = event.target.checked;
  //   setIsTranslationEnabled(isChecked);
  //   console.log("DEBUG EDITOR: Translation toggle changed to:", isChecked);

  //   if (!isChecked) {
  //     setTranslatedText("");
  //     if (useOperationLoadingStore.getState().isLoading) {
  //       hideLoader();
  //     }
  //     debouncedTranslate.cancel();
  //     setDebounceProgress(0);
  //   }
  // };

  // Helper para aplicar formato y manejar el cursor/selección

  const handleTranslateButtonClick = () => {
    // if (translatedText) {
    //   // Si ya hay texto traducido, el botón funciona para limpiar
    //   setTranslatedText("");
    //   // setTranslatedMarkdown(""); // Limpiar también en el store
    //   if (useOperationLoadingStore.getState().isLoading) {
    //     hideLoader();
    //   }
    //   debouncedTranslate.cancel();
    //   setDebounceProgress(0);
    //   showSuccess("Traducción limpiada.");
    // } else {
    // Si no hay texto traducido, muestra el modal de confirmación
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
    // }
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

    // Devolvemos el foco y ajustamos la selección
    // Usamos un pequeño timeout para asegurar que el estado se haya actualizado en el DOM
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

    if (url === null) return; // El usuario canceló
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
        // Si había texto seleccionado (que se usó como linkText), seleccionamos la URL
        const selectionStart = start + linkText.length + 3; // Posición después de "[linkText](" para seleccionar la URL
        const selectionEnd = selectionStart + url.length; // Posición al final de la URL
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        // Si no, seleccionamos el "texto del enlace"
        const selectionStart = start + 1; // Posición después de "[" para seleccionar "texto del enlace"
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
    if (imageUrl === null) return; // El usuario canceló
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
    if (altText === null) return; // El usuario canceló el prompt de texto alternativo

    const markdownToInsert = `![${altText}](${imageUrl})`;

    const newText =
      textarea.value.substring(0, start) +
      markdownToInsert +
      textarea.value.substring(end);

    setMarkdownText(newText);

    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        // Si el texto alternativo vino de una selección, seleccionamos la URL de la imagen
        const selectionStart = start + altText.length + 4; // Posición después de "![altText](" para seleccionar la URL
        const selectionEnd = selectionStart + imageUrl.length; // Posición al final de la URL de la imagen
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        // Si el texto alternativo fue ingresado o es placeholder, lo seleccionamos
        const selectionStart = start + 2; // Posición después de "![" para seleccionar "altText"
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
        // Bloque de código multilínea
        newText =
          textarea.value.substring(0, start) +
          "```\n" +
          selectedText +
          "\n```" +
          textarea.value.substring(end);
        newStart = start + 4; // Después de "```\n"
        newEnd = newStart + selectedText.length;
      } else {
        // Código en línea (inline code)
        newText =
          textarea.value.substring(0, start) +
          "`" +
          selectedText +
          "`" +
          textarea.value.substring(end);
        newStart = start + 1; // Después de "`"
        newEnd = newStart + selectedText.length;
      }
    } else {
      // Insertar un bloque de código multilínea de ejemplo
      const placeholder = "código aquí";
      newText =
        textarea.value.substring(0, start) +
        "```\n" +
        placeholder +
        "\n```" +
        textarea.value.substring(end);
      newStart = start + 4; // Después de "```\n"
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

    // Si el texto seleccionado es multilínea, añadir saltos de línea alrededor.
    // Si no, asumimos que es una sola línea o un placeholder.
    if (selectedText && selectedText.includes("\n")) {
      detailsContent = `\n${selectedText}\n`;
    } else if (selectedText) {
      detailsContent = `\n${selectedText}\n`; // Incluso si es una línea, darle su propio espacio.
    } else {
      detailsContent = `\n${detailsContent}\n`;
    }

    const markdownToInsert = `<details>\n<summary>${summaryPlaceholder}</summary>${detailsContent}</details>`;

    const newText =
      textarea.value.substring(0, start) +
      markdownToInsert +
      textarea.value.substring(end);

    setMarkdownText(newText);

    // Seleccionar el placeholder del summary para fácil edición
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
    // Antes de continuar, asegurarse de que el original actual esté en el store
    // Esto es por si el usuario editó el original DESPUÉS de la última traducción.
    if (markdownText !== storeOriginalMarkdown) {
      setOriginalMarkdown(markdownText);
    }
    // El translatedMarkdown ya debería estar en el store por la última traducción exitosa.
    // Si no hay translatedMarkdown, el botón no debería estar visible/habilitado.
    setCurrentEditorStep("SELECTING_FORMAT");
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
    // window.open("/ayuda#traduccion", "_blank"); // Placeholder URL
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
            <MdTranslate style={{ marginRight: "8px" }} />
          </button>
        </div>
        {/* El DebounceProgress se mostrará si debouncedTranslate está activo (esperando el delay) */}
        {/* o si la traducción está en curso (isOperationLoading es true) y aún no hay translatedText */}
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
        {/* Botón para continuar al siguiente paso, visible si hay una traducción */}
        {storeTranslatedMarkdown && (
          <div className={styles.continueButtonContainer}>
            <button
              onClick={handleContinueToFormatSelection}
              className={styles.continueButton}
              disabled={!storeTranslatedMarkdown.trim()} // Deshabilitar si la traducción está vacía
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
            {/* Mensaje si se intenta traducir sin idiomas configurados (ya manejado en el modal/botón) */}
            {/* O si el loader está activo */}
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

      {/* Botón flotante para mostrar/ocultar panel de traducción/previsualización */}
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
