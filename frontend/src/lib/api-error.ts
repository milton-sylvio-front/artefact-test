export async function getApiErrorMessage(
  response: Pick<Response, "status" | "json">,
  fallback: string,
): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.erro === "string") {
      return body.erro;
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  return `${fallback} (HTTP ${response.status}).`;
}
