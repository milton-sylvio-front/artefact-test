"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { callTrpc } from "../lib/trpc";

const PAGE_SIZE = 10;

export default function TaskList({ initialTasks, initialError = "" }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (
      !sentinelRef.current ||
      visibleCount >= tasks.length ||
      typeof IntersectionObserver === "undefined"
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisibleCount((count) => Math.min(count + PAGE_SIZE, tasks.length));
      }
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [tasks.length, visibleCount]);

  async function deleteTask(task) {
    setError("");
    setNotice("");
    setDeletingId(task.id);

    try {
      await callTrpc("tasks.delete", {
        type: "mutation",
        input: { id: task.id },
      });

      setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id));
      setNotice(`Tarefa "${task.titulo}" excluída.`);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir a tarefa.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (error && tasks.length === 0) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
        {error}
      </p>
    );
  }

  return (
    <section aria-label="Lista de tarefas">
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800" role="status">
          {notice}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-lg font-semibold">Nenhuma tarefa por enquanto</p>
          <p className="mt-2 text-slate-600">Crie uma tarefa para começar a se organizar.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.slice(0, visibleCount).map((task) => (
            <li
              className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              key={task.id}
            >
              <div className="min-w-0">
                <h2 className="break-words text-lg font-semibold">{task.titulo}</h2>
                {task.descricao && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-slate-600">
                    {task.descricao}
                  </p>
                )}
                <time className="mt-2 block text-sm text-slate-500" dateTime={task.dataCriacao}>
                  Criada em {new Date(task.dataCriacao).toLocaleDateString("pt-BR")}
                </time>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  aria-label={`Editar ${task.titulo}`}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  href={`/tarefas/${task.id}/editar`}
                >
                  Editar
                </Link>
                <button
                  className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                  disabled={deletingId === task.id}
                  onClick={() => deleteTask(task)}
                  type="button"
                >
                  {deletingId === task.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {visibleCount < tasks.length && (
        <div className="mt-5 text-center">
          <div aria-hidden="true" className="h-px" ref={sentinelRef} />
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, tasks.length))}
            type="button"
          >
            Carregar mais
          </button>
        </div>
      )}
    </section>
  );
}
