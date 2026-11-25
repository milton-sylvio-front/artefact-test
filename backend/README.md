# Backend

API Node.js com Express, TypeScript e tRPC para gerenciamento de tarefas. Os dados
ficam em memória e são reiniciados quando o servidor é encerrado.

## Executar

```sh
npm install
npm run dev
```

Para compilar e executar a versão de produção:

```sh
npm run build
npm start
```

O servidor inicia na porta `3001` por padrão. Defina a variável de ambiente
`PORT` para usar outra porta.

## tRPC

O endpoint tRPC fica disponível em `/trpc`. O frontend pode encaminhar chamadas
para esse caminho e consumir `tasks.list`, `tasks.create`, `tasks.update` e
`tasks.delete`. O tipo `AppRouter` exportado em `src/server.ts` pode ser usado
para tipar um cliente tRPC TypeScript.

- `tasks.list` — lista as tarefas.
- `tasks.create` — cria uma tarefa (`titulo` obrigatório e `descricao` opcional).
- `tasks.update` — atualiza uma tarefa existente com `{ id, titulo?, descricao? }`.
- `tasks.delete` — remove uma tarefa por `{ id }`.

Validações inválidas retornam `BAD_REQUEST`; tarefas inexistentes retornam
`NOT_FOUND`.

## Compatibilidade REST

As rotas REST abaixo continuam disponíveis para clientes já existentes:

- `GET /api/tarefas`
- `POST /api/tarefas`
- `PUT /api/tarefas/:id`
- `DELETE /api/tarefas/:id`
