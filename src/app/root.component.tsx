import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading } from "@grupo10-pos-fiap/design-system";
import { fetchAccount } from "@/api/statement.api";
import { classifyError, AppError } from "@/utils/errorHandler";
import ErrorMessage from "@/components/ErrorMessage";
import Statement from "../Statement";
import styles from "./root.component.module.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);
  const [error, setError] = useState<AppError | null>(null);

  const loadAccount = useCallback(async () => {
    try {
      setError(null);
      setLoadingAccount(true);
      const accountInfo = await fetchAccount();

      if (accountInfo && accountInfo.id) {
        setAccountId(accountInfo.id);
      } else {
        setAccountId(null);
      }
    } catch (err) {
      const appError = classifyError(err);
      setError(appError);
      setAccountId(null);
    } finally {
      setLoadingAccount(false);
    }
  }, []);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  if (loadingAccount) {
    return (
      <div className={styles.container}>
        <Loading text="Carregando..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <ErrorMessage error={error} onRetry={loadAccount} title="Erro ao carregar conta" />
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className={styles.container}>
        <Text variant="body" color="error">
          Conta não encontrada
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Statement accountId={accountId} />
    </div>
  );
}
