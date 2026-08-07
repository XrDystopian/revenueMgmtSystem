import { useState, useMemo } from "react";

export function useSearch<T>(data: T[], getSearchableText: (item: T) => string) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((item) => getSearchableText(item).toLowerCase().includes(lower));
  }, [data, searchTerm, getSearchableText]);

  return { filteredData, searchTerm, setSearchTerm };
}