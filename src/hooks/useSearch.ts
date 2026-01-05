import { useState } from "react";
import { useDebounce } from "use-debounce";

interface UseSearchReturn {
  searchQuery: string;
  debouncedQuery: string;
  setSearchQuery: (_query: string) => void;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [debouncedQuery] = useDebounce(searchQuery, 300);

  return {
    searchQuery,
    debouncedQuery,
    setSearchQuery,
  };
}
