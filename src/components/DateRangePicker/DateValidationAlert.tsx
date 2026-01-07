import React, { useEffect, useState } from "react";
import { Text } from "@grupo10-pos-fiap/design-system";
import styles from "./DateValidationAlert.module.css";

interface DateValidationAlertProps {
  message: string | null;
  onDismiss?: () => void;
  duration?: number;
}

export function DateValidationAlert({
  message,
  onDismiss,
  duration = 500,
}: DateValidationAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, onDismiss]);

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div className={styles.alert} role="alert" aria-live="polite">
      <Text variant="caption" color="warning" className={styles.alertText}>
        {message}
      </Text>
    </div>
  );
}
