import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading, Button, Card } from "@grupo10-pos-fiap/design-system";
import { QueryProvider } from "@/providers/QueryProvider";
import { getAccountId } from "@/utils/accountStorage";
import Statement from "../Statement";
import styles from "./root.component.module.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);

  const loadAccountId = useCallback(() => {
    setLoadingAccount(true);
    const storedAccountId = getAccountId();
    setAccountId(storedAccountId);
    setLoadingAccount(false);
  }, []);

  useEffect(() => {
    loadAccountId();
  }, [loadAccountId]);

  const handleRefresh = useCallback(() => {
    loadAccountId();
  }, [loadAccountId]);

  if (loadingAccount) {
    return (
      <QueryProvider>
        <div className={styles.container}>
          <Loading text="Carregando..." size="medium" />
        </div>
      </QueryProvider>
    );
  }

  if (!accountId) {
    return (
      <QueryProvider>
        <div className={styles.container}>
          <Card title="Extrato" variant="elevated" color="base">
            <Card.Section>
              <div style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                <Text
                  variant="subtitle"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: "var(--spacing-md)" }}
                >
                  Conta não identificada
                </Text>
                <Text variant="body" color="gray600" style={{ marginBottom: "var(--spacing-lg)" }}>
                  Não foi possível identificar a conta. Por favor, verifique se o accountId está
                  armazenado no localStorage.
                </Text>
                <Button variant="primary" onClick={handleRefresh} width="auto">
                  Atualizar Tela
                </Button>
              </div>
            </Card.Section>
          </Card>
        </div>
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <div className={styles.container}>
        <Statement accountId={accountId} />
      </div>
    </QueryProvider>
  );
}
