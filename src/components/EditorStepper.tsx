import React, { useState } from "react"; // Añadir useState
import {
  FaCheckCircle,
  FaCompressAlt, // Icono para colapsar
  FaExpandAlt, // Icono para expandir
  FaObjectUngroup,
  FaPaperPlane,
  FaPenFancy,
} from "react-icons/fa"; // Iconos para los pasos
import { useArticleStore, type EditorStep } from "../stores/articleStore";
import styles from "./EditorStepper.module.css";

interface StepConfig {
  id: EditorStep;
  label: string;
  icon: React.ElementType;
}

const stepsConfig: StepConfig[] = [
  { id: "WRITING_TRANSLATING", label: "Escribir y Traducir", icon: FaPenFancy },
  {
    id: "SELECTING_FORMAT",
    label: "Seleccionar Formato",
    icon: FaObjectUngroup,
  },
  {
    id: "REVIEWING_PUBLISHING",
    label: "Revisar y Publicar",
    icon: FaPaperPlane,
  },
];

const EditorStepper: React.FC = () => {
  const currentStep = useArticleStore((state) => state.currentEditorStep);
  const [isExpanded, setIsExpanded] = useState(false); // Inicia colapsado

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const getStepStatus = (
    stepId: EditorStep,
    currentProcessingStep: EditorStep
  ): "completed" | "current" | "upcoming" => {
    const currentIndex = stepsConfig.findIndex(
      (step) => step.id === currentProcessingStep
    );
    const stepIndex = stepsConfig.findIndex((step) => step.id === stepId);

    if (stepIndex < currentIndex) {
      return "completed";
    }
    if (stepIndex === currentIndex) {
      return "current";
    }
    return "upcoming";
  };

  // Encuentra la configuración del paso actual para mostrarla cuando está colapsado
  const currentStepData = stepsConfig.find((step) => step.id === currentStep);

  return (
    <div
      className={`${styles.stepperContainer} ${
        isExpanded ? styles.expanded : styles.collapsed
      }`}
    >
      {!isExpanded && currentStepData && (
        // Renderizar solo el paso actual cuando está colapsado
        <div className={`${styles.step} ${styles.currentCollapsedView}`}>
          <div className={styles.iconWrapper}>
            <currentStepData.icon className={styles.icon} />
          </div>
          <div className={styles.label}>{currentStepData.label}</div>
        </div>
      )}

      {isExpanded &&
        stepsConfig.map((step, index) => {
          const status = getStepStatus(step.id, currentStep);
          let stepClass = styles.step;
          if (status === "completed") {
            stepClass += ` ${styles.completed}`;
          } else if (status === "current") {
            stepClass += ` ${styles.current}`;
          } else {
            stepClass += ` ${styles.upcoming}`;
          }

          return (
            <React.Fragment key={step.id}>
              <div className={stepClass}>
                <div className={styles.iconWrapper}>
                  {status === "completed" ? (
                    <FaCheckCircle className={styles.icon} />
                  ) : (
                    <step.icon className={styles.icon} />
                  )}
                </div>
                <div className={styles.label}>{step.label}</div>
              </div>
              {index < stepsConfig.length - 1 && (
                <div className={styles.connector}></div>
              )}
            </React.Fragment>
          );
        })}

      <button
        onClick={toggleExpansion}
        className={styles.toggleButton}
        title={isExpanded ? "Colapsar progreso" : "Expandir progreso"}
        aria-expanded={isExpanded}
      >
        {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
      </button>
    </div>
  );
};

export default EditorStepper;
