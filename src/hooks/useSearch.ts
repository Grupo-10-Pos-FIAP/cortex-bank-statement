import { useState } from "react";
import { useDebounce } from "use-debounce";
import { DEBOUNCE_DELAY_SEARCH } from "@/constants";

export interface UseSearchReturn {
  searchQuery: string;
  debouncedQuery: string;
  setSearchQuery: (_query: string) => void;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [debouncedQuery] = useDebounce(searchQuery, DEBOUNCE_DELAY_SEARCH);

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
  };
}
