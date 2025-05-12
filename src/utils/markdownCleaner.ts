import type { AlignType, Root, Text } from "mdast"; // Importa el tipo Root y Text desde mdast
import { remark } from "remark";
import remarkGfm from "remark-gfm"; // Importar remark-gfm para un mejor soporte de tablas
import remarkParse from "remark-parse";
import remarkStringify, {
  type Options as StringifyOptions,
} from "remark-stringify";
import { visit } from "unist-util-visit";

// Creamos un procesador remark con los plugins de parseo y serialización
const processor = remark().use(remarkGfm).use(remarkParse).use(remarkStringify);

/**
 * Interfaz para almacenar un fragmento de texto extraído y su ubicación en el AST.
 * Esto es más robusto que los marcadores de posición.
 */
interface ExtractedTextFragment {
  node: Text; // Referencia al nodo de texto original en el AST
  value: string; // El valor del texto extraído
}

/**
 * Limpia una cadena de texto Markdown parseándola y extrayendo los fragmentos de texto traducibles.
 * Devuelve el AST del documento (tipo Root) y los fragmentos de texto extraídos.
 *
 * @param markdownText La cadena de texto Markdown a limpiar.
 * @returns Un objeto que contiene el AST del documento (Root) y un array de fragmentos de texto extraídos.
 */
export const cleanMarkdownForTranslation = (
  markdownText: string
): {
  tree: Root;
  textFragments: ExtractedTextFragment[];
  tableAlignments: (AlignType[] | null | undefined)[];
} => {
  // Parsear el texto Markdown a un AST
  // processor.parse() devuelve un nodo de tipo Root
  const tree = processor.parse(markdownText) as Root; // Aseguramos el tipo Root

  const textFragments: ExtractedTextFragment[] = [];
  const tableAlignments: (AlignType[] | null | undefined)[] = [];

  console.log("DEBUG CLEANER (Remark): AST inicial:", tree);

  // Recorrer el AST para encontrar nodos de texto traducibles
  // visit(tree, 'type', (node, index, parent) => { ... })
  // Queremos visitar nodos de tipo 'text'.
  // Los nodos de texto dentro de bloques de código o código en línea
  // NO son de tipo 'text' en el AST de mdast; su contenido está en la propiedad 'value'
  // de los nodos 'code' o 'inlineCode'. No necesitamos verificar el padre aquí.
  visit(tree, (node) => {
    // Visitar todos los nodos para diferentes propósitos
    if (node.type === "text") {
      // Si es un nodo de texto normal, lo extraemos
      // Solo extraer texto no vacío o que contenga más que solo espacios
      if (node.value.trim().length > 0) {
        textFragments.push({ node: node as Text, value: node.value });
      }
    } else if (node.type === "table") {
      // Si es una tabla, guardamos su información de alineación
      // La propiedad 'align' puede ser null o undefined si no hay alineación explícita
      // o si el parser no la infiere. remark-gfm debería inferirla.
      tableAlignments.push((node as any).align); // 'any' porque 'align' no está en el tipo base 'Node'
    }
  });

  console.log(
    "DEBUG CLEANER (Remark): Fragmentos de texto extraídos:",
    textFragments
  );

  // Devolvemos el árbol (tipo Root) y los fragmentos extraídos
  return { tree, textFragments, tableAlignments };
};

/**
 * Reinserta los fragmentos de texto traducidos en el AST original (tipo Root) y serializa el AST de vuelta a Markdown.
 *
 * @param tree El AST original del documento (tipo Root).
 * @param originalTableAlignments Array de información de alineación de las tablas originales
 * @param translatedTexts Un array de cadenas de texto traducidas, en el MISMO orden que los fragmentos extraídos.
 * @param textFragments El array de fragmentos de texto extraídos con referencias a los nodos originales.
 * @returns La cadena de texto Markdown con la traducción reinsertada.
 */
