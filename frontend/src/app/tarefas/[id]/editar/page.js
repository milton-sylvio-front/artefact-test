import Link from "next/link";
import TaskForm from "../../../../components/task-form";
import { fetchTasksFromBackend } from "../../../../lib/tasks";

export default async function EditTaskPage({ params }) {
  const { id } = await params;
  let task;

  try {
    const tasks = await fetchTasksFromBackend();
    task = tasks.find((item) => item.id === id);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar a tarefa.";

    return (
      <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12 sm:px-8">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          {message}
        </p>
        <Link className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline" href="/">
          Voltar para a lista
        </Link>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12 sm:px-8">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900" role="alert">
          Tarefa não encontrada.
        </p>
        <Link className="mt-5 inline-block text-sm font-medium text-blue-700 hover:underline" href="/">
          Voltar para a lista
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12 sm:px-8">
      <Link className="text-sm font-medium text-blue-700 hover:underline" href="/">
        ← Voltar para a lista
      </Link>
      <h1 className="mb-6 mt-5 text-3xl font-bold tracking-tight">Editar tarefa</h1>
      <TaskForm task={task} />
    </main>
  );
}
