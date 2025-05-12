// src/components/MarkdownPreview.tsx

import { useEffect, useState } from "react";
// Importa la función marked para convertir Markdown a HTML
// Importa el tipo Link desde marked.Tokens
import DOMPurify from "dompurify"; // Librería para sanitizar HTML (importante por seguridad)
import { marked, type Tokens } from "marked"; // Importamos Tokens para acceder a Tokens.Link
import styles from "../styles/MarkdownPreview.module.css"; // Archivo CSS para estilos

// Configura marked para renderizar enlaces con target="_blank"
// Esto crea un nuevo renderer que extiende el por defecto
const renderer = new marked.Renderer();

// Helper function para escapar valores de atributos HTML (simplificado para atributos entre comillas dobles)
const escapeAttribute = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
};

// Define la nueva función renderer.link con la firma actualizada usando el tipo Link de marked.Tokens
// Recibe un objeto de tipo Tokens.Link
renderer.link = (linkObject: Tokens.Link) => {
  const href = linkObject.href;
  const title = linkObject.title;
  const text = linkObject.text; // El contenido interno del enlace, ya procesado por marked

  let out = `<a href="${escapeAttribute(href)}"`;
  if (title) {
    out += ` title="${escapeAttribute(title)}"`;
  }
  // Añadimos un atributo extra para confirmar que nuestro renderer se usa
  out += ` target="_blank" rel="noopener noreferrer" data-custom-renderer="true">${text}</a>`;
  return out;
};

// Configura marked para usar el renderer modificado
marked.setOptions({ renderer });

// Si marked puede retornar una Promesa, probablemente necesites habilitar opciones asíncronas.
// marked.use({ async: true }); // Ejemplo si usas marked 4.x o superior y necesitas async

interface MarkdownPreviewProps {
  markdown: string; // La cadena de texto Markdown a renderizar
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  // Estado para almacenar el HTML renderizado
  const [renderedHtml, setRenderedHtml] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Opcional: para mostrar un estado de carga

  // Efecto para convertir el Markdown a HTML asíncronamente
  useEffect(() => {
    setIsLoading(true); // Iniciar carga

    const renderMarkdown = async () => {
      try {
        // Llama a marked. Puede devolver string o Promise<string>
        // Aseguramos que marked esté configurado con el renderer personalizado y opciones globales.
        const htmlResult = marked(markdown); // Llama a marked con el texto Markdown
        let finalHtml: string;

        // Si el resultado es una Promesa, esperamos a que se resuelva
        if (htmlResult instanceof Promise) {
          finalHtml = await htmlResult;
        } else {
          finalHtml = htmlResult;
        }

        // Usa DOMPurify para limpiar el HTML generado antes de renderizarlo
        const sanitizedHtml = DOMPurify.sanitize(finalHtml, {
          ADD_ATTR: ["target"], // Permite el atributo 'target' en todos los elementos (o específicamente en 'a' si se quisiera)
        });

        // Actualiza el estado con el HTML sanitizado
        setRenderedHtml(sanitizedHtml);
      } catch (error) {
        console.error("Error rendering markdown:", error);
        // Manejar el error de renderizado, quizás mostrar un mensaje en la UI
        setRenderedHtml(
          `<p class="${styles.previewError}">Error al renderizar Markdown.</p>`
        );
      } finally {
        setIsLoading(false); // Finalizar carga
      }
    };

    renderMarkdown(); // Ejecuta la función asíncrona

    // Cleanup function si es necesario (ej: cancelar una promesa si el componente se desmonta)
    // marked no proporciona un método cancel por defecto, pero si usas fetch o similar dentro de renderers,
    // podrías necesitar un AbortController.
    return () => {
      // Limpieza si es necesaria
    };
  }, [markdown]); // Dependencia: re-ejecutar este efecto cuando la prop 'markdown' cambie

  // Renderiza el HTML usando dangerouslySetInnerHTML desde el estado
  // Muestra un indicador de carga si está cargando (opcional)
  return (
    <div className={styles.previewContainer}>
      {isLoading && markdown.length > 0 ? (
        <p>Cargando previsualización...</p> // Mensaje de carga
      ) : (
        <div dangerouslySetInnerHTML={{ __html: renderedHtml }} /> // Renderiza el HTML desde el estado
      )}
      {/* Mostrar placeholder si no hay markdown y no está cargando */}
      {!isLoading && markdown.length === 0 && (
        <p className={styles.previewPlaceholder}>
          La previsualización aparecerá aquí...
        </p>
      )}
    </div>
  );
}
