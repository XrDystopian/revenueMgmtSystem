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
  getOrderLogs,
  createOrderLog,
  updateOrderLog,
  deleteOrderLog,
  getStations,
  getOrderType,
  OrderLog,
  OrderLogForm,
  Station,
  OrderType,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

const emptyForm: OrderLogForm = {
  stationId: 0,
  orderTypeId: 0,
  amount: "",
  duration: 0,
  startDate: "",
  endDate: "",
  dailyOrderAmount: "",
};

export default function OrderLogPage() {
  const [orders, setOrders] = useState<OrderLog[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
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
      const [orderData, stationData, orderTypeData] = await Promise.all([
        getOrderLogs(),
        getStations(),
        getOrderType(),
      ]);
      if (isMounted) {
        setOrders(orderData);
        setStations(stationData);
        setOrderTypes(orderTypeData);
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
      orderTypeId: order.orderTypeId ?? 0,
      amount: order.amount ?? "",
      duration: order.duration ?? 0,
      startDate: order.startDate ?? "",
      endDate: order.endDate ?? "",
      dailyOrderAmount: order.dailyOrderAmount ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
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

  function getOrderTypeName(id: number | null): string {
    if (id === null) return "—";
    return orderTypes.find((t) => t.orderTypeId === id)?.orderType ?? "—";
  }

  const stationOptions = stations.map((s) => ({
    value: String(s.stationId),
    label: s.stationName ?? `Station ${s.stationId}`,
  }));

  const orderTypeOptions = orderTypes.map((t) => ({
    value: String(t.orderTypeId),
    label: t.orderType ?? `Type ${t.orderTypeId}`,
  }));

  return (
    <Container size="lg" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Orders
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Order
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>#</Table.Th>
              <Table.Th>Station</Table.Th>
              <Table.Th>Order Type</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Daily Amount</Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders.map((order, index) => (
              <Table.Tr key={order.orderId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{getStationName(order.stationId)}</Table.Td>
                <Table.Td>{getOrderTypeName(order.orderTypeId)}</Table.Td>
                <Table.Td>{order.amount}</Table.Td>
                <Table.Td>{order.duration}</Table.Td>
                <Table.Td>{order.startDate}</Table.Td>
                <Table.Td>{order.endDate}</Table.Td>
                <Table.Td>{order.dailyOrderAmount}</Table.Td>
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

        {orders.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No orders yet. Click &quot;Add Order&quot; to create one.
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
        <Select
          label="Order Type"
          placeholder="Select an order type"
          data={orderTypeOptions}
          value={form.orderTypeId ? String(form.orderTypeId) : null}
          onChange={(value) => setForm({ ...form, orderTypeId: value ? Number(value) : 0 })}
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