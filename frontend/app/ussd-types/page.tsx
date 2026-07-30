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
import {
  getUssdTypes,
  createUssdType,
  updateUssdType,
  deleteUssdType,
  UssdType,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function UssdTypesPage() {
  const [ussdTypes, setUssdTypes] = useState<UssdType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUssdType, setEditingUssdType] = useState<UssdType | null>(null);
  const [ussdTypeName, setUssdTypeName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUssdTypes() {
      const data = await getUssdTypes();
      if (isMounted) {
        setUssdTypes(data);
      }
    }

    loadUssdTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshUssdTypes() {
    const data = await getUssdTypes();
    setUssdTypes(data);
  }

  function openAddModal() {
    setEditingUssdType(null);
    setUssdTypeName("");
    setModalOpen(true);
  }

  function openEditModal(ussdType: UssdType) {
    setEditingUssdType(ussdType);
    setUssdTypeName(ussdType.ussdType ?? "");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (ussdTypeName.trim() === "") return;

    try {
      if (editingUssdType) {
        await updateUssdType(editingUssdType.ussdTypeId, ussdTypeName);
        notifySuccess("USSD type updated successfully");
      } else {
        await createUssdType(ussdTypeName);
        notifySuccess("USSD type created successfully");
      }

      setModalOpen(false);
      await refreshUssdTypes();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteUssdType(id);
      notifySuccess("USSD type deleted successfully");
      await refreshUssdTypes();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          USSD Types
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add USSD Type
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>#</Table.Th>
              <Table.Th>USSD Type</Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ussdTypes.map((ussdType, index) => (
              <Table.Tr key={ussdType.ussdTypeId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{ussdType.ussdType}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(ussdType)}
                      aria-label="Edit USSD type"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(ussdType.ussdTypeId)}
                      aria-label="Delete USSD type"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {ussdTypes.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No USSD types yet. Click &quot;Add USSD Type&quot; to create one.
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUssdType ? "Edit USSD Type" : "Add USSD Type"}
        centered
      >
        <TextInput
          label="USSD type"
          placeholder="Enter USSD type"
          value={ussdTypeName}
          onChange={(event) => setUssdTypeName(event.currentTarget.value)}
          mb="md"
          data-autofocus
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingUssdType ? "Save Changes" : "Add USSD Type"}
        </Button>
      </Modal>
    </Container>
  );
}