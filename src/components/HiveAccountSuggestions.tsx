import React, { useEffect, useState } from "react";
import { searchHiveAccounts } from "../services/hiveService";
import styles from "../styles/HiveAccountSuggestions.module.css";

interface HiveAccountSuggestionsProps {
  text: string;
  anchorRef: React.RefObject<HTMLElement> | null;
  onSelect?: (account: string) => void;
}

export const HiveAccountSuggestions: React.FC<HiveAccountSuggestionsProps> = ({
  text,
  anchorRef,
  onSelect,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    if (text.length >= 3 && /^[a-z][a-z0-9\-\.]{2,15}$/.test(text)) {
      // Realizar la búsqueda en la blockchain de Hive
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
      setIsVisible(false);
    }
  }, [text]);

  const fetchSuggestions = async (query: string) => {
    // Aquí deberías implementar la lógica para buscar cuentas en Hive
    // Por ejemplo, utilizando una API o librería específica
    // A continuación, se muestra un ejemplo genérico
    const results = await searchHiveAccounts(query);
    setSuggestions(results.slice(0, 5));
    setIsVisible(true);
  };

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [anchorRef, suggestions]);

  const handleSelect = (account: string) => {
    if (onSelect) {
      onSelect(account);
    }
    setIsVisible(false);
  };

  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div
      className={styles.suggestionContainer}
      style={{ top: position.top, left: position.left }}
    >
      <ul className={styles.suggestionList}>
        {suggestions.map((account) => (
          <li
            key={account}
            className={styles.suggestionItem}
            onClick={() => handleSelect(account)}
          >
            {account}
          </li>
        ))}
      </ul>
      <div className={styles.suggestionFooter}>encontrado en HIVE</div>
    </div>
  );
};
