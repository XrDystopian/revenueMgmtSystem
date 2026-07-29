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
import { DateInput } from "@mantine/dates";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import {
  getPresenterExpenses,
  createPresenterExpense,
  updatePresenterExpense,
  deletePresenterExpense,
  getPresenters,
  PresenterExpense,
  PresenterExpenseForm,
  Presenter,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

const emptyForm: PresenterExpenseForm = {
  presenterId: null,
  amount: "",
  paymentDate: "",
};

export default function PresenterExpensesPage() {
  const [expenses, setExpenses] = useState<PresenterExpense[]>([]);
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<PresenterExpense | null>(null);
  const [form, setForm] = useState<PresenterExpenseForm>(emptyForm);

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

  async function refreshExpenses() {
    const data = await getPresenterExpenses();
    setExpenses(data);
  }

  function openAddModal() {
    setEditingExpense(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(expense: PresenterExpense) {
    setEditingExpense(expense);
    setForm({
      presenterId: expense.presenterId,
      amount: expense.amount ?? "",
      paymentDate: expense.paymentDate ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      if (editingExpense) {
        await updatePresenterExpense(editingExpense.expenseId, form);
        notifySuccess("Expense updated successfully");
      } else {
        await createPresenterExpense(form);
        notifySuccess("Expense created successfully");
      }

      setModalOpen(false);
      await refreshExpenses();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePresenterExpense(id);
      notifySuccess("Expense deleted successfully");
      await refreshExpenses();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function getPresenterName(id: number | null): string {
    if (id === null) return "—";
    return presenters.find((p) => p.presenterId === id)?.presenterName ?? "—";
  }

  const presenterOptions = presenters.map((p) => ({
    value: String(p.presenterId),
    label: p.presenterName ?? `Presenter ${p.presenterId}`,
  }));

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Presenter Expenses
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Expense
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
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {expenses.map((expense, index) => (
              <Table.Tr key={expense.expenseId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{getPresenterName(expense.presenterId)}</Table.Td>
                <Table.Td>{expense.amount}</Table.Td>
                <Table.Td>{expense.paymentDate}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(expense)}
                      aria-label="Edit expense"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(expense.expenseId)}
                      aria-label="Delete expense"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {expenses.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No expenses yet. Click &quot;Add Expense&quot; to create one.
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
        centered
      >
        <Select
          label="Presenter"
          placeholder="Select a presenter"
          data={presenterOptions}
          value={form.presenterId ? String(form.presenterId) : null}
          onChange={(value) =>
            setForm({ ...form, presenterId: value ? Number(value) : null })
          }
          clearable
          mb="md"
        />
        <NumberInput
          label="Amount"
          placeholder="e.g. 25000"
          value={form.amount ? Number(form.amount) : ""}
          onChange={(value) => setForm({ ...form, amount: value ? String(value) : "" })}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          min={0}
          mb="md"
        />
        <DateInput
          label="Payment Date"
          placeholder="Select payment date"
          value={form.paymentDate || null}
          onChange={(date) => setForm({ ...form, paymentDate: date ?? "" })}
          valueFormat="YYYY-MM-DD"
          mb="md"
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingExpense ? "Save Changes" : "Add Expense"}
        </Button>
      </Modal>
    </Container>
  );
}