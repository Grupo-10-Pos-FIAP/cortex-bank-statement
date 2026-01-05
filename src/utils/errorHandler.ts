/**
 * Tipos de erros da aplicação
 */
export const ErrorType = {
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  SERVER: "SERVER",
  CLIENT: "CLIENT",
  UNKNOWN: "UNKNOWN",
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * Interface para erros tratados
 */
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  statusCode?: number;
  retryable: boolean;
}

/**
 * Obtém mensagem de erro baseada no status code HTTP
 */
function getClientErrorMessage(statusCode: number): string {
  const errorMessages: Record<number, string> = {
    401: "Não autorizado. Faça login novamente.",
    403: "Acesso negado. Você não tem permissão para esta ação.",
    404: "Recurso não encontrado.",
    429: "Muitas requisições. Aguarde um momento e tente novamente.",
  };

  return errorMessages[statusCode] || "Erro na requisição. Verifique os dados e tente novamente.";
}

/**
 * Classifica erros HTTP (4xx e 5xx)
 */
function classifyHttpError(error: Error, statusCode: number): AppError {
  if (statusCode >= 500) {
    return {
      type: ErrorType.SERVER,
      message: "Erro no servidor. Tente novamente em alguns instantes.",
      originalError: error,
      statusCode,
      retryable: true,
    };
  }

  if (statusCode >= 400) {
    return {
      type: ErrorType.CLIENT,
      message: getClientErrorMessage(statusCode),
      originalError: error,
      statusCode,
      retryable: false,
    };
  }

  // Status code não é erro (2xx, 3xx)
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || "Erro desconhecido",
    originalError: error,
    statusCode,
    retryable: false,
  };
}

/**
 * Extrai status code de uma mensagem de erro
 */
function extractStatusCode(error: Error): number | undefined {
  const statusMatch = error.message.match(/(\d{3})/);
  return statusMatch ? parseInt(statusMatch[1], 10) : undefined;
}

/**
 * Classifica um erro e retorna informações estruturadas
 */
export function classifyError(error: unknown): AppError {
  // Erro de rede (fetch falhou)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      type: ErrorType.NETWORK,
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
      originalError: error as Error,
      retryable: true,
    };
  }

  // Erro de timeout
  if (error instanceof Error && error.message.includes("timeout")) {
    return {
      type: ErrorType.TIMEOUT,
      message: "A requisição demorou muito para responder. Tente novamente.",
      originalError: error,
      retryable: true,
    };
  }

  // Erro com status HTTP
  if (error instanceof Error && error.message.includes("Erro na requisição")) {
    const statusCode = extractStatusCode(error);
    if (statusCode) {
      return classifyHttpError(error, statusCode);
    }
  }

  // Erro genérico
  return {
    type: ErrorType.UNKNOWN,
    message: error instanceof Error ? error.message : "Erro desconhecido",
    originalError: error instanceof Error ? error : undefined,
    retryable: false,
  };
}

/**
 * Aguarda um tempo antes de retry (exponential backoff)
 */
export function waitForRetry(attempt: number, baseDelay = 1000): Promise<void> {
  const delay = baseDelay * Math.pow(2, attempt);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Executa uma função com retry automático
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    retryable?: (_error: AppError) => boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, retryable } = options;

  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = classifyError(error);

      // Se não é retryable, lança imediatamente
      if (!appError.retryable) {
        throw appError;
      }

      // Se tem função customizada de retry, verifica
      if (retryable && !retryable(appError)) {
        throw appError;
      }

      lastError = appError;

      // Se é a última tentativa, lança o erro
      if (attempt === maxRetries) {
        throw appError;
      }

      // Aguarda antes de tentar novamente
      await waitForRetry(attempt, baseDelay);
    }
  }

  // Nunca deve chegar aqui, mas TypeScript precisa
  throw lastError || new Error("Erro desconhecido");
}
