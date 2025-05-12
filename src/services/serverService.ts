import type {
  ServerInfo,
  ServerServiceStatusResult,
  ServerStatusResponse,
} from "../interfaces/be.status.interface";
import { baseUrl } from "../utils/env.utils";

export const fetchServerStatusService =
  async (): Promise<ServerServiceStatusResult> => {
    try {
      const response = await fetch(`${baseUrl}/api/status/`);
      const data: ServerStatusResponse = await response.json();

      if (response.ok && data.success) {
        const serverInfo: ServerInfo = {
          serverTime: data.serverTime!,
          uptime: data.uptime!,
          memoryUsage: data.memoryUsage!,
          env: data.env!,
          nodeVersion: data.nodeVersion!,
          db: data.db!,
        };
        return { status: "online", info: serverInfo };
      }
      return {
        status: "offline",
        error: data.error || `Error ${response.status}: ${response.statusText}`,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error de conexión desconocido";
      console.error("Error fetching server status (in serverService):", err);
      return { status: "error", error: errorMessage };
    }
  };
