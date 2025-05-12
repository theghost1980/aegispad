import React from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { useServerStatusStore } from "../stores/serverStatusStore";
import styles from "./ServerStatusIndicator.module.css";

const ServerStatusIndicator: React.FC = () => {
  const { status, error, isLoading, info } = useServerStatusStore();

  let statusClass: string = "";
  let IconComponent: React.ElementType | null = null;
  let title = "Estado del servidor";

  if (isLoading && (status === "unknown" || status === "checking")) {
    statusClass = styles.checking;
    IconComponent = () => <FaSpinner className={styles.iconSpin} />; // Añadimos clase para animación
    title = "Verificando estado del servidor...";
  } else {
    switch (status) {
      case "online":
        statusClass = styles.online;
        IconComponent = FaCheckCircle;
        title = `Servidor en línea. Entorno: ${info?.env || "N/A"}`;
        break;
      case "offline":
        statusClass = styles.offline;
        IconComponent = FaTimesCircle;
        title = `Servidor fuera de línea. ${error ? `Detalle: ${error}` : ""}`;
        break;
      case "error":
        statusClass = styles.error;
        IconComponent = FaExclamationTriangle;
        title = `Error de conexión con el servidor. Detalle: ${
          error || "desconocido"
        }`;
        break;
      default: // unknown
        statusClass = styles.unknown;
        IconComponent = FaQuestionCircle;
        title = "Estado del servidor desconocido.";
        break;
    }
  }

  return (
    <div className={`${styles.indicator} ${statusClass}`} title={title}>
      {IconComponent && <IconComponent />}
    </div>
  );
};

export default ServerStatusIndicator;
