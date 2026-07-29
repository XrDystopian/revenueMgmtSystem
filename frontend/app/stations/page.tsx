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
import { getStations, createStation, updateStation, deleteStation, Station } from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationName, setStationName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadStations() {
      const data = await getStations();
      if (isMounted) {
        setStations(data);
      }
    }

    loadStations();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshStations() {
    const data = await getStations();
    setStations(data);
  }

  function openAddModal() {
    setEditingStation(null);
    setStationName("");
    setModalOpen(true);
  }

  function openEditModal(station: Station) {
    setEditingStation(station);
    setStationName(station.stationName ?? "");
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (stationName.trim() === "") return;

    try {
      if (editingStation) {
        await updateStation(editingStation.stationId, stationName);
        notifySuccess("Station updated successfully");
      } else {
        await createStation(stationName);
        notifySuccess("Station created successfully");
      }

      setModalOpen(false);
      await refreshStations();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteStation(id);
      notifySuccess("Station deleted successfully");
      await refreshStations();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Stations
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Station
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>#</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stations.map((station, index) => (
              <Table.Tr key={station.stationId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{station.stationName}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(station)}
                      aria-label="Edit station"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(station.stationId)}
                      aria-label="Delete station"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {stations.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No stations yet. Click &quot;Add Station&quot; to create one.
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStation ? "Edit Station" : "Add Station"}
        centered
      >
        <TextInput
          label="Station name"
          placeholder="Enter station name"
          value={stationName}
          onChange={(event) => setStationName(event.currentTarget.value)}
          mb="md"
          data-autofocus
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingStation ? "Save Changes" : "Add Station"}
        </Button>
      </Modal>
    </Container>
  );
}