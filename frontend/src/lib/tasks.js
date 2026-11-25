import { callTrpc } from "./trpc";

export async function fetchTasksFromBackend() {
  return callTrpc("tasks.list", { cache: "no-store" });
}
