import React from "react";
import {
  FaCheckCircle,
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

  return (
    <div className={styles.stepperContainer}>
      {stepsConfig.map((step, index) => {
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
    </div>
  );
};

export default EditorStepper;
