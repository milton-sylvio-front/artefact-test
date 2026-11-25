import { describe, expect, it, vi } from "vitest";
import { getApiErrorMessage } from "./api-error";

describe("getApiErrorMessage", () => {
  it("uses a readable fallback for non-JSON upstream errors", async () => {
    const response = {
      status: 502,
      json: vi.fn().mockRejectedValue(new SyntaxError("Unexpected token")),
    };

    await expect(getApiErrorMessage(response, "Falha ao salvar")).resolves.toBe(
      "Falha ao salvar (HTTP 502).",
    );
  });
});
