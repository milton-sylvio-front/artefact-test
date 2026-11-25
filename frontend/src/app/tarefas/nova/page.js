import Link from "next/link";
import TaskForm from "../../../components/task-form";

export default function NewTaskPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-12 sm:px-8">
      <Link className="text-sm font-medium text-blue-700 hover:underline" href="/">
        ← Voltar para a lista
      </Link>
      <h1 className="mb-6 mt-5 text-3xl font-bold tracking-tight">Nova tarefa</h1>
      <TaskForm />
    </main>
  );
}
