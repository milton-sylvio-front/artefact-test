type CallTrpcOptions = {
  type?: "query" | "mutation";
  input?: unknown;
  cache?: RequestCache;
};

type TrpcResponse = {
  result?: {
    data?: unknown;
  };
  error?: {
    json?: {
      message?: unknown;
    };
    message?: unknown;
  };
};

export async function callTrpc<T>(
  procedure: string,
  { type = "query", input = null, cache }: CallTrpcOptions = {},
): Promise<T> {
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

  let payload: TrpcResponse | undefined;
  try {
    payload = (await response.json()) as TrpcResponse;
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

  return payload.result.data as T;
}
