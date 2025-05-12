import {
  FaBold,
  FaCaretSquareDown,
  FaCode,
  FaImage,
  FaItalic, // Icono para <details>
  FaLink,
  FaQuestionCircle,
} from "react-icons/fa";
import styles from "../styles/MarkdownToolbar.module.css";

interface MarkdownToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onInsertImage?: () => void;
  onInsertLink?: () => void;
  onInsertCodeBlock?: () => void;
  onInsertDetailsBlock?: () => void; // Nueva prop
}

export function MarkdownToolbar({
  onBold,
  onItalic,
  onInsertImage,
  onInsertLink,
  onInsertCodeBlock,
  onInsertDetailsBlock, // Nueva prop
}: MarkdownToolbarProps) {
  return (
    <div className={styles.toolbarContainer}>
      <button
        className={styles.toolbarButton}
        onClick={onBold}
        title="Negritas (Bold)"
      >
        <FaBold />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={onItalic}
        title="Cursiva (Italic)"
      >
        <FaItalic />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={onInsertImage}
        title="Insertar Imagen"
      >
        <FaImage />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={onInsertLink}
        title="Insertar Enlace"
      >
        <FaLink />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={onInsertCodeBlock}
        title="Insertar Bloque de Código"
      >
        <FaCode />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={onInsertDetailsBlock} // Llamar a la nueva función
        title="Insertar Sección Colapsable (Details)"
      >
        <FaCaretSquareDown />
      </button>

      <button
        className={styles.toolbarButton}
        onClick={() => window.open("https://commonmark.org/help/", "_blank")}
        title="Ayuda Markdown (CommonMark)"
      >
        <FaQuestionCircle />
      </button>
    </div>
  );
}
