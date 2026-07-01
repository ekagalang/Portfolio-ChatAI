import { GoogleGenerativeAI } from "@google/generative-ai";

export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash-lite";
export const GEMINI_CHAT_MODELS = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL] as const;

// Timeout per-request; SDK membatalkan fetch secara internal saat lewat batas ini,
// jadi upstream yang hang tidak menggantung request kita.
export const GEMINI_TIMEOUT_MS = 30_000;

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tidak ditemukan di environment.");
  }

  return apiKey;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getGeminiClient() {
  return new GoogleGenerativeAI(getApiKey());
}

export function getGeminiModel(modelName = GEMINI_MODEL) {
  const genAI = getGeminiClient();

  // gemini-2.5-flash untuk kualitas utama, flash-lite untuk fallback throughput.
  return genAI.getGenerativeModel(
    {
      model: modelName,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    },
    { timeout: GEMINI_TIMEOUT_MS }
  );
}

function getErrorStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

export function isRetryableGeminiError(error: unknown) {
  const status = getErrorStatus(error);
  if (status !== undefined) {
    return [429, 500, 502, 503, 504].includes(status);
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("failed to parse stream") ||
      message.includes("service unavailable") ||
      message.includes("high demand") ||
      message.includes("overloaded")
    );
  }

  return false;
}

export async function withGeminiRetry<T>(
  operation: () => Promise<T>,
  attempts = 3,
  initialDelayMs = 800
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === attempts || !isRetryableGeminiError(error)) {
        throw error;
      }

      await sleep(initialDelayMs * attempt);
    }
  }

  throw lastError;
}

export async function withGeminiModelFallback<T>(
  operation: (modelName: string) => Promise<T>,
  models: readonly string[] = GEMINI_CHAT_MODELS,
  attemptsPerModel = 2
): Promise<{ result: T; modelName: string }> {
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const result = await withGeminiRetry(
        () => operation(modelName),
        attemptsPerModel
      );

      return { result, modelName };
    } catch (error) {
      lastError = error;

      if (!isRetryableGeminiError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
}
