"use client";

import { useState, useEffect } from "react";
import { Table, Container, Title, Paper, Group, Button } from "@mantine/core";
import {
	getPresenterExpenses,
	getPresenters,
	PresenterExpense,
	Presenter,
} from "@/lib/api";
import { exportToCsv } from "@/lib/csv";
import { IconDownload } from "@tabler/icons-react";

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

	function handleExport() {
		const headers = ["No.", "Presenter", "Amount", "Payment Date"];

		const rows = expenses.map((expense, index) => [
			index + 1,
			getPresenterName(expense.presenterId),
			expense.amount,
			expense.paymentDate,
		]);

		exportToCsv("presenter-expenses.csv", headers, rows);
	}

	function getPresenterName(id: number | null): string {
		if (id === null) return "—";
		return (
			presenters.find((p) => p.presenterId === id)?.presenterName ?? "—"
		);
	}

	return (
		<Container size="md" py={60}>
			<Group justify="space-between" mb="xl">
				<Title order={2} fw={700}>
					Presenter Expenses
				</Title>
				<Button
					variant="light"
					leftSection={<IconDownload size={16} />}
					onClick={handleExport}
				>
					Export CSV
				</Button>
			</Group>

			<Paper withBorder shadow="sm" radius="md" p="md">
				<Table verticalSpacing="sm" highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th w={60}>#</Table.Th>
							<Table.Th>Presenter</Table.Th>
							<Table.Th>Amount</Table.Th>
							<Table.Th>Payment Date</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{expenses.map((expense, index) => (
							<Table.Tr key={expense.expenseId}>
								<Table.Td c="dimmed">{index + 1}</Table.Td>
								<Table.Td>
									{getPresenterName(expense.presenterId)}
								</Table.Td>
								<Table.Td>{expense.amount}</Table.Td>
								<Table.Td>{expense.paymentDate}</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>

				{expenses.length === 0 && (
					<Container py="xl" ta="center" c="dimmed">
						No presenter expenses recorded yet.
					</Container>
				)}
			</Paper>
		</Container>
	);
}
