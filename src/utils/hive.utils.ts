function generatePermlink(text: string, useTimestamp = false): string {
  const cleanedText = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Eliminar caracteres no alfanuméricos excepto espacios y guiones
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-"); // Reemplazar múltiples guiones con uno solo

  const timestamp = Date.now().toString().slice(-5);
  return `${cleanedText.substring(0, 200)}${
    useTimestamp ? `-${timestamp}` : ""
  }`;
}

export const HiveUtils = {
  generatePermlink,
};
