import { callTrpc } from "./trpc";

export type Task = {
  id: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
};

export async function fetchTasksFromBackend(): Promise<Task[]> {
  return callTrpc<Task[]>("tasks.list", { cache: "no-store" });
}
