import React, { useState, useEffect } from "react";
import { Text, Loading } from "@grupo10-pos-fiap/design-system";
import { fetchAccount } from "@/api/statement.api";
import Statement from "../Statement";
import styles from "./root.component.module.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loadingAccount, setLoadingAccount] = useState<boolean>(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const accountData = await fetchAccount();

        if (accountData.result.account && accountData.result.account.length > 0) {
          setAccountId(accountData.result.account[0].id);
        }
      } catch (error) {
        // Error handling is done by the error boundary
      } finally {
        setLoadingAccount(false);
      }
    };

    loadAccount();
  }, []);

  if (loadingAccount) {
    return (
      <div className={styles.container}>
        <Loading text="Carregando..." size="medium" />
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
