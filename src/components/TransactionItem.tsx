import React from "react";
import { Text, Icon } from "@grupo10-pos-fiap/design-system";
import { Transaction } from "@/types/statement";
import { formatValue } from "@/utils/formatters";
import { formatDate } from "@/utils/dateUtils";
import styles from "./TransactionList.module.css";

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isCredit = transaction.type === "Credit";
  const transactionType = isCredit ? "Transferência recebida" : "Transferência efetuada";
  const personName = isCredit ? transaction.from : transaction.to;
  const displayValue = formatValue(Math.abs(transaction.value));
  const formattedDate = formatDate(transaction.date);

  return (
    <div className={styles.transactionItem}>
      <div className={styles.transactionIcon}>
        <Icon
          name={isCredit ? "ArrowDown" : "ArrowUp"}
          size="medium"
          color={isCredit ? "success" : "warning"}
        />
      </div>
      <div className={styles.transactionDetails}>
        <Text variant="body" weight="medium" className={styles.transactionType}>
          {transactionType}
        </Text>
        {personName && (
          <div className={styles.personName}>
            <Icon name="User" size="small" color="gray600" />
            <Text variant="caption" color="gray600">
              de {personName}
            </Text>
          </div>
        )}
      </div>
      <div className={styles.transactionRight}>
        <Text
          variant="body"
          weight="semibold"
          color={isCredit ? "success" : "error"}
          className={styles.transactionValue}
        >
          {isCredit ? "+" : "-"}R$ {displayValue}
        </Text>
        <div className={styles.transactionDate}>
          <Icon name="Calendar" size="small" color="gray600" />
          <Text variant="caption" color="gray600">
            {formattedDate}
          </Text>
        </div>
      </div>
    </div>
  );
}

export default React.memo(TransactionItem);
