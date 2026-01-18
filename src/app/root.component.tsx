import React, { useState, useEffect, useCallback } from "react";
import { Text, Loading, Button, Card } from "@grupo10-pos-fiap/design-system";
import { QueryProvider } from "@/providers/QueryProvider";
import { getAccountId } from "@/utils/accountStorage";
import Statement from "../Statement";
import styles from "./root.component.module.css";

export default function Root() {
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

  useEffect(() => {
    const handleAccountIdChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ accountId: string }>;
      const newAccountId = customEvent.detail?.accountId || getAccountId();
      if (newAccountId) {
        setAccountId((currentId) => {
          if (currentId !== newAccountId) {
            setLoadingAccount(false);
            return newAccountId;
          }
          return currentId;
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accountId") {
        const newAccountId = e.newValue || getAccountId();
        if (newAccountId) {
          setAccountId((currentId) => {
            if (currentId !== newAccountId) {
              setLoadingAccount(false);
              return newAccountId;
            }
            return currentId;
          });
        }
      }
    };

    window.addEventListener("accountIdChanged", handleAccountIdChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("accountIdChanged", handleAccountIdChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
          <Card title="Extrato" variant="elevated" color="white">
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
                <Button variant="primary" onClick={handleRefresh} width="90px">
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
