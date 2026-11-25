import { randomUUID } from "node:crypto";
import express, { type Request, type Response } from "express";
import { initTRPC, TRPCError } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { z } from "zod";

type Tarefa = {
  id: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
};

const tarefas = new Map<string, Tarefa>();

function criarTarefa(input: { titulo: string; descricao?: string }): Tarefa {
  const tarefa: Tarefa = {
    id: randomUUID(),
    titulo: input.titulo.trim(),
    descricao: input.descricao?.trim() ?? "",
    dataCriacao: new Date().toISOString(),
  };
  tarefas.set(tarefa.id, tarefa);
  return tarefa;
}

function atualizarTarefa(
  id: string,
  input: { titulo?: string; descricao?: string },
): Tarefa {
  const tarefa = tarefas.get(id);
  if (!tarefa) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
  }

  if (input.titulo !== undefined) tarefa.titulo = input.titulo.trim();
  if (input.descricao !== undefined) tarefa.descricao = input.descricao.trim();
  return tarefa;
}

function deletarTarefa(id: string): void {
  if (!tarefas.delete(id)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Tarefa não encontrada." });
  }
}

const t = initTRPC.create();
const tituloSchema = z.string().trim().min(1, "O título é obrigatório.");
const updateInputSchema = z
  .object({
    id: z.string().min(1),
    titulo: tituloSchema.optional(),
    descricao: z.string().optional(),
  })
  .refine(
    ({ titulo, descricao }) => titulo !== undefined || descricao !== undefined,
    "Informe ao menos um campo para atualizar.",
  );

export const appRouter = t.router({
  tasks: t.router({
    list: t.procedure.query(() => Array.from(tarefas.values())),
    create: t.procedure
      .input(
        z.object({
          titulo: tituloSchema,
          descricao: z.string().optional(),
        }),
      )
      .mutation(({ input }) => criarTarefa(input)),
    update: t.procedure
      .input(updateInputSchema)
      .mutation(({ input }) => atualizarTarefa(input.id, input)),
    delete: t.procedure
      .input(z.object({ id: z.string().min(1) }))
      .mutation(({ input }) => deletarTarefa(input.id)),
  }),
});

export type AppRouter = typeof appRouter;

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  }),
);

app.get("/api/tarefas", (_req, res) => {
  res.json(Array.from(tarefas.values()));
});

app.post("/api/tarefas", (req: Request, res: Response) => {
  const body: unknown = req.body;
  const parsed = z
    .object({
      titulo: tituloSchema,
      descricao: z.string().optional(),
    })
    .safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ erro: parsed.error.issues[0]?.message });
  }

  return res.status(201).json(criarTarefa(parsed.data));
});

app.put("/api/tarefas/:id", (req: Request<{ id: string }>, res: Response) => {
  const body = z
    .object({
      titulo: tituloSchema.optional(),
      descricao: z.string().optional(),
    })
    .refine(
      ({ titulo, descricao }) => titulo !== undefined || descricao !== undefined,
      "Informe ao menos um campo para atualizar.",
    )
    .safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({ erro: body.error.issues[0]?.message });
  }

  const tarefa = tarefas.get(req.params.id);
  if (!tarefa) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }

  if (body.data.titulo !== undefined) tarefa.titulo = body.data.titulo;
  if (body.data.descricao !== undefined) tarefa.descricao = body.data.descricao.trim();
  return res.json(tarefa);
});

app.delete("/api/tarefas/:id", (req: Request<{ id: string }>, res: Response) => {
  if (!tarefas.delete(req.params.id)) {
    return res.status(404).json({ erro: "Tarefa não encontrada." });
  }
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
