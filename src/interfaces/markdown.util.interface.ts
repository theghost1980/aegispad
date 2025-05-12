/**
 * Interfaz para almacenar un elemento Markdown extraído y su marcador de posición.
 */
export interface MarkdownElement {
  placeholder: string; // El marcador temporal (ej: @@MARKDOWN_ELEMENT_1@@)
  original: string; // La sintaxis Markdown original (ej: **negritas**)
  type: string; // Tipo de elemento (ej: 'bold', 'link', 'codeblock')
  // Puedes añadir más propiedades si necesitas detalles específicos del elemento
  // Por ejemplo, para un enlace: href?: string; text?: string;
}
