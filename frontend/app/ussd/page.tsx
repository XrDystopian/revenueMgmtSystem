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
} from "@mantine/core";
import { IconPencil, IconTrash, IconPlus } from "@tabler/icons-react";
import { getUssd, createUssd, updateUssd, deleteUssd, Ussd } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UssdPage() {
  const [ussdCodes, setUssdCodes] = useState<Ussd[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUssd, setEditingUssd] = useState<Ussd | null>(null);
  const [ussdCode, setUssdCode] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUssdCodes() {
      const data = await getUssd();
      if (isMounted) {
        setUssdCodes(data);
      }
    }

    loadUssdCodes();

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
    setModalOpen(true);
  }

  function openEditModal(ussd: Ussd) {
    setEditingUssd(ussd);
    setUssdCode(ussd.ussdCode ?? "");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (ussdCode.trim() === "") return;

    try {
      if (editingUssd) {
        await updateUssd(editingUssd.ussdId, ussdCode);
        notifySuccess("USSD code updated successfully");
      } else {
        await createUssd(ussdCode);
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
        <Button onClick={handleSubmit} fullWidth>
          {editingUssd ? "Save Changes" : "Add USSD Code"}
        </Button>
      </Modal>
    </Container>
  );
}