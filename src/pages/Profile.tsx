import { useEffect, useState } from "react";
import { Dropdown } from "../components/Dropdown";
import type { TranslationLanguage } from "../interfaces/translationService.interface";
import { getLanguages } from "../services/translationService";
import { useErrorStore } from "../stores/errorStore";
import { useServerStatusStore } from "../stores/serverStatusStore"; // Importa el nuevo store del servidor
import { useSettingsStore } from "../stores/settingsStore"; // Importa el nuevo store
import { useSuccessNotificationStore } from "../stores/successNotificationStore";
import styles from "../styles/ProfilePage.module.css";
import { AppError, createAppError } from "../types/error";

function ProfilePage() {
  const { setError, clearError } = useErrorStore();
  // Usa el store para el estado del servidor
  const {
    status: serverStatus,
    info: serverInfo,
    error: serverError,
    isLoading: isServerStatusLoading,
    checkServerStatus,
    _setStatusLoading, // Si necesitas disparar el estado de carga manualmente antes de una acción
  } = useServerStatusStore();

  const { showSuccess } = useSuccessNotificationStore();

  const {
    preferredSourceLanguage,
    preferredTargetLanguage,
    setPreferredLanguages,
  } = useSettingsStore();

  const [sourceLanguageList, setSourceLanguageList] = useState<
    TranslationLanguage[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa selectedSourceLang con el valor del store si existe, de lo contrario null
  const [selectedSourceLang, setSelectedSourceLang] =
    useState<TranslationLanguage | null>(preferredSourceLanguage);

  const [targetLanguageList, setTargetLanguageList] = useState<
    TranslationLanguage[]
  >([]);
  // Inicializa selectedTargetLang con el valor del store si existe, de lo contrario null
  const [selectedTargetLang, setSelectedTargetLang] =
    useState<TranslationLanguage | null>(preferredTargetLanguage);

  useEffect(() => {
    const fetchServerStatus = async () => {
      // Llama a la acción del store para verificar el estado del servidor
      // El 'true' fuerza una comprobación si es la primera vez o si quieres asegurar la frescura.
      checkServerStatus(true);
    };
    fetchServerStatus();
  }, [checkServerStatus]); // checkServerStatus es estable, pero es buena práctica incluirlo.

  useEffect(() => {
    const fetchLanguages = async () => {
      clearError();
      setIsLoading(true);
      try {
        const languages = await getLanguages();
        setSourceLanguageList(languages);
        console.log({ languages }); // Mantener log por ahora para verificar la carga inicial

        // Si no hay un idioma de origen preferido en el store, preseleccionar 'es' o el primero
        if (!preferredSourceLanguage) {
          const defaultSourceLang =
            languages.find((lang) => lang.code === "es") ||
            languages[0] ||
            null;
          // Solo establece si la lista de idiomas no estaba vacía y se encontró un idioma
          if (defaultSourceLang) {
            setSelectedSourceLang(defaultSourceLang);
          }
        }
        // Si hay un idioma de origen preferido en el store, selectedSourceLang ya se inicializó con él.
        // No hacemos nada aquí para evitar sobrescribir la inicialización desde el store.
      } catch (err: any) {
        console.error("Error al cargar idiomas en ProfilePage:", err);
        if (err instanceof AppError) {
          setError(err);
        } else if (err instanceof Error) {
          setError(
            createAppError(
              `Error al cargar idiomas: ${err.message}`,
              err.stack || err.message,
              undefined,
              "network",
              true,
              true,
              err
            )
          );
        } else {
          setError(
            createAppError(
              "Ocurrió un error inesperado al cargar idiomas.",
              JSON.stringify(err),
              undefined,
              "general",
              true,
              true,
              err
            )
          );
        }
        setSourceLanguageList([]);
        setSelectedSourceLang(null);
        setTargetLanguageList([]);
        setSelectedTargetLang(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, [setError, clearError, preferredSourceLanguage]); // Añade preferredSourceLanguage a las dependencias para re-evaluar si ya hay un valor guardado

  // Efecto para actualizar targetLanguageList (lista de objetos) y selectedTargetLang (objeto)
  // cuando cambia selectedSourceLang o sourceLanguageList
  useEffect(() => {
    // Este efecto solo se ejecuta si hay un idioma de origen seleccionado Y la lista completa de idiomas está cargada
    if (selectedSourceLang && sourceLanguageList.length > 0) {
      const targetCodes = selectedSourceLang.targets;
      // Asegurarse de que targetCodes es un array de strings
      const validTargetCodes: string[] = Array.isArray(targetCodes)
        ? targetCodes.filter((code: any) => typeof code === "string")
        : [];

      // Mapear los códigos destino a los objetos de idioma completos usando sourceLanguageList
      const targets = validTargetCodes
        .map((code) => sourceLanguageList.find((lang) => lang.code === code)) // Buscar el objeto completo por código
        // Filtrar cualquier undefined si un código no se encuentra y asegurar que el resultado es TranslationLanguage[]
        .filter((lang): lang is TranslationLanguage => lang !== undefined);

      console.log(
        `Idiomas destino posibles para ${selectedSourceLang.name} (${selectedSourceLang.code}):`,
        targets
      ); // Log para depuración

      setTargetLanguageList(targets); // Actualiza la lista de ítems (objetos) para el segundo dropdown

      // Lógica de selección del idioma destino:
      // 1. Intentar usar el idioma destino preferido del store si existe Y es válido en la nueva lista de targets.
      // 2. Si no, establecer un valor por defecto ('en' o el primero) basado en la NUEVA lista de destinos.

      // Corregido el typo: preferredTargetLanguage en lugar de preferredTargetLang
      const preferredTargetLangStillValid =
        preferredTargetLanguage &&
        targets.find((lang) => lang.code === preferredTargetLanguage.code);

      if (preferredTargetLangStillValid) {
        // Si hay un idioma destino preferido válido en la nueva lista, úsalo.
        console.log(
          "Estableciendo idioma destino preferido del store:",
          preferredTargetLanguage
        ); // Log para depuración
        setSelectedTargetLang(preferredTargetLanguage);
      } else {
        // Si no hay un idioma destino preferido válido, usa el valor por defecto.
        const defaultTargetLang =
          targets.find((lang) => lang.code === "en") || targets[0] || null;
        console.log(
          "Estableciendo idioma destino por defecto/nuevo (preferido no válido):",
          defaultTargetLang
        ); // Log para depuración
        setSelectedTargetLang(defaultTargetLang);
      }
    } else {
      // Si no hay idioma de origen seleccionado o la lista de origen está vacía, limpiar la lista de destinos
      console.log(
        "No hay idioma de origen seleccionado o lista de origen vacía. Limpiando destinos."
      ); // Log para depuración
      setTargetLanguageList([]);
      setSelectedTargetLang(null);
    }
    // Dependencias: re-ejecutar cuando cambie el idioma de origen seleccionado o la lista completa de idiomas (necesaria para el mapeo)
  }, [selectedSourceLang, sourceLanguageList, preferredTargetLanguage]); // Añade preferredTargetLanguage aquí

  // Manejador para cuando se selecciona un idioma en el dropdown "Traducir del" (recibe TranslationLanguage)
  const handleSourceLangSelect = (language: TranslationLanguage) => {
    console.log("Idioma de origen seleccionado:", language); // Log para depuración
    setSelectedSourceLang(language);
    // El useEffect anterior se encargará de actualizar targetLanguageList y selectedTargetLang
  };

  // Manejador para cuando se selecciona un idioma en el dropdown "Al" (recibe TranslationLanguage)
  const handleTargetLangSelect = (language: TranslationLanguage) => {
    console.log("Idioma de destino seleccionado:", language); // Log para depuración
    setSelectedTargetLang(language); // selectedTargetLang ahora es un objeto
  };

  // Manejador para guardar la configuración
  const handleSaveSettings = () => {
    // Usar la acción del store para guardar los idiomas seleccionados
    setPreferredLanguages(selectedSourceLang, selectedTargetLang);
    console.log("Configuración de idiomas guardada:", {
      source: selectedSourceLang,
      target: selectedTargetLang,
    });
    showSuccess("Preferencias guardadas exitosamente!");
  };

  return (
    <div className={styles.profileContainer}>
      <h2>Perfil de Usuario</h2>
      <p>Aquí se mostrarán y editarán los datos del usuario.</p>

      <h3>Configuración de Traducción</h3>
      {isLoading ? (
        <p>Cargando idiomas...</p>
      ) : sourceLanguageList.length > 0 ? (
        <div className={styles.translationSettings}>
          <div className={styles.dropdownGroup}>
            <label htmlFor="source-lang-dropdown">Traducir del:</label>
            <Dropdown<TranslationLanguage>
              items={sourceLanguageList} // Lista completa de idiomas (objetos)
              onSelect={handleSourceLangSelect}
              labelKey="name" // Muestra el nombre completo
              valueKey="code"
              placeholder="Seleccionar origen"
              initialSelectedItem={selectedSourceLang}
            />
            {/* Conteo de items para el dropdown de origen */}
            <span className={styles.itemCount}>
              {sourceLanguageList.length} idioma
              {sourceLanguageList.length !== 1 ? "s" : ""} origen disponibles.
            </span>
          </div>

          <div className={styles.dropdownGroup}>
            <label htmlFor="target-lang-dropdown">Al:</label>
            <Dropdown<TranslationLanguage>
              items={targetLanguageList} // Lista de idiomas destino posibles (objetos)
              onSelect={handleTargetLangSelect}
              labelKey="name" // Muestra el nombre completo
              valueKey="code"
              placeholder="Seleccionar destino"
              initialSelectedItem={selectedTargetLang} // Pasa el objeto seleccionado
            />
            {/* Conteo de items para el dropdown de destino */}
            <span className={styles.itemCount}>
              {targetLanguageList.length} idioma
              {targetLanguageList.length !== 1 ? "s" : ""} destino disponibles.
            </span>
          </div>
        </div>
      ) : (
        <p>
          No se pudieron cargar los idiomas disponibles para configurar la
          traducción.
        </p>
      )}

      {/* Botón para guardar la configuración */}
      {!isLoading && sourceLanguageList.length > 0 && (
        <button
          className={styles.saveButton} // Necesitarás definir este estilo en ProfilePage.module.css
          onClick={handleSaveSettings}
          // Deshabilitar si no hay idiomas seleccionados (opcional)
          disabled={
            !selectedSourceLang ||
            !selectedTargetLang ||
            serverStatus !== "online"
          }
        >
          Guardar Configuración
        </button>
      )}

      <div className={styles.serverStatusSection}>
        <h4>Estado del Servidor</h4>
        {(serverStatus === "checking" ||
          isServerStatusLoading ||
          serverStatus === "unknown") && (
          <p className={styles.statusLoading}>
            Verificando estado del servidor...
          </p>
        )}
        {serverStatus === "online" && serverInfo && (
          <div className={styles.statusOnline}>
            <p>
              <strong>Conexión:</strong> En línea ✅
            </p>
            <p>
              <small>
                <strong>Entorno:</strong> {serverInfo.env} |{" "}
                <strong>Node:</strong> {serverInfo.nodeVersion} |{" "}
                <strong>DB:</strong> {serverInfo.db}
              </small>
            </p>
            <p>
              <small>
                <strong>Uptime:</strong> {(serverInfo.uptime / 3600).toFixed(2)}{" "}
                horas
              </small>
            </p>
          </div>
        )}
        {(serverStatus === "offline" || serverStatus === "error") && (
          <div className={styles.statusOffline}>
            <p>
              <strong>Conexión:</strong> Fuera de línea / Error ❌
            </p>
            {serverError && (
              <p>
                <small>
                  <strong>Detalle:</strong> {serverError}
                </small>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
