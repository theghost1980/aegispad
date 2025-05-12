// src/components/Dropdown.tsx

import { useEffect, useRef, useState } from "react";
import styles from "../styles/Dropdown.module.css";

// Define las props para el componente Dropdown
interface DropdownProps<T> {
  items: T[]; // Array de datos
  onSelect: (item: T) => void; // Callback al seleccionar un item
  labelKey: keyof T; // Clave para mostrar el texto del item
  valueKey?: keyof T; // Clave para el valor interno del item (opcional)
  placeholder?: string; // Texto a mostrar cuando no hay item seleccionado
  initialSelectedItem?: T | null; // Acepta T, null, o undefined
}

// Componente Dropdown genérico
export function Dropdown<T>({
  items,
  onSelect,
  labelKey,
  valueKey,
  placeholder = "Seleccionar...",
  initialSelectedItem,
}: DropdownProps<T>) {
  // El estado interno ahora se inicializa y se sincroniza fuertemente con initialSelectedItem
  const [selectedItem, setSelectedItem] = useState<T | null>(
    initialSelectedItem ?? null
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Referencia para detectar clics fuera

  // Efecto para sincronizar el estado interno con la prop initialSelectedItem
  // Se ejecuta cada vez que initialSelectedItem o items cambian.
  useEffect(() => {
    const itemToSync = initialSelectedItem ?? null;

    // Función auxiliar para encontrar un ítem en la lista 'items'
    const findInItems = (item: T | null) => {
      if (item === null || item === undefined) return null;
      return (
        items.find(
          (i) =>
            // Compara usando valueKey si existe, de lo contrario compara los objetos directamente
            i !== null &&
            i !== undefined &&
            (valueKey ? i[valueKey] === item[valueKey] : i === item)
        ) || null
      );
    };

    // Verificar si el item que queremos sincronizar (initialSelectedItem) existe en la lista actual de items
    const validItemToSync = findInItems(itemToSync);

    // Si el item a sincronizar es válido en la nueva lista, actualiza el estado interno.
    // Si no es válido (o initialSelectedItem es null/undefined), limpia la selección interna.
    if (validItemToSync !== null) {
      // Solo actualiza si el ítem válido es diferente al actualmente seleccionado
      // para evitar bucles innecesarios si la prop no ha cambiado efectivamente
      // Añadimos verificaciones explícitas para selectedItem antes de acceder a valueKey
      if (
        selectedItem === null ||
        (valueKey &&
          selectedItem &&
          selectedItem[valueKey] !== validItemToSync[valueKey]) ||
        (!valueKey && selectedItem !== validItemToSync)
      ) {
        setSelectedItem(validItemToSync);
      }
    } else {
      // Si el item a sincronizar no es válido, limpia la selección interna si hay algo seleccionado
      if (selectedItem !== null) {
        setSelectedItem(null);
      }
    }

    // Si el dropdown estaba abierto y el item seleccionado ya no es válido en la NUEVA lista, ciérralo.
    // Añadimos verificaciones explícitas para selectedItem antes de llamar a findInItems
    if (isOpen && selectedItem !== null && findInItems(selectedItem) === null) {
      setIsOpen(false);
    }
  }, [initialSelectedItem, items, valueKey, selectedItem, isOpen]); // Dependencias: re-ejecutar si initialSelectedItem, items o valueKey cambian. selectedItem y isOpen ayudan a la lógica de cierre/evitar loops.

  // Efecto para cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: T) => {
    // Actualizar estado interno inmediatamente al hacer clic el usuario
    setSelectedItem(item);
    onSelect(item); // Llama al callback del padre
    setIsOpen(false); // Cierra el dropdown
  };

  // Determina el texto a mostrar en el botón
  const buttonLabel = selectedItem
    ? String(selectedItem[labelKey])
    : placeholder;

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <button className={styles.dropdownButton} onClick={handleButtonClick}>
        <span>{buttonLabel}</span>
        {/* Icono de flecha simple */}
        <span className={`${styles.arrow} ${isOpen ? styles.up : ""}`}>▼</span>
      </button>

      {/* El conteo de items es manejado por el componente padre */}
      {/*
      <span className={styles.itemCount}>
          {items.length} item{items.length !== 1 ? 's' : ''} en lista
      </span>
      */}

      {isOpen && (
        <ul className={styles.dropdownList}>
          {items.map((item: T, index) => (
            <li
              key={valueKey ? String(item[valueKey]) : index} // Usa valueKey o index para la key
              className={styles.dropdownItem}
              onClick={() => handleItemClick(item)}
            >
              {String(item[labelKey])} {/* Muestra el texto del item */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
