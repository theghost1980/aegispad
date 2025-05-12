import React, { useEffect } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa"; // Iconos para la notificación
import { useSuccessNotificationStore } from "../stores/successNotificationStore";
import styles from "../styles/SuccessNotification.module.css"; // Crearemos este archivo CSS

const SuccessNotification: React.FC = () => {
  const { isVisible, message, hideSuccess } = useSuccessNotificationStore();

  useEffect(() => {
    // Limpiar el timeout si el componente se desmonta mientras está visible
    // (aunque el store ya lo maneja al llamar a showSuccess de nuevo)
    return () => {
      if (isVisible && useSuccessNotificationStore.getState()._timeoutId) {
        clearTimeout(useSuccessNotificationStore.getState()._timeoutId!);
      }
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.notificationContainer}>
      <FaCheckCircle className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button
        onClick={hideSuccess}
        className={styles.closeButton}
        aria-label="Cerrar notificación"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default SuccessNotification;
