import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskForm from "./task-form";

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

describe("TaskForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("does not submit a blank title", async () => {
    const user = userEvent.setup();
    render(<TaskForm />);

    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Informe um título");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("creates a task and shows success feedback", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ result: { data: { id: "task-1" } } }),
    } as unknown as Response);
    render(<TaskForm />);

    await user.type(screen.getByLabelText("Título"), "Planejar semana");
    await user.type(screen.getByLabelText(/Descrição/), "Organizar prioridades");
    await user.click(screen.getByRole("button", { name: "Criar tarefa" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Tarefa criada"));
    expect(fetch).toHaveBeenCalledWith(
      "/trpc/tasks.create",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ titulo: "Planejar semana", descricao: "Organizar prioridades" }),
      }),
    );
  });

  it("shows errors returned by the backend when updating", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: { message: "Tarefa não encontrada." } }),
    } as unknown as Response);
    render(
      <TaskForm
        task={{
          id: "inexistente",
          titulo: "Tarefa",
          descricao: "",
          dataCriacao: "2026-01-01T00:00:00.000Z",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Tarefa não encontrada.");
    expect(fetch).toHaveBeenCalledWith(
      "/trpc/tasks.update",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ titulo: "Tarefa", descricao: "", id: "inexistente" }),
      }),
    );
  });
});
