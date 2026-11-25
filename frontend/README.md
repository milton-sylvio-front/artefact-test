# Frontend

Aplicação de gerenciamento de tarefas com Next.js 15, React e Tailwind CSS.
A listagem e o formulário de edição carregam seus dados no servidor; as ações
do navegador usam os procedimentos tRPC encaminhados pelo Next.js em `/trpc`.
O frontend consome `tasks.list`, `tasks.create`, `tasks.update` e `tasks.delete`.

## Executar

Em um terminal, inicie o backend:

```sh
npm --prefix ../backend start
```

Em outro terminal:

```sh
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:3000`. Para apontar para outra
URL do backend, defina `BACKEND_URL` (padrão: `http://localhost:3001`).

## Testes

```sh
npm test
```
