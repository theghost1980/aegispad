import { useEffect } from "react";
import { useErrorStore } from "../stores/errorStore";
import styles from "../styles/ErrorNotification.module.css";

export function ErrorNotification() {
  const { error, clearError } = useErrorStore();

  useEffect(() => {
    if (error && error.shouldDisplay) {
      const timer = setTimeout(() => {
        clearError();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }

    return undefined;
  }, [error, clearError]);

  if (!error || !error.shouldDisplay) {
    return null;
  }

  return (
    <div className={styles.notificationContainer}>
      <span>{error.message}</span>
      <button onClick={clearError} className={styles.closeButton}>
        &times;
      </button>
    </div>
  );
}
