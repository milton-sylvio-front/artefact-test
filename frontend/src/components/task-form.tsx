"use client";

import Link from "next/link";
import React, { useState } from "react";
import { callTrpc } from "../lib/trpc";
import type { Task } from "../lib/tasks";

type TaskFormProps = {
  task?: Task | null;
};

export default function TaskForm({ task = null }: TaskFormProps) {
  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!titulo.trim()) {
      setError("      Informe um título para a tarefa.");
      return;
    }

    setIsSubmitting(true);

    try {
      const input: { titulo: string; descricao: string; id?: string } = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
      };
      if (task) input.id = task.id;
      await callTrpc(task ? "tasks.update" : "tasks.create", {
        type: "mutation",
        input,
      });

      setSuccess(task ? "Tarefa atualizada com sucesso." : "Tarefa criada com sucesso.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar a tarefa.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800" role="status">
          {success}{" "}
          <Link className="font-semibold underline" href="/">
            Voltar para a lista
          </Link>
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold" htmlFor="titulo">
          Título
        </label>
        <input
          autoComplete="off"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="titulo"
          maxLength={160}
          onChange={(event) => setTitulo(event.target.value)}
          value={titulo}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold" htmlFor="descricao">
          Descrição <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          className="min-h-32 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          id="descricao"
          onChange={(event) => setDescricao(event.target.value)}
          rows={4}
          value={descricao}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </button>
        <Link
          className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium hover:bg-slate-50"
          href="/"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
