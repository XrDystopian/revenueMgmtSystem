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
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import {
  getDailyLogs,
  createDailyLog,
  updateDailyLog,
  deleteDailyLog,
  getUssd,
  getPresenters,
  DailyLog,
  DailyLogForm,
  Ussd,
  Presenter,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [form, setForm] = useState<DailyLogForm>(emptyForm);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [logData, ussdData, presenterData] = await Promise.all([
        getDailyLogs(),
        getUssd(),
        getPresenters(),
      ]);
      if (isMounted) {
        setLogs(logData);
        setUssdCodes(ussdData);
        setPresenters(presenterData);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshLogs() {
    const data = await getDailyLogs();
    setLogs(data);
  }

  function openAddModal() {
    setEditingLog(null);
    setForm(emptyForm);
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
    setModalOpen(true);
  }

  async function handleSubmit() {
    const submission: DailyLogForm = {
      ...form,
      startTime: form.startTime ? `${form.startTime}:00` : "",
      endTime: form.endTime ? `${form.endTime}:00` : "",
    };

    try {
      if (editingLog) {
        await updateDailyLog(editingLog.logId, submission);
        notifySuccess("Daily log updated successfully");
      } else {
        await createDailyLog(submission);
        notifySuccess("Daily log created successfully");
      }

      setModalOpen(false);
      await refreshLogs();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteDailyLog(id);
      notifySuccess("Daily log deleted successfully");
      await refreshLogs();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function getUssdCode(id: number | null): string {
    if (id === null) return "—";
    return ussdCodes.find((u) => u.ussdId === id)?.ussdCode ?? "—";
  }

  function getPresenterName(id: number | null): string {
    if (id === null) return "—";
    return presenters.find((p) => p.presenterId === id)?.presenterName ?? "—";
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
    <Container size="lg" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Daily Logs
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Daily Log
        </Button>
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
                <Table.Td>{getPresenterName(log.presenterId)}</Table.Td>
                <Table.Td>{log.earnings}</Table.Td>
                <Table.Td>{log.winnerPayment}</Table.Td>
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
                      onClick={() => handleDelete(log.logId)}
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
            No daily logs yet. Click &quot;Add Daily Log&quot; to create one.
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
          onChange={(value) => setForm({ ...form, ussdId: value ? Number(value) : null })}
          clearable
          mb="md"
        />
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
          label="Earnings"
          placeholder="e.g. 15000"
          value={form.earnings ? Number(form.earnings) : ""}
          onChange={(value) => setForm({ ...form, earnings: value ? String(value) : "" })}
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
            setForm({ ...form, winnerPayment: value ? String(value) : "" })
          }
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          min={0}
          mb="md"
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
          onChange={(event) => setForm({ ...form, startTime: event.currentTarget.value })}
          mb="md"
        />
        <TimeInput
          label="End Time"
          value={form.endTime}
          onChange={(event) => setForm({ ...form, endTime: event.currentTarget.value })}
          mb="md"
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingLog ? "Save Changes" : "Add Daily Log"}
        </Button>
      </Modal>
    </Container>
  );
}