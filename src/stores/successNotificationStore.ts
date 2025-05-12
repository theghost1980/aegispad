import { create } from "zustand";

interface SuccessNotificationState {
  isVisible: boolean;
  message: string | null;
  showSuccess: (message: string, duration?: number) => void;
  hideSuccess: () => void;
  _timeoutId: number | null; // Cambiado a number para el tipo de retorno de setTimeout en el navegador
}

const DEFAULT_DURATION = 3000; // 3 segundos por defecto

export const useSuccessNotificationStore = create<SuccessNotificationState>(
  (set, get) => ({
    isVisible: false,
    message: null,
    _timeoutId: null,
    showSuccess: (message, duration = DEFAULT_DURATION) => {
      const currentTimeoutId = get()._timeoutId;
      // Limpiar cualquier timeout anterior para evitar múltiples notificaciones
      // o comportamientos inesperados si se llama showSuccess rápidamente.
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }

      // Usamos window.setTimeout para ser explícitos sobre el entorno del navegador
      const newTimeoutId = window.setTimeout(() => {
        get().hideSuccess(); // Llama a la acción hideSuccess para centralizar la lógica de ocultar
      }, duration);

      // Actualizar el estado en una sola llamada a set
      set({
        isVisible: true,
        message,
        _timeoutId: newTimeoutId,
      });
    },
    hideSuccess: () => {
      const currentTimeoutId = get()._timeoutId;
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId); // Limpiar el timeout si se oculta manualmente
      }
      set({ isVisible: false, message: null, _timeoutId: null });
    },
  })
);
