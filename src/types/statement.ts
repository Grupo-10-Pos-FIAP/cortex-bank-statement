export interface Transaction {
  id: string;
  accountId: string;
  type: "Credit" | "Debit";
  value: number;
  date: string;
  from?: string;
  to?: string;
  anexo?: string;
  urlAnexo?: string;
}

export interface Balance {
  value: number;
  yield?: number;
  yieldPercentage?: number;
}

export interface Account {
  id: string;
  type: string;
}

export type TransactionTypeFilter = "all" | "Credit" | "Debit";

export interface ValueRange {
  min?: number;
  max?: number;
}

export interface TransactionFilters {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  searchQuery: string;
  transactionType: TransactionTypeFilter;
  valueRange: ValueRange;
}

export const initialFilters: TransactionFilters = {
  dateRange: {
    startDate: null,
    endDate: null,
  },
  searchQuery: "",
  transactionType: "all",
  valueRange: {},
};

export type PaginationMode = "pagination" | "infinite-scroll";

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  mode: PaginationMode;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  mode: PaginationMode;
}

export const defaultPaginationConfig: PaginationConfig = {
  currentPage: 1,
  pageSize: 25,
  mode: "pagination",
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export interface StatementResponse {
  message: string;
  result: {
    transactions: Transaction[];
  };
}

export interface BalanceResponse {
  message: string;
  result: {
    balance: {
      value: number;
      yield?: number;
      yieldPercentage?: number;
    };
  };
}

export interface AccountResponse {
  message: string;
  result: {
    account: Account[];
    transactions: Transaction[];
    cards?: unknown[];
  };
}
