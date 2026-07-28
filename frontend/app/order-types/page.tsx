"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Table,
  Container,
  Title,
  Modal,
  Group,
  Paper,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import {
  getOrderType,
  createOrderType,
  updateOrderType,
  deleteOrderType,
  OrderType,
} from "@/lib/api";

export default function OrderTypesPage() {
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrderType, setEditingOrderType] = useState<OrderType | null>(null);
  const [orderTypeName, setOrderTypeName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrderTypes() {
      const data = await getOrderType();
      if (isMounted) {
        setOrderTypes(data);
      }
    }

    loadOrderTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshOrderTypes() {
    const data = await getOrderType();
    setOrderTypes(data);
  }

  function openAddModal() {
    setEditingOrderType(null);
    setOrderTypeName("");
    setModalOpen(true);
  }

  function openEditModal(orderType: OrderType) {
    setEditingOrderType(orderType);
    setOrderTypeName(orderType.orderType ?? "");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (orderTypeName.trim() === "") return;

    if (editingOrderType) {
      await updateOrderType(editingOrderType.orderTypeId, orderTypeName);
    } else {
      await createOrderType(orderTypeName);
    }

    setModalOpen(false);
    await refreshOrderTypes();
  }

  async function handleDelete(id: number) {
    await deleteOrderType(id);
    await refreshOrderTypes();
  }

  return (
    <Box bg="gray.0" mih="100vh" py={60}>
      <Container size="md">
        <Group justify="space-between" mb="xl">
          <Title order={2} fw={700}>
            Order Types
          </Title>
          <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
            Add Order Type
          </Button>
        </Group>

        <Paper withBorder shadow="sm" radius="md" p="md">
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={60}>#</Table.Th>
                <Table.Th>Order Type</Table.Th>
                <Table.Th w={120} ta="right">
                  Actions
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {orderTypes.map((orderType, index) => (
                <Table.Tr key={orderType.orderTypeId}>
                  <Table.Td c="dimmed">{index + 1}</Table.Td>
                  <Table.Td>{orderType.orderType}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => openEditModal(orderType)}
                        aria-label="Edit order type"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => handleDelete(orderType.orderTypeId)}
                        aria-label="Delete order type"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {orderTypes.length === 0 && (
            <Box py="xl" ta="center" c="dimmed">
              No order types yet. Click &quot;Add Order Type&quot; to create one.
            </Box>
          )}
        </Paper>

        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingOrderType ? "Edit Order Type" : "Add Order Type"}
          centered
        >
          <TextInput
            label="Order type"
            placeholder="Enter order type"
            value={orderTypeName}
            onChange={(event) => setOrderTypeName(event.currentTarget.value)}
            mb="md"
            data-autofocus
          />
          <Button onClick={handleSubmit} fullWidth>
            {editingOrderType ? "Save Changes" : "Add Order Type"}
          </Button>
        </Modal>
      </Container>
    </Box>
  );
}