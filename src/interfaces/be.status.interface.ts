export interface MemoryUsageInfo {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers?: number;
}

export interface ServerInfo {
  serverTime: string;
  uptime: number;
  memoryUsage: MemoryUsageInfo;
  env: string;
  nodeVersion: string;
  db: string;
}

export interface ServerStatusResponse {
  success: boolean;
  serverTime?: string;
  uptime?: number;
  memoryUsage?: MemoryUsageInfo;
  env?: string;
  nodeVersion?: string;
  db?: string;
  error?: string;
}

export interface ServerServiceStatusResult {
  status: "online" | "offline" | "error";
  info?: ServerInfo;
  error?: string;
}
