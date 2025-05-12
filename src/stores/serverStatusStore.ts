import { create } from "zustand";
import type {
  ServerInfo,
  ServerServiceStatusResult,
} from "../interfaces/be.status.interface";
import { fetchServerStatusService } from "../services/serverService";

interface ServerStatusState {
  status: "unknown" | "checking" | "online" | "offline" | "error";
  info: ServerInfo | null;
  error: string | null;
  lastChecked: Date | null;
  isLoading: boolean; // Para indicar si la comprobación inicial o forzada está en curso
  checkServerStatus: (forceCheck?: boolean) => Promise<void>;
  _setStatusLoading: () => void; // Acción interna para UI
}

const CHECK_INTERVAL_MS = 60000; // 1 minuto, por ejemplo

export const useServerStatusStore = create<ServerStatusState>((set, get) => ({
  status: "unknown",
  info: null,
  error: null,
  lastChecked: null,
  isLoading: false,

  _setStatusLoading: () => set({ isLoading: true, status: "checking" }),

  checkServerStatus: async (forceCheck: boolean = false) => {
    const { status, lastChecked, isLoading: currentIsLoading } = get();

    // Evitar múltiples chequeos simultáneos si ya hay uno en curso
    if (currentIsLoading && !forceCheck) {
      console.log("Server status check already in progress.");
      return;
    }

    const now = new Date();
    if (
      !forceCheck &&
      status === "online" &&
      lastChecked &&
      now.getTime() - lastChecked.getTime() < CHECK_INTERVAL_MS
    ) {
      // Si está online y el último chequeo fue reciente, no hacer nada
      // console.log("Server status recently checked and online.");
      return;
    }

    set({ isLoading: true, status: "checking", error: null });

    try {
      const result: ServerServiceStatusResult =
        await fetchServerStatusService();
      set({
        status: result.status,
        info: result.info || null,
        error: result.error || null,
        lastChecked: result.status === "online" ? new Date() : lastChecked, // Solo actualiza lastChecked si fue exitoso
        isLoading: false,
      });
    } catch (err) {
      // Esto no debería ocurrir si fetchServerStatusService maneja sus propios errores,
      // pero por si acaso.
      console.error("Unexpected error in checkServerStatus:", err);
      set({
        status: "error",
        info: null,
        error:
          err instanceof Error
            ? err.message
            : "Error desconocido al verificar el servidor",
        lastChecked: null, // Invalidar lastChecked en caso de error inesperado
        isLoading: false,
      });
    }
  },
}));

// Opcional: Iniciar un chequeo al cargar el store por primera vez
// Esto es útil si el store se importa temprano en la aplicación.
// useServerStatusStore.getState().checkServerStatus(true);
// Sin embargo, es mejor controlarlo desde un componente de App/Layout.
