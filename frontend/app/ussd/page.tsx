"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
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
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import {
  getUssd,
  createUssd,
  updateUssd,
  deleteUssd,
  getUssdTypes,
  Ussd,
  UssdType,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UssdPage() {
  const [ussdCodes, setUssdCodes] = useState<Ussd[]>([]);
  const [ussdTypes, setUssdTypes] = useState<UssdType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUssd, setEditingUssd] = useState<Ussd | null>(null);
  const [ussdCode, setUssdCode] = useState("");
  const [ussdTypeId, setUssdTypeId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [ussdData, ussdTypeData] = await Promise.all([getUssd(), getUssdTypes()]);
      if (isMounted) {
        setUssdCodes(ussdData);
        setUssdTypes(ussdTypeData);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshUssdCodes() {
    const data = await getUssd();
    setUssdCodes(data);
  }

  function openAddModal() {
    setEditingUssd(null);
    setUssdCode("");
    setUssdTypeId(null);
    setModalOpen(true);
  }

  function openEditModal(ussd: Ussd) {
    setEditingUssd(ussd);
    setUssdCode(ussd.ussdCode ?? "");
    setUssdTypeId(ussd.ussdTypeId ? String(ussd.ussdTypeId) : null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (ussdCode.trim() === "") return;

    const parsedUssdTypeId = ussdTypeId ? Number(ussdTypeId) : null;

    try {
      if (editingUssd) {
        await updateUssd(editingUssd.ussdId, ussdCode, parsedUssdTypeId);
        notifySuccess("USSD code updated successfully");
      } else {
        await createUssd(ussdCode, parsedUssdTypeId);
        notifySuccess("USSD code created successfully");
      }

      setModalOpen(false);
      await refreshUssdCodes();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteUssd(id);
      notifySuccess("USSD code deleted successfully");
      await refreshUssdCodes();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function getUssdTypeName(id: number | null): string {
    if (id === null) return "—";
    return ussdTypes.find((t) => t.ussdTypeId === id)?.ussdType ?? "—";
  }

  const ussdTypeOptions = ussdTypes.map((t) => ({
    value: String(t.ussdTypeId),
    label: t.ussdType ?? `Type ${t.ussdTypeId}`,
  }));

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          USSD Codes
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add USSD Code
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>#</Table.Th>
              <Table.Th>USSD Code</Table.Th>
              <Table.Th>USSD Type</Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ussdCodes.map((ussd, index) => (
              <Table.Tr key={ussd.ussdId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{ussd.ussdCode}</Table.Td>
                <Table.Td>{getUssdTypeName(ussd.ussdTypeId)}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(ussd)}
                      aria-label="Edit USSD code"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(ussd.ussdId)}
                      aria-label="Delete USSD code"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {ussdCodes.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No USSD codes yet. Click &quot;Add USSD Code&quot; to create one.
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUssd ? "Edit USSD Code" : "Add USSD Code"}
        centered
      >
        <TextInput
          label="USSD code"
          placeholder="e.g. *123#"
          value={ussdCode}
          onChange={(event) => setUssdCode(event.currentTarget.value)}
          mb="md"
          data-autofocus
        />
        <Select
          label="USSD Type"
          placeholder="Select a USSD type"
          data={ussdTypeOptions}
          value={ussdTypeId}
          onChange={setUssdTypeId}
          clearable
          mb="md"
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingUssd ? "Save Changes" : "Add USSD Code"}
        </Button>
      </Modal>
    </Container>
  );
}