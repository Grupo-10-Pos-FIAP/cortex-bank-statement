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
  status?: "Pending" | "Done";
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

export type AccountInfo = Account;

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
  pagination?: {
    page: number;
    pageSize: number;
  };
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

export interface InfiniteScrollConfig {
  currentBatch: number;
  batchSize: number;
}

export interface InfiniteScrollInfo {
  currentBatch: number;
  batchSize: number;
  totalBatches: number;
  totalItems: number;
  hasMore: boolean;
  isEmpty: boolean;
  hasReachedEnd: boolean;
}

export const defaultInfiniteScrollConfig: InfiniteScrollConfig = {
  currentBatch: 1,
  batchSize: 25,
};

export const VIRTUALIZATION_THRESHOLD = 50;

export interface StatementResponse {
  message: string;
  result: {
    transactions: Transaction[];
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
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

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AccountResponse {
  message: string;
  result: {
    account: Account[];
  };
}
