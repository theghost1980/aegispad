// src/utils/wordCount.ts

/**
 * Cuenta el número de palabras en una cadena de texto.
 * Las palabras se definen como secuencias de caracteres no espaciales.
 *
 * @param text La cadena de texto de entrada.
 * @returns El número de palabras en la cadena.
 */
export const countWords = (text: string): number => {
  if (!text) {
    return 0;
  }

  // Eliminar espacios en blanco al inicio y final
  const trimmedText = text.trim();

  // Si el texto está vacío después de eliminar espacios, no hay palabras
  if (trimmedText === "") {
    return 0;
  }

  // Dividir la cadena por uno o más espacios en blanco consecutivos
  // y contar el número de elementos resultantes.
  // La expresión regular \s+ coincide con uno o más caracteres de espacio en blanco (espacio, tab, nueva línea, etc.)
  const words = trimmedText.split(/\s+/);

  return words.length;
};

// Ejemplo de uso (para pruebas internas si lo deseas):
/*
  const exampleText1 = "Hola mundo";
  console.log(`"${exampleText1}" tiene ${countWords(exampleText1)} palabras.`); // Salida: 2
  
  const exampleText2 = "  Este es un   ejemplo con espacios extra. ";
  console.log(`"${exampleText2}" tiene ${countWords(exampleText2)} palabras.`); // Salida: 7
  
  const exampleText3 = "";
  console.log(`"${exampleText3}" tiene ${countWords(exampleText3)} palabras.`); // Salida: 0
  
  const exampleText4 = "   ";
  console.log(`"${exampleText4}" tiene ${countWords(exampleText4)} palabras.`); // Salida: 0
  */
