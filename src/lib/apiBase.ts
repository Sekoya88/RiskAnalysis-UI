/** Backend origin (no trailing slash). Set `NEXT_PUBLIC_API_URL` if the API is not on localhost. */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

/** WebSocket origin for agent logs. Set `NEXT_PUBLIC_WS_URL` or derived from `API_BASE`. */
export function wsBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  return API_BASE.replace(/^https/, "wss").replace(/^http/, "ws");
}
