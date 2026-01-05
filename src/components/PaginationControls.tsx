import React from "react";
import { Button, Text, Dropdown } from "@grupo10-pos-fiap/design-system";
import { PaginationInfo, PAGE_SIZE_OPTIONS, PaginationMode } from "@/types/statement";
import styles from "./PaginationControls.module.css";

interface PaginationControlsProps {
  paginationInfo: PaginationInfo;
  onPageChange: (_page: number) => void;
  onPageSizeChange: (_size: number) => void;
  onModeChange: (_mode: PaginationMode) => void;
}

function PaginationControls({
  paginationInfo,
  onPageChange,
  onPageSizeChange,
  onModeChange,
}: PaginationControlsProps) {
  if (paginationInfo.totalItems === 0) {
    return null;
  }

  const startItem = (paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1;
  const endItem = Math.min(
    paginationInfo.currentPage * paginationInfo.pageSize,
    paginationInfo.totalItems
  );

  const handlePrevious = () => {
    if (paginationInfo.currentPage > 1) {
      onPageChange(paginationInfo.currentPage - 1);
    }
  };

  const handleNext = () => {
    if (paginationInfo.hasMore) {
      onPageChange(paginationInfo.currentPage + 1);
    }
  };

  return (
    <div className={styles.paginationControls}>
      <div className={styles.paginationInfo}>
        <Text variant="body" color="base">
          Mostrando {startItem} - {endItem} de {paginationInfo.totalItems} transações
        </Text>
      </div>

      <div className={styles.paginationActions}>
        <div className={styles.pageSizeSelector}>
          <Text variant="body" weight="medium" className={styles.label}>
            Itens por página:
          </Text>
          <Dropdown
            items={PAGE_SIZE_OPTIONS.map((size) => ({
              label: size.toString(),
              value: size.toString(),
              onClick: () => onPageSizeChange(size),
            }))}
            placeholder={paginationInfo.pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
            width="120px"
          />
        </div>

        {paginationInfo.mode === "pagination" && (
          <div className={styles.pageNavigation}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={paginationInfo.currentPage === 1}
              aria-label="Página anterior"
              width="auto"
            >
              Anterior
            </Button>
            <Text variant="body" className={styles.pageInfo}>
              Página {paginationInfo.currentPage} de {paginationInfo.totalPages || 1}
            </Text>
            <Button
              variant="outlined"
              onClick={handleNext}
              disabled={!paginationInfo.hasMore}
              aria-label="Próxima página"
              width="auto"
            >
              Próxima
            </Button>
          </div>
        )}

        <div className={styles.modeSelector}>
          <Text variant="body" weight="medium" className={styles.label}>
            Modo:
          </Text>
          <Dropdown
            items={[
              {
                label: "Paginação",
                value: "pagination",
                onClick: () => onModeChange("pagination"),
              },
              {
                label: "Scroll Infinito",
                value: "infinite-scroll",
                onClick: () => onModeChange("infinite-scroll"),
              },
            ]}
            placeholder={paginationInfo.mode === "pagination" ? "Paginação" : "Scroll Infinito"}
            onValueChange={(value) => onModeChange(value as PaginationMode)}
            width="150px"
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(PaginationControls);
