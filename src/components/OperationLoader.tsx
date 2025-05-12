import React from "react";
import { useOperationLoadingStore } from "../stores/operationLoadingStore";
import styles from "./OperationLoader.module.css"; // Crearemos este archivo CSS

const OperationLoader: React.FC = () => {
  const { isLoading, message } = useOperationLoadingStore();

  if (!isLoading) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.loaderContainer}>
        <img
          src="/src/assets/logos/aegispad256.png" // Asegúrate que esta ruta es correcta y accesible
          alt="Cargando..."
          className={styles.logoSpin}
        />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default OperationLoader;
