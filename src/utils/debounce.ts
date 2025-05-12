/**
 * Retrasa la ejecución de una función hasta que haya pasado un cierto tiempo sin que se haya llamado de nuevo.
 * Incluye un callback de progreso y un método cancel.
 * @param func La función a ejecutar después del retraso.
 * @param delay El tiempo en milisegundos para esperar después de la última llamada.
 * @param onProgress Callback para el progreso (0-100) durante el retardo.
 * @returns Una nueva función que envuelve la función original con la lógica de debounce,
 * incluyendo un método `cancel`.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  onProgress?: (progress: number) => void // Callback para el progreso (0-100)
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  // Corrected return type
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let animationFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  let startTime: number | null = null;

  const tick = (currentTime: number) => {
    if (startTime === null) {
      startTime = currentTime;
    }
    const elapsed = currentTime - startTime;
    const progress = Math.min((elapsed / delay) * 100, 100);

    if (onProgress) {
      onProgress(progress);
    }

    if (elapsed < delay) {
      animationFrameId = requestAnimationFrame(tick);
    } else {
      if (onProgress) {
        onProgress(100); // Ensure 100% is hit
      }
      animationFrameId = null;
      startTime = null;
    }
  };

  // Define the debounced function
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    startTime = null;
    if (onProgress) {
      onProgress(0); // Reset progress visually immediately
    }

    timeoutId = setTimeout(() => {
      func(...args);
      // Note: Progress to 100% is handled by the tick function or on cancel/immediate execution
      animationFrameId = null;
      startTime = null;
    }, delay);

    // Start the progress animation tick if translation is enabled and there's an onProgress callback
    // Only start if not already ticking
    if (onProgress && animationFrameId === null) {
      startTime = performance.now();
      animationFrameId = requestAnimationFrame(tick);
    }
  };

  // Attach the cancel method directly to the debounced function object
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    startTime = null;
    if (onProgress) {
      onProgress(0); // Reset progress on cancel
    }
  };

  return debounced as ((...args: Parameters<T>) => void) & {
    cancel: () => void;
  };
}
