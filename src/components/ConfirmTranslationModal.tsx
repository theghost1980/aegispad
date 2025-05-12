import React from "react";
import { FaCheck, FaQuestionCircle, FaTimes } from "react-icons/fa";
import styles from "../styles/ConfirmTranslationModal.module.css";

interface ConfirmTranslationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onHelp: () => void;
}

export const ConfirmTranslationModal: React.FC<
  ConfirmTranslationModalProps
> = ({ isOpen, onConfirm, onCancel, onHelp }) => {
  if (!isOpen) {
    return null;
  }

  // Prevenir el scroll del fondo cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        <p className={styles.modalText}>
          Recuerde que se manejan cuotas de traducción por artículo completo,
          ¿Procedo a traducir?
        </p>
        <div className={styles.modalActions}>
          <button
            onClick={onHelp}
            className={`${styles.modalButton} ${styles.helpButton}`}
            title="Ayuda y FAQ (próximamente)"
          >
            <FaQuestionCircle aria-hidden="true" /> Ayuda
          </button>
          <div className={styles.confirmCancelGroup}>
            <button
              onClick={onCancel}
              className={`${styles.modalButton} ${styles.cancelButton}`}
            >
              <FaTimes aria-hidden="true" /> Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`${styles.modalButton} ${styles.confirmButton}`}
            >
              <FaCheck aria-hidden="true" /> Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
