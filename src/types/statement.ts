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

export const VIRTUALIZATION_THRESHOLD = 50;

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface StatementResponse {
  message: string;
  result: {
    transactions: Transaction[];
    pagination?: Pagination;
  };
}
