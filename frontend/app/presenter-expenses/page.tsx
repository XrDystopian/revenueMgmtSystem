"use client";

import { useState, useEffect } from "react";
import { TextInput, Button, Table, Container, Title, Group, Paper } from "@mantine/core";
import {
  IconDownload,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconSearch,
} from "@tabler/icons-react";
import { getPresenterExpenses, getPresenters, PresenterExpense, Presenter } from "@/lib/api";
import { exportToCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import { useSortableData } from "@/lib/useSortableData";
import { useSearch } from "@/lib/useSearch";

export default function PresenterExpensesPage() {
  const [expenses, setExpenses] = useState<PresenterExpense[]>([]);
  const [presenters, setPresenters] = useState<Presenter[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [expenseData, presenterData] = await Promise.all([
        getPresenterExpenses(),
        getPresenters(),
      ]);
      if (isMounted) {
        setExpenses(expenseData);
        setPresenters(presenterData);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  function getPresenterName(id: number | null): string {
    if (id === null) return "—";
    return presenters.find((p) => p.presenterId === id)?.presenterName ?? "—";
  }

  const { filteredData: searchedExpenses, searchTerm, setSearchTerm } = useSearch(
    expenses,
    (expense) =>
      [getPresenterName(expense.presenterId), expense.amount, expense.paymentDate]
        .filter(Boolean)
        .join(" ")
  );

  const {
    sortedData: sortedExpenses,
    sortKey,
    sortDirection,
    toggleSort,
  } = useSortableData(searchedExpenses, (expense, key) => {
    switch (key) {
      case "presenter":
        return getPresenterName(expense.presenterId);
      case "amount":
        return expense.amount ? parseFloat(expense.amount) : null;
      case "paymentDate":
        return expense.paymentDate;
      default:
        return null;
    }
  });

  function renderSortIcon(key: string) {
    if (sortKey !== key) return <IconSelector size={14} />;
    if (sortDirection === "asc") return <IconChevronUp size={14} />;
    return <IconChevronDown size={14} />;
  }

  function handleExport() {
    const headers = ["No.", "Presenter", "Amount", "Payment Date"];

    const rows = sortedExpenses.map((expense, index) => [
      index + 1,
      getPresenterName(expense.presenterId),
      expense.amount,
      expense.paymentDate,
    ]);

    exportToCsv("presenter-expenses.csv", headers, rows);
  }

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Presenter Expenses
        </Title>
        <Button variant="light" leftSection={<IconDownload size={16} />} onClick={handleExport}>
          Export CSV
        </Button>
      </Group>

      <TextInput
        placeholder="Search expenses..."
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        mb="md"
      />

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>No.</Table.Th>
              <Table.Th onClick={() => toggleSort("presenter")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Presenter {renderSortIcon("presenter")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("amount")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Amount {renderSortIcon("amount")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("paymentDate")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Payment Date {renderSortIcon("paymentDate")}</Group>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedExpenses.map((expense, index) => (
              <Table.Tr key={expense.expenseId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{getPresenterName(expense.presenterId)}</Table.Td>
                <Table.Td>{formatCurrency(expense.amount)}</Table.Td>
                <Table.Td>{expense.paymentDate}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {sortedExpenses.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            {expenses.length === 0
              ? "No presenter expenses recorded yet."
              : "No expenses match your search."}
          </Container>
        )}
      </Paper>
    </Container>
  );
}