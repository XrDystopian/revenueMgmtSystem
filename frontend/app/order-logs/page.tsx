"use client";

import { useState, useEffect } from "react";
import {
  NumberInput,
  Select,
  TextInput,
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
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconDownload,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconSearch,
} from "@tabler/icons-react";
import {
  getOrderLogs,
  createOrderLog,
  updateOrderLog,
  deleteOrderLog,
  getStations,
  OrderLog,
  OrderLogForm,
  Station,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";
import { exportToCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";
import { useSortableData } from "@/lib/useSortableData";
import { useSearch } from "@/lib/useSearch";

const emptyForm: OrderLogForm = {
  stationId: 0,
  amount: "",
  duration: 0,
  startDate: "",
  endDate: "",
  dailyOrderAmount: "",
};

export default function OrderLogPage() {
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderLog | null>(null);
  const [form, setForm] = useState<OrderLogForm>(emptyForm);

  const amountValue = parseFloat(form.amount);
  const dailyOrderAmount =
    !isNaN(amountValue) && form.duration > 0
      ? (amountValue / form.duration).toFixed(2)
      : "";

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [orderData, stationData] = await Promise.all([getOrderLogs(), getStations()]);
      if (isMounted) {
        setOrders(orderData);
        setStations(stationData);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshOrders() {
    const data = await getOrderLogs();
    setOrders(data);
  }

  function openAddModal() {
    setEditingOrder(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(order: OrderLog) {
    setEditingOrder(order);
    setForm({
      stationId: order.stationId ?? 0,
      amount: order.amount ?? "",
      duration: order.duration ?? 0,
      startDate: order.startDate ?? "",
      endDate: order.endDate ?? "",
      dailyOrderAmount: order.dailyOrderAmount ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.stationId) {
      notifyError("Station is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      notifyError("Amount must be greater than 0");
      return;
    }
    if (!form.duration || form.duration <= 0) {
      notifyError("Duration must be greater than 0");
      return;
    }
    if (!form.startDate) {
      notifyError("Start date is required");
      return;
    }
    if (!form.endDate) {
      notifyError("End date is required");
      return;
    }
    if (form.endDate < form.startDate) {
      notifyError("End date cannot be before start date");
      return;
    }

    const submission: OrderLogForm = { ...form, dailyOrderAmount };

    try {
      if (editingOrder) {
        await updateOrderLog(editingOrder.orderId, submission);
        notifySuccess("Order updated successfully");
      } else {
        await createOrderLog(submission);
        notifySuccess("Order created successfully");
      }

      setModalOpen(false);
      await refreshOrders();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteOrderLog(id);
      notifySuccess("Order deleted successfully");
      await refreshOrders();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function getStationName(id: number | null): string {
    if (id === null) return "—";
    return stations.find((s) => s.stationId === id)?.stationName ?? "—";
  }

  const stationOptions = stations.map((s) => ({
    value: String(s.stationId),
    label: s.stationName ?? `Station ${s.stationId}`,
  }));

  const { filteredData: searchedOrders, searchTerm, setSearchTerm } = useSearch(orders, (order) =>
    [
      getStationName(order.stationId),
      order.amount,
      order.duration,
      order.startDate,
      order.endDate,
      order.dailyOrderAmount,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const {
    sortedData: sortedOrders,
    sortKey,
    sortDirection,
    toggleSort,
  } = useSortableData(searchedOrders, (order, key) => {
    switch (key) {
      case "station":
        return getStationName(order.stationId);
      case "amount":
        return order.amount ? parseFloat(order.amount) : null;
      case "duration":
        return order.duration;
      case "startDate":
        return order.startDate;
      case "endDate":
        return order.endDate;
      case "dailyOrderAmount":
        return order.dailyOrderAmount ? parseFloat(order.dailyOrderAmount) : null;
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
    const headers = [
      "No.",
      "Station",
      "Amount",
      "Duration",
      "Start Date",
      "End Date",
      "Daily Order Amount",
    ];

    const rows = sortedOrders.map((order, index) => [
      index + 1,
      getStationName(order.stationId),
      order.amount,
      order.duration,
      order.startDate,
      order.endDate,
      order.dailyOrderAmount,
    ]);

    exportToCsv("order-logs.csv", headers, rows);
  }

  return (
    <Container size="lg" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Orders
        </Title>
        <Group gap="sm">
          <Button variant="light" leftSection={<IconDownload size={16} />} onClick={handleExport}>
            Export CSV
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
            Add Order
          </Button>
        </Group>
      </Group>

      <TextInput
        placeholder="Search orders..."
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
              <Table.Th onClick={() => toggleSort("station")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Station {renderSortIcon("station")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("amount")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Amount {renderSortIcon("amount")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("duration")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Duration {renderSortIcon("duration")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("startDate")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Start Date {renderSortIcon("startDate")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("endDate")} style={{ cursor: "pointer" }}>
                <Group gap={4}>End Date {renderSortIcon("endDate")}</Group>
              </Table.Th>
              <Table.Th onClick={() => toggleSort("dailyOrderAmount")} style={{ cursor: "pointer" }}>
                <Group gap={4}>Daily Order Amount {renderSortIcon("dailyOrderAmount")}</Group>
              </Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedOrders.map((order, index) => (
              <Table.Tr key={order.orderId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{getStationName(order.stationId)}</Table.Td>
                <Table.Td>{formatCurrency(order.amount)}</Table.Td>
                <Table.Td>{order.duration}</Table.Td>
                <Table.Td>{order.startDate}</Table.Td>
                <Table.Td>{order.endDate}</Table.Td>
                <Table.Td>{formatCurrency(order.dailyOrderAmount)}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(order)}
                      aria-label="Edit order"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(order.orderId)}
                      aria-label="Delete order"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {sortedOrders.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            {orders.length === 0
              ? 'No orders yet. Click "Add Order" to create one.'
              : "No orders match your search."}
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? "Edit Order" : "Add Order"}
        centered
        size="md"
      >
        <Select
          label="Station"
          placeholder="Select a station"
          data={stationOptions}
          value={form.stationId ? String(form.stationId) : null}
          onChange={(value) => setForm({ ...form, stationId: value ? Number(value) : 0 })}
          mb="md"
        />
        <NumberInput
          label="Amount"
          placeholder="e.g. 100000"
          value={form.amount ? Number(form.amount) : ""}
          onChange={(value) => setForm({ ...form, amount: value ? String(value) : "" })}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          min={0}
          mb="md"
        />
        <NumberInput
          label="Duration (days)"
          placeholder="e.g. 30"
          value={form.duration}
          onChange={(value) => setForm({ ...form, duration: Number(value) || 0 })}
          min={0}
          mb="md"
        />
        <DateInput
          label="Start Date"
          placeholder="Select start date"
          value={form.startDate || null}
          onChange={(date) => setForm({ ...form, startDate: date ?? "" })}
          valueFormat="YYYY-MM-DD"
          mb="md"
        />
        <DateInput
          label="End Date"
          placeholder="Select end date"
          value={form.endDate || null}
          onChange={(date) => setForm({ ...form, endDate: date ?? "" })}
          valueFormat="YYYY-MM-DD"
          mb="md"
        />
        <NumberInput
          label="Daily Order Amount"
          value={dailyOrderAmount ? Number(dailyOrderAmount) : ""}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          readOnly
          mb="md"
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingOrder ? "Save Changes" : "Add Order"}
        </Button>
      </Modal>
    </Container>
  );
}