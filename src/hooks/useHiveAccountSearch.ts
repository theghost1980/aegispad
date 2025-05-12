import { useEffect, useState } from "react";
import { searchHiveAccounts } from "../services/hiveService";

export const useHiveAccountSearch = (prefix: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (/^[a-z][a-z0-9\-\.]{2,15}$/.test(prefix) && prefix.length >= 3) {
        try {
          const results = await searchHiveAccounts(prefix);
          setSuggestions(results);
        } catch (error) {
          console.error("Error fetching Hive accounts:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [prefix]);

  return suggestions;
};
