export async function callTrpc(procedure, { type = "query", input = null, cache } = {}) {
  const baseUrl =
    typeof window === "undefined"
      ? `${process.env.BACKEND_URL || "http://localhost:3001"}/trpc`
      : "/trpc";
  const method = type === "mutation" ? "POST" : "GET";
  const inputPayload = JSON.stringify(input);
  const url =
    method === "GET"
      ? `${baseUrl}/${procedure}?input=${encodeURIComponent(inputPayload)}`
      : `${baseUrl}/${procedure}`;

  const response = await fetch(url, {
    method,
    ...(cache ? { cache } : {}),
    ...(method === "POST"
      ? {
          headers: { "Content-Type": "application/json" },
          body: inputPayload,
        }
      : {}),
  });

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  if (!response.ok) {
    const message = payload?.error?.json?.message ?? payload?.error?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : `Não foi possível chamar ${procedure} (HTTP ${response.status}).`,
    );
  }

  if (!payload?.result || !("data" in payload.result)) {
    throw new Error(`Resposta inválida do endpoint ${procedure}.`);
  }

  return payload.result.data;
}
