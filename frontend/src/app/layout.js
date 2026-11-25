import "./globals.css";

export const metadata = {
  title: "Minhas tarefas",
  description: "Organize e acompanhe suas tarefas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
