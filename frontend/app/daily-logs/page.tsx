"use client";

import { useState, useEffect } from "react";
import {
	NumberInput,
	Select,
	Button,
	Table,
	Container,
	Title,
	Modal,
	Group,
	Paper,
	ActionIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import {
	IconPencil,
	IconTrash,
	IconPlus,
	IconDownload,
} from "@tabler/icons-react";
import {
	getDailyLogs,
	createDailyLog,
	updateDailyLog,
	deleteDailyLog,
	getUssd,
	getPresenters,
	getPresenterExpenses,
	createPresenterExpense,
	updatePresenterExpense,
	deletePresenterExpense,
	DailyLog,
	DailyLogForm,
	Ussd,
	Presenter,
	PresenterExpense,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { exportToCsv } from "@/lib/csv";

const emptyForm: DailyLogForm = {
	ussdId: null,
	presenterId: null,
	earnings: "",
	winnerPayment: "",
	date: "",
	startTime: "",
	endTime: "",
};

export default function DailyLogsPage() {
	const [logs, setLogs] = useState<DailyLog[]>([]);
	const [ussdCodes, setUssdCodes] = useState<Ussd[]>([]);
	const [presenters, setPresenters] = useState<Presenter[]>([]);
	const [expenses, setExpenses] = useState<PresenterExpense[]>([]);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
	const [form, setForm] = useState<DailyLogForm>(emptyForm);
	const [expenseAmount, setExpenseAmount] = useState("");

	const [originalPresenterId, setOriginalPresenterId] = useState<
		number | null
	>(null);
	const [originalDate, setOriginalDate] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadData() {
			const [logData, ussdData, presenterData, expenseData] =
				await Promise.all([
					getDailyLogs(),
					getUssd(),
					getPresenters(),
					getPresenterExpenses(),
				]);
			if (isMounted) {
				setLogs(logData);
				setUssdCodes(ussdData);
				setPresenters(presenterData);
				setExpenses(expenseData);
			}
		}

		loadData();

		return () => {
			isMounted = false;
		};
	}, []);

	async function refreshAll() {
		const [logData, expenseData] = await Promise.all([
			getDailyLogs(),
			getPresenterExpenses(),
		]);
		setLogs(logData);
		setExpenses(expenseData);
	}

	function findExpense(presenterId: number | null, date: string | null) {
		if (presenterId === null || !date) return undefined;
		return expenses.find(
			(e) => e.presenterId === presenterId && e.paymentDate === date,
		);
	}

	function getExpenseAmountDisplay(
		presenterId: number | null,
		date: string | null,
	): string {
		const match = findExpense(presenterId, date);
		return match?.amount ?? "—";
	}

	function openAddModal() {
		setEditingLog(null);
		setForm(emptyForm);
		setExpenseAmount("");
		setOriginalPresenterId(null);
		setOriginalDate(null);
		setModalOpen(true);
	}

	function openEditModal(log: DailyLog) {
		setEditingLog(log);
		setForm({
			ussdId: log.ussdId,
			presenterId: log.presenterId,
			earnings: log.earnings ?? "",
			winnerPayment: log.winnerPayment ?? "",
			date: log.date ?? "",
			startTime: log.startTime ? log.startTime.slice(0, 5) : "",
			endTime: log.endTime ? log.endTime.slice(0, 5) : "",
		});

		const existingExpense = findExpense(log.presenterId, log.date);
		setExpenseAmount(existingExpense?.amount ?? "");
		setOriginalPresenterId(log.presenterId);
		setOriginalDate(log.date);

		setModalOpen(true);
	}

	async function syncPresenterExpense(
		presenterId: number | null,
		date: string,
		amount: string,
	) {
		const presenterOrDateChanged =
			originalPresenterId !== null &&
			originalDate !== null &&
			(originalPresenterId !== presenterId || originalDate !== date);

		if (presenterOrDateChanged) {
			const oldExpense = findExpense(originalPresenterId, originalDate);
			if (oldExpense) {
				await deletePresenterExpense(oldExpense.expenseId);
			}
		}

		if (presenterId === null || amount.trim() === "") {
			return;
		}

		const latestExpenses = await getPresenterExpenses();
		const existing = latestExpenses.find(
			(e) => e.presenterId === presenterId && e.paymentDate === date,
		);

		const expenseForm = { presenterId, amount, paymentDate: date };

		if (existing) {
			await updatePresenterExpense(existing.expenseId, expenseForm);
		} else {
			await createPresenterExpense(expenseForm);
		}
	}

	async function handleSubmit() {
		if (!form.ussdId) {
			notifyError("USSD code is required");
			return;
		}
		if (!form.presenterId) {
			notifyError("Presenter is required");
			return;
		}
		if (!form.earnings || Number(form.earnings) < 0) {
			notifyError("Earnings is required");
			return;
		}
		if (!form.winnerPayment || Number(form.winnerPayment) < 0) {
			notifyError("Winner payment is required");
			return;
		}
		if (!expenseAmount || Number(expenseAmount) <= 0) {
			notifyError("Presenter expense is required");
			return;
		}
		if (!form.date) {
			notifyError("Date is required");
			return;
		}
		if (!form.startTime) {
			notifyError("Start time is required");
			return;
		}
		if (!form.endTime) {
			notifyError("End time is required");
			return;
		}
		if (form.endTime <= form.startTime) {
			notifyError("End time must be after start time");
			return;
		}

		const submission: DailyLogForm = {
			...form,
			startTime: `${form.startTime}:00`,
			endTime: `${form.endTime}:00`,
		};

		try {
			if (editingLog) {
				await updateDailyLog(editingLog.logId, submission);
			} else {
				await createDailyLog(submission);
			}

			await syncPresenterExpense(
				form.presenterId,
				form.date,
				expenseAmount,
			);

			notifySuccess(
				editingLog
					? "Daily log updated successfully"
					: "Daily log created successfully",
			);
			setModalOpen(false);
			await refreshAll();
		} catch (error) {
			notifyError(
				error instanceof Error ? error.message : "Something went wrong",
			);
		}
	}

	async function handleDelete(log: DailyLog) {
		try {
			const match = findExpense(log.presenterId, log.date);
			if (match) {
				await deletePresenterExpense(match.expenseId);
			}

			await deleteDailyLog(log.logId);
			notifySuccess("Daily log deleted successfully");
			await refreshAll();
		} catch (error) {
			notifyError(
				error instanceof Error ? error.message : "Something went wrong",
			);
		}
	}

	function handleExport() {
		const headers = [
			"No.",
			"USSD",
			"Presenter",
			"Earnings",
			"Winner Payment",
			"Presenter Expense",
			"Date",
			"Start Time",
			"End Time",
		];

		const rows = logs.map((log, index) => [
			index + 1,
			getUssdCode(log.ussdId),
			getPresenterName(log.presenterId),
			log.earnings,
			log.winnerPayment,
			getExpenseAmountDisplay(log.presenterId, log.date),
			log.date,
			log.startTime,
			log.endTime,
		]);

		exportToCsv("daily-logs.csv", headers, rows);
	}

	function getUssdCode(id: number | null): string {
		if (id === null) return "—";
		return ussdCodes.find((u) => u.ussdId === id)?.ussdCode ?? "—";
	}

	function getPresenterName(id: number | null): string {
		if (id === null) return "—";
		return (
			presenters.find((p) => p.presenterId === id)?.presenterName ?? "—"
		);
	}

	const ussdOptions = ussdCodes.map((u) => ({
		value: String(u.ussdId),
		label: u.ussdCode ?? `USSD ${u.ussdId}`,
	}));

	const presenterOptions = presenters.map((p) => ({
		value: String(p.presenterId),
		label: p.presenterName ?? `Presenter ${p.presenterId}`,
	}));

	return (
		<Container size="xl" py={60}>
			<Group justify="space-between" mb="xl">
				<Title order={2} fw={700}>
					Daily Logs
				</Title>
				<Group gap="sm">
					<Button
						variant="light"
						leftSection={<IconDownload size={16} />}
						onClick={handleExport}
					>
						Export CSV
					</Button>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={openAddModal}
					>
						Add Daily Log
					</Button>
				</Group>
			</Group>

			<Paper withBorder shadow="sm" radius="md" p="md">
				<Table verticalSpacing="sm" highlightOnHover>
					<Table.Thead>
						<Table.Tr>
							<Table.Th w={60}>#</Table.Th>
							<Table.Th>USSD</Table.Th>
							<Table.Th>Presenter</Table.Th>
							<Table.Th>Earnings</Table.Th>
							<Table.Th>Winner Payment</Table.Th>
							<Table.Th>Presenter Expense</Table.Th>
							<Table.Th>Date</Table.Th>
							<Table.Th>Start</Table.Th>
							<Table.Th>End</Table.Th>
							<Table.Th w={120} ta="right">
								Actions
							</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{logs.map((log, index) => (
							<Table.Tr key={log.logId}>
								<Table.Td c="dimmed">{index + 1}</Table.Td>
								<Table.Td>{getUssdCode(log.ussdId)}</Table.Td>
								<Table.Td>
									{getPresenterName(log.presenterId)}
								</Table.Td>
								<Table.Td>{log.earnings}</Table.Td>
								<Table.Td>{log.winnerPayment}</Table.Td>
								<Table.Td>
									{getExpenseAmountDisplay(
										log.presenterId,
										log.date,
									)}
								</Table.Td>
								<Table.Td>{log.date}</Table.Td>
								<Table.Td>{log.startTime}</Table.Td>
								<Table.Td>{log.endTime}</Table.Td>
								<Table.Td>
									<Group gap="xs" justify="flex-end">
										<ActionIcon
											variant="light"
											color="blue"
											onClick={() => openEditModal(log)}
											aria-label="Edit daily log"
										>
											<IconPencil size={16} />
										</ActionIcon>
										<ActionIcon
											variant="light"
											color="red"
											onClick={() => handleDelete(log)}
											aria-label="Delete daily log"
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Group>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>

				{logs.length === 0 && (
					<Container py="xl" ta="center" c="dimmed">
						No daily logs yet. Click &quot;Add Daily Log&quot; to
						create one.
					</Container>
				)}
			</Paper>

			<Modal
				opened={modalOpen}
				onClose={() => setModalOpen(false)}
				title={editingLog ? "Edit Daily Log" : "Add Daily Log"}
				centered
				size="md"
			>
				<Select
					label="USSD Code"
					placeholder="Select a USSD code"
					data={ussdOptions}
					value={form.ussdId ? String(form.ussdId) : null}
					onChange={(value) =>
						setForm({
							...form,
							ussdId: value ? Number(value) : null,
						})
					}
					mb="md"
				/>
				<Select
					label="Presenter"
					placeholder="Select a presenter"
					data={presenterOptions}
					value={form.presenterId ? String(form.presenterId) : null}
					onChange={(value) =>
						setForm({
							...form,
							presenterId: value ? Number(value) : null,
						})
					}
					mb="md"
				/>
				<NumberInput
					label="Earnings"
					placeholder="e.g. 15000"
					value={form.earnings ? Number(form.earnings) : ""}
					onChange={(value) =>
						setForm({
							...form,
							earnings: value ? String(value) : "",
						})
					}
					thousandSeparator=","
					decimalScale={2}
					fixedDecimalScale
					min={0}
					mb="md"
				/>
				<NumberInput
					label="Winner Payment"
					placeholder="e.g. 3000"
					value={form.winnerPayment ? Number(form.winnerPayment) : ""}
					onChange={(value) =>
						setForm({
							...form,
							winnerPayment: value ? String(value) : "",
						})
					}
					thousandSeparator=","
					decimalScale={2}
					fixedDecimalScale
					min={0}
					mb="md"
				/>
				<NumberInput
					label="Presenter Expense"
					placeholder="e.g. 2000"
					value={expenseAmount ? Number(expenseAmount) : ""}
					onChange={(value) =>
						setExpenseAmount(value ? String(value) : "")
					}
					thousandSeparator=","
					decimalScale={2}
					fixedDecimalScale
					min={0}
					mb="md"
					disabled={!form.presenterId}
					description={
						!form.presenterId
							? "Select a presenter first"
							: undefined
					}
				/>
				<DateInput
					label="Date"
					placeholder="Select date"
					value={form.date || null}
					onChange={(date) => setForm({ ...form, date: date ?? "" })}
					valueFormat="YYYY-MM-DD"
					mb="md"
				/>
				<TimeInput
					label="Start Time"
					value={form.startTime}
					onChange={(event) =>
						setForm({
							...form,
							startTime: event.currentTarget.value,
						})
					}
					mb="md"
				/>
				<TimeInput
					label="End Time"
					value={form.endTime}
					onChange={(event) =>
						setForm({ ...form, endTime: event.currentTarget.value })
					}
					mb="md"
				/>
				<Button onClick={handleSubmit} fullWidth>
					{editingLog ? "Save Changes" : "Add Daily Log"}
				</Button>
			</Modal>
		</Container>
	);
}
