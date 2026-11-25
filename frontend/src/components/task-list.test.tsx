import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import TaskList from "./task-list";
import type { Task } from "../lib/tasks";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const makeTasks = (count: number): Task[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `task-${index + 1}`,
    titulo: `Tarefa ${index + 1}`,
    descricao: "",
    dataCriacao: "2026-01-01T00:00:00.000Z",
  }));

describe("TaskList", () => {
  it("removes a task and confirms the result", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: { data: null } }),
      }),
    );
    render(<TaskList initialTasks={makeTasks(1)} />);

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByRole("status")).toHaveTextContent('Tarefa "Tarefa 1" excluída.');
    expect(screen.getByText("Nenhuma tarefa por enquanto")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/trpc/tasks.delete",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ id: "task-1" }),
      }),
    );
  });

  it("keeps the task and reports a deletion error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Tarefa não encontrada." } }),
      }),
    );
    render(<TaskList initialTasks={makeTasks(1)} />);

    await user.click(screen.getByRole("button", { name: "Excluir" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Tarefa não encontrada.");
    expect(screen.getByText("Tarefa 1")).toBeInTheDocument();
  });

  it("reveals more tasks incrementally", async () => {
    const user = userEvent.setup();
    render(<TaskList initialTasks={makeTasks(12)} />);

    expect(screen.getByText("Tarefa 10")).toBeInTheDocument();
    expect(screen.queryByText("Tarefa 11")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Carregar mais" }));
    expect(screen.getByText("Tarefa 11")).toBeInTheDocument();
    expect(screen.getByText("Tarefa 12")).toBeInTheDocument();
  });
});
