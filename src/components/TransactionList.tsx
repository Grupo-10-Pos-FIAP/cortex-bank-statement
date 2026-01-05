import React, { useMemo, useRef } from "react";
import { Text, Loading } from "@grupo10-pos-fiap/design-system";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInView } from "react-intersection-observer";
import { Transaction } from "@/types/statement";
import { AppError } from "@/utils/errorHandler";
import TransactionItem from "./TransactionItem";
import ErrorMessage from "./ErrorMessage";
import styles from "./TransactionList.module.css";

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  error?: AppError | null;
  mode?: "pagination" | "infinite-scroll";
  onLoadMore?: () => void;
  onRetry?: () => void;
}

function TransactionList({
  transactions,
  loading = false,
  error = null,
  mode = "pagination",
  onLoadMore,
  onRetry,
}: TransactionListProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  const shouldUseVirtualization = useMemo(() => {
    return transactions.length > 50;
  }, [transactions.length]);

  React.useEffect(() => {
    if (inView && mode === "infinite-scroll" && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [inView, mode, loading, onLoadMore]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  if (loading && transactions.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loading text="Carregando transações..." size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage error={error} onRetry={onRetry} title="Erro ao carregar transações" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Text variant="body" color="gray600">
          Nenhuma transação encontrada
        </Text>
      </div>
    );
  }

  if (shouldUseVirtualization) {
    return (
      <>
        <div
          ref={parentRef}
          style={{
            height: 600,
            overflow: "auto",
            position: "relative",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const transaction = transactions[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TransactionItem transaction={transaction} />
                </div>
              );
            })}
          </div>
        </div>

        {mode === "infinite-scroll" && (
          <div ref={ref} className={styles.infiniteScrollTrigger}>
            {loading && <Loading text="Carregando mais transações..." size="small" />}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={styles.transactionList}>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </div>

      {mode === "infinite-scroll" && (
        <div ref={ref} className={styles.infiniteScrollTrigger}>
          {loading && <Loading text="Carregando mais transações..." size="small" />}
        </div>
      )}
    </>
  );
}

export default React.memo(TransactionList);