export const reinsertMarkdownElements = (
  tree: Root,
  originalTableAlignments: (AlignType[] | null | undefined)[],
  translatedTexts: string[],
  textFragments: ExtractedTextFragment[]
): string => {
  // Cambiamos el tipo de 'tree' a Root
  // Asegurarse de que el número de textos traducidos coincide con el número de fragmentos extraídos
  if (translatedTexts.length !== textFragments.length) {
    console.error(
      "DEBUG REINSERTER (Remark): El número de textos traducidos no coincide con los fragmentos extraídos. translatedTexts:",
      translatedTexts,
      "textFragments:",
      textFragments
    );
    // En un caso real, podrías querer lanzar un error o manejar esta inconsistencia.
    // Por ahora, intentaremos reinsertar lo que podamos, pero logueamos la advertencia.
  }

  console.log(
    "DEBUG REINSERTER (Remark): Texto traducido recibido:",
    translatedTexts
  );
  console.log(
    "DEBUG REINSERTER (Remark): Fragmentos originales:",
    textFragments
  );

  // Antes de actualizar los textos, restauramos la información de alineación en los nodos 'table' del árbol.
  // Esto es crucial si el árbol fue clonado o si la información se perdió.
  // Dado que 'tree' es una referencia al objeto original y 'fragment.node' también,
  // las propiedades de los nodos 'table' en 'tree' deberían estar intactas.
  // Sin embargo, este paso explícito asegura que 'align' esté presente para remark-stringify.
  let currentTableIndex = 0;
  visit(tree, "table", (node) => {
    if (currentTableIndex < originalTableAlignments.length) {
      const alignInfo = originalTableAlignments[currentTableIndex];
      if (alignInfo !== undefined) {
        // Solo asignar si tenemos información (puede ser null)
        (node as any).align = alignInfo;
      }
      currentTableIndex++;
    }
  });

  // Recorrer los fragmentos extraídos y actualizar el valor de los nodos correspondientes en el árbol
  textFragments.forEach((fragment, index) => {
    // Usar el texto traducido si existe para este fragmento, de lo contrario usar el original
    // Añadimos una verificación defensiva para asegurarnos de que translatedTexts[index] existe
    const translatedValue =
      translatedTexts[index] !== undefined && translatedTexts[index] !== null
        ? translatedTexts[index]
        : fragment.value;

    // Actualizar el valor del nodo de texto en el árbol
    // Aseguramos que el nodo es de tipo Text antes de acceder a .value
    // La referencia en fragment.node ya debería ser de tipo Text por cómo se extrajo
    if (fragment.node && fragment.node.type === "text") {
      (fragment.node as Text).value = translatedValue;
      console.log(
        `DEBUG REINSERTER (Remark): Nodo actualizado: "${fragment.value}" -> "${translatedValue}"`
      );
    } else {
      console.warn(
        "DEBUG REINSERTER (Remark): Fragmento extraído no corresponde a un nodo de texto válido en el árbol.",
        fragment
      );
    }
  });

  // Opciones para remarkStringify, especialmente para tablas GFM
  const stringifyOptions: StringifyOptions = {
    bullet: "-", // Preferir guiones para listas no ordenadas
    listItemIndent: "one", // Indentación de un espacio para ítems de lista
    // remark-gfm se encarga de la serialización de tablas, incluyendo la línea separadora
    // si el nodo 'table' tiene la propiedad 'align' correctamente establecida.
  };
  // Serializar el AST modificado de vuelta a una cadena de texto Markdown
  // Aquí processor.stringify espera un nodo Root, y ahora 'tree' es de tipo Root
  const finalMarkdown = remark()
    .use(remarkGfm)
    .use(remarkStringify, stringifyOptions)
    .stringify(tree);

  console.log(
    "DEBUG REINSERTER (Remark): Resultado final (Markdown):",
    finalMarkdown
  );

  return finalMarkdown;
};

// Ejemplo de uso (para pruebas internas si lo deseas):
/*
const markdown = `
# Mi Título de Artículo

Este es un **párrafo** con *texto en cursiva*.

\`\`\`javascript
console.log('Esto es código');
\`\`\`

> Una cita importante.

[Un enlace](http://ejemplo.com).

Lista:
* Item 1
* Item 2
`;

const { tree, textFragments } = cleanMarkdownForTranslation(markdown);

// Simular traducción (solo del texto plano)
const simulatedTranslatedTexts = textFragments.map(fragment => {
    // Aquí es donde llamarías a tu servicio de traducción con fragment.value
    // Por ahora, una traducción simple de ejemplo:
    return `(Traducido) ${fragment.value}`;
});

const translatedMarkdown = reinsertMarkdownElements(tree, simulatedTranslatedTexts, textFragments);
console.log("\n--- Markdown Traducido Simulado ---");
console.log(translatedMarkdown);
*/
