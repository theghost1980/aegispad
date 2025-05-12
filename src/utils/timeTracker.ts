/**
 * Clase para medir la duración de una operación.
 *
 * Ejemplo de uso:
 * const timer = new OperationTimer("Traducción de Texto");
 * timer.start();
 * // ...realizar la operación...
 * const rawMs = timer.stop();
 * if (rawMs !== null) {
 *   console.log(`La traducción tardó ${timer.getFormattedDuration()}.`); // Ahora puedes usar esto
 * }
 */
export class OperationTimer {
  private startTime: number | null = null;
  private lastDurationMs: number | null = null;
  private operationName: string;

  /**
   * Crea una instancia de OperationTimer.
   * @param operationName - Un nombre descriptivo para la operación que se está midiendo.
   */
  constructor(operationName: string = "Operación sin nombre") {
    this.operationName = operationName;
  }

  /**
   * Formatea una duración dada en milisegundos a un string más legible (ms, s, min).
   * @param milliseconds La duración en milisegundos.
   * @returns Un string formateado representando la duración.
   */
  static formatDuration(milliseconds: number | null): string {
    if (milliseconds === null) {
      return "N/A";
    }

    if (milliseconds < 0) {
      return "Duración inválida";
    }

    if (milliseconds < 1200) {
      // Menos de 1.2 segundos, mostrar en ms
      return `${milliseconds.toFixed(2)} ms`;
    } else if (milliseconds < 60000) {
      // Menos de 60 segundos, mostrar en segundos
      return `${(milliseconds / 1000).toFixed(2)} s`;
    } else {
      // 60 segundos o más, mostrar en minutos
      return `${(milliseconds / 60000).toFixed(2)} min`;
    }
  }

  /**
   * Inicia el temporizador para la operación.
   */
  start(): void {
    if (this.startTime !== null) {
      console.warn(
        `El temporizador para "${this.operationName}" ya está en marcha.`
      );
      return;
    }
    this.lastDurationMs = null; // Resetea la última duración al iniciar
    this.startTime = performance.now();
  }

  /**
   * Detiene el temporizador y devuelve la duración en milisegundos.
   * @returns La duración de la operación en milisegundos, o null si el temporizador no se inició o ya se detuvo.
   */
  stop(): number | null {
    if (this.startTime === null) {
      console.warn(
        `El temporizador para "${this.operationName}" no se inició o ya se detuvo.`
      );
      return null;
    }
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    this.lastDurationMs = duration; // Guarda la duración actual
    this.startTime = null; // Resetea para posible reutilización o para indicar que está detenido
    return duration;
  }

  /**
   * Devuelve la última duración medida, formateada.
   * Llama a este método después de que `stop()` haya sido invocado.
   * @returns Un string con la última duración formateada, o "N/A" si no se ha medido una duración o `stop()` no ha sido llamado.
   */
  getFormattedDuration(): string {
    return OperationTimer.formatDuration(this.lastDurationMs);
  }
}
