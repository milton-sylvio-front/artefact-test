import Link from "next/link";
import TaskList from "../components/task-list";
import { fetchTasksFromBackend } from "../lib/tasks";
import type { Task } from "../lib/tasks";

export default async function HomePage() {
  let initialTasks: Task[] = [];
  let initialError = "";

  try {
    initialTasks = await fetchTasksFromBackend();
  } catch (error) {
    initialError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar as tarefas.";
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            Organize seu dia
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Minhas tarefas
          </h1>
        </div>
        <Link
          className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          href="/tarefas/nova"
        >
          Nova tarefa
        </Link>
      </header>
      <TaskList initialTasks={initialTasks} initialError={initialError} />
    </main>
  );
}
