import React from "react";
import { Input, IconButton } from "@grupo10-pos-fiap/design-system";
import styles from "./Search.module.css";

const MAX_SEARCH_LENGTH = 100;

interface SearchProps {
  value: string;
  onChange: (_value: string) => void;
  placeholder?: string;
}

function Search({ value, onChange, placeholder = "Buscar transações..." }: SearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Truncar se exceder limite
    const truncatedValue =
      inputValue.length > MAX_SEARCH_LENGTH ? inputValue.slice(0, MAX_SEARCH_LENGTH) : inputValue;
    onChange(truncatedValue);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={styles.search}>
      <div className={styles.inputWrapper}>
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          leadingIcon="Search"
          variant="outlined"
          status="neutral"
          width="100%"
          ariaLabel="Buscar transações"
          style={{ paddingRight: value ? "40px" : undefined }}
        />
        {value && (
          <div className={styles.clearButtonWrapper}>
            <IconButton
              icon="X"
              variant="transparent"
              size="small"
              onClick={handleClear}
              aria-label="Limpar busca"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(Search);
