// src/components/DropdownString.tsx

import { useEffect, useRef, useState } from "react";
import styles from "../styles/DropdownString.module.css"; // Usa el nuevo CSS Module

// Define las props para el componente DropdownString
interface DropdownStringProps {
  items: string[]; // Array de strings
  onSelect: (item: string) => void; // Callback al seleccionar un item (string)
  placeholder?: string; // Texto a mostrar cuando no hay item seleccionado
  initialSelectedItem?: string | null; // Item seleccionado inicialmente (string, null, o undefined)
}

// Componente Dropdown para listas de strings
export function DropdownString({
  items,
  onSelect,
  placeholder = "Seleccionar...",
  initialSelectedItem,
}: DropdownStringProps) {
  // El estado interno ahora maneja strings o null
  const [selectedItem, setSelectedItem] = useState<string | null>(
    initialSelectedItem ?? null
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Referencia para detectar clics fuera

  // Efecto para sincronizar el estado interno con la prop initialSelectedItem
  // Se ejecuta cada vez que initialSelectedItem o items cambian.
  useEffect(() => {
    const itemToSync = initialSelectedItem ?? null;

    // Verificar si el item que queremos sincronizar existe en la nueva lista de items (strings)
    const findInItems = (item: string | null) => {
      if (item === null || item === undefined) return null;
      // Para strings, simplemente verificamos si el string está incluido en el array de items
      return items.includes(item) ? item : null;
    };

    const validItemToSync = findInItems(itemToSync);

    // Si el item a sincronizar es válido en la nueva lista, actualiza el estado interno.
    // Si no es válido (o initialSelectedItem es null/undefined), limpia la selección interna.
    if (validItemToSync !== null) {
      // Solo actualiza si el ítem válido es diferente al actualmente seleccionado
      if (selectedItem !== validItemToSync) {
        setSelectedItem(validItemToSync);
      }
    } else {
      // Si el item a sincronizar no es válido, limpia la selección interna si hay algo seleccionado
      if (selectedItem !== null) {
        setSelectedItem(null);
      }
    }

    // Si el dropdown estaba abierto y el item seleccionado ya no es válido en la NUEVA lista, ciérralo.
    if (isOpen && selectedItem !== null && findInItems(selectedItem) === null) {
      setIsOpen(false);
    }
  }, [initialSelectedItem, items, selectedItem, isOpen]); // Dependencias

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

  const handleItemClick = (item: string) => {
    // Actualizar estado interno inmediatamente al hacer clic el usuario
    setSelectedItem(item);
    onSelect(item); // Llama al callback del padre con el string seleccionado
    setIsOpen(false); // Cierra el dropdown
  };

  // Determina el texto a mostrar en el botón
  const buttonLabel = selectedItem ?? placeholder; // Usa nullish coalescing para el placeholder

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
          {items.map(
            (
              item: string,
              index // Mapea sobre strings
            ) => (
              <li
                key={item} // Usa el string como key
                className={styles.dropdownItem}
                onClick={() => handleItemClick(item)}
              >
                {item} {/* Muestra el string directamente */}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
