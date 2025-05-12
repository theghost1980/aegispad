import React, { useEffect, useState, type KeyboardEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { AEGISPAD_TAG } from "../constants/general";
import { useErrorStore } from "../stores/errorStore"; // Importar el store de errores
import styles from "../styles/TagInput.module.css"; // Crearemos este archivo CSS
import { AppError } from "../types/error"; // Importar el creador de errores

interface TagInputProps {
  onTagsChange?: (tags: string[]) => void; // Callback para notificar cambios en las etiquetas
}

const TagInput: React.FC<TagInputProps> = ({ onTagsChange }) => {
  const [tags, setTags] = useState<string[]>([AEGISPAD_TAG]);
  const [inputValue, setInputValue] = useState<string>("");
  const { setError, clearError } = useErrorStore(); // Obtener funciones del store

  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(tags);
    }
  }, [tags, onTagsChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    clearError(); // Limpiar errores específicos de tags al escribir
  };

  const addTag = (tagValue: string) => {
    const newTag = tagValue.trim().toLowerCase(); // Convertir a minúsculas para HIVE
    if (!newTag) return; // No añadir etiquetas vacías

    if (tags.length >= 10) {
      const customErrorObject: AppError = {
        name: "UserTagsError",
        message: "Límite de etiquetas alcanzado.",
        details: "Solo se permiten un máximo de 10 etiquetas.",
        shouldDisplay: true,
        shouldLog: false,
        // originalError: undefined, // si no aplica
        // timestamp: new Date(), // si lo usas
      };
      setError(customErrorObject);
      setInputValue("");
      return;
    }

    if (!isValidHiveTag(newTag)) {
      const customErrorObject: AppError = {
        name: "UserTagsError",
        message: "Etiqueta no válida.",
        details: `"${newTag}" no es una etiqueta válida de HIVE. Reglas: 3-32 caracteres, solo minúsculas, números, guiones (no al inicio/final, no consecutivos).`,
        shouldDisplay: true,
        shouldLog: false,
        // originalError: undefined, // si no aplica
        // timestamp: new Date(), // si lo usas
      };
      setError(customErrorObject);
      setInputValue(""); // Limpiar input
      return;
    }

    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      clearError(); // Limpiar errores si la etiqueta se añade correctamente
    }
    setInputValue(""); // Limpiar input después de añadir
  };

  const isValidHiveTag = (tag: string): boolean => {
    // Reglas de HIVE:
    // - Solo letras minúsculas (a-z), números (0-9) y guiones (-)
    // - Mínimo 3 caracteres, máximo 32
    // - No puede empezar ni terminar con guion
    // - No puede contener guiones consecutivos
    if (tag.length < 3 || tag.length > 32) {
      return false;
    }
    // Regex que verifica caracteres permitidos y que no haya guiones al inicio, final o consecutivos
    const hiveTagRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return hiveTagRegex.test(tag);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault(); // Evitar comportamiento por defecto (ej. submit de form, escribir coma/espacio)
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Opcional: eliminar la última etiqueta con backspace si el input está vacío
      removeTag(tags[tags.length - 1]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (tagToRemove === AEGISPAD_TAG) return;
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={styles.tagInputContainer}>
      {tags.map((tag, index) => (
        <div key={index} className={styles.tagItem}>
          {tag}
          <button
            type="button"
            className={styles.removeTagButton}
            onClick={() => removeTag(tag)}
            aria-label={`Eliminar etiqueta ${tag}`}
          >
            <FaTimes />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "Añade etiquetas..." : ""}
        className={styles.inputField}
      />
    </div>
  );
};

export default TagInput;
