const ACCOUNT_ID_KEY = "accountId";

export class LocalStorageError extends Error {
  constructor(message: string, public readonly _originalError?: unknown) {
    super(message);
    this.name = "LocalStorageError";
  }
}

export function getAccountId(): string | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  try {
    const accountId = localStorage.getItem(ACCOUNT_ID_KEY);
    return accountId || null;
  } catch (error) {
    return null;
  }
}

export function setAccountId(accountId: string): void {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new LocalStorageError("localStorage não está disponível");
  }

  try {
    localStorage.setItem(ACCOUNT_ID_KEY, accountId);
    window.dispatchEvent(new CustomEvent("accountIdChanged", { detail: { accountId } }));
  } catch (error) {
    const errorMessage =
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "Quota do localStorage excedida"
        : "Falha ao salvar accountId no localStorage";
    throw new LocalStorageError(errorMessage, error);
  }
}

export function removeAccountId(): void {
  if (typeof window === "undefined" || !window.localStorage) {
    throw new LocalStorageError("localStorage não está disponível");
  }

  try {
    localStorage.removeItem(ACCOUNT_ID_KEY);
  } catch (error) {
    throw new LocalStorageError("Falha ao remover accountId do localStorage", error);
  }
}
