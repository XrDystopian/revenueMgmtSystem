import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc" | null;

export function useSortableData<T>(data: T[], getValue: (item: T, key: string) => string | number | null) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else if (sortDirection === "asc") {
      setSortDirection("desc");
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = getValue(a, sortKey);
      const bVal = getValue(b, sortKey);

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection, getValue]);

  return { sortedData, sortKey, sortDirection, toggleSort };
}