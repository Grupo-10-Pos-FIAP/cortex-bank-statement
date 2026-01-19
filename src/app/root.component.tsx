import React, { useState, useEffect, useCallback } from "react";
import { Loading } from "@grupo10-pos-fiap/design-system";
import { QueryProvider } from "@/providers/QueryProvider";
import { getAccountId } from "@/utils/accountStorage";
import Statement from "../Statement";
import styles from "./root.component.module.css";
import InvalidAccountCard from "@/components/InvalidAccountCard";

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
    const updateAccountId = (newAccountId: string | null) => {
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

    const handleAccountIdChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ accountId: string }>;
      const newAccountId = customEvent.detail?.accountId || getAccountId();
      updateAccountId(newAccountId);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accountId") {
        const newAccountId = e.newValue || getAccountId();
        updateAccountId(newAccountId);
      }
    };

    window.addEventListener("accountIdChanged", handleAccountIdChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("accountIdChanged", handleAccountIdChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleRefreshAccount = useCallback(() => {
    window.location.reload();
  }, []);

  if (loadingAccount) {
    return (
      <QueryProvider>
        <QueryProvider>
          <div className={styles.container}>
            <Loading text="Carregando..." size="medium" />
          </div>
        </QueryProvider>
      </QueryProvider>
    );
  }

  if (!accountId) {
    return (
      <QueryProvider>
        <InvalidAccountCard handleClick={handleRefreshAccount} />
      </QueryProvider>
    );
  }

  return (
    <QueryProvider>
      <div className={styles.container}>
        <Statement accountId={accountId} onRefreshAccount={handleRefreshAccount} />
      </div>
    </QueryProvider>
  );
}
