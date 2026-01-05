import React from "react";
import { Card } from "@grupo10-pos-fiap/design-system";
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  type?: "balance" | "transaction-list";
  itemsCount?: number;
}

function Skeleton({ type = "transaction-list", itemsCount = 5 }: SkeletonProps) {
  if (type === "balance") {
    return (
      <Card variant="elevated" color="base" className={styles.card}>
        <div className={styles.header}>
          <div className={styles.skeletonText} style={{ width: "80px", height: "20px" }} />
          <div className={styles.skeletonCircle} style={{ width: "24px", height: "24px" }} />
        </div>
        <Card.Section>
          <div
            className={styles.skeletonText}
            style={{ width: "200px", height: "40px", marginBottom: "8px" }}
          />
          <div className={styles.skeletonText} style={{ width: "150px", height: "16px" }} />
        </Card.Section>
      </Card>
    );
  }

  return (
    <div className={styles.transactionList}>
      {Array.from({ length: itemsCount }).map((_, index) => (
        <div key={index} className={styles.transactionItem}>
          <div className={styles.skeletonCircle} style={{ width: "40px", height: "40px" }} />
          <div className={styles.transactionDetails}>
            <div
              className={styles.skeletonText}
              style={{ width: "150px", height: "16px", marginBottom: "4px" }}
            />
            <div className={styles.skeletonText} style={{ width: "100px", height: "14px" }} />
          </div>
          <div className={styles.transactionRight}>
            <div
              className={styles.skeletonText}
              style={{ width: "100px", height: "16px", marginBottom: "4px" }}
            />
            <div className={styles.skeletonText} style={{ width: "80px", height: "14px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(Skeleton);
