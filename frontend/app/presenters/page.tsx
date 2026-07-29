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
  getPresenters,
  createPresenter,
  updatePresenter,
  deletePresenter,
  getStations,
  Presenter,
  Station,
} from "@/lib/api";
import { notifySuccess, notifyError } from "@/lib/notify";

export default function PresentersPage() {
  const [presenters, setPresenters] = useState<Presenter[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPresenter, setEditingPresenter] = useState<Presenter | null>(null);
  const [presenterName, setPresenterName] = useState("");
  const [stationId, setStationId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [presenterData, stationData] = await Promise.all([
        getPresenters(),
        getStations(),
      ]);
      if (isMounted) {
        setPresenters(presenterData);
        setStations(stationData);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshPresenters() {
    const data = await getPresenters();
    setPresenters(data);
  }

  function openAddModal() {
    setEditingPresenter(null);
    setPresenterName("");
    setStationId(null);
    setModalOpen(true);
  }

  function openEditModal(presenter: Presenter) {
    setEditingPresenter(presenter);
    setPresenterName(presenter.presenterName ?? "");
    setStationId(presenter.stationId ? String(presenter.stationId) : null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (presenterName.trim() === "") return;

    const parsedStationId = stationId ? Number(stationId) : null;

    try {
      if (editingPresenter) {
        await updatePresenter(editingPresenter.presenterId, presenterName, parsedStationId);
        notifySuccess("Presenter updated successfully");
      } else {
        await createPresenter(presenterName, parsedStationId);
        notifySuccess("Presenter created successfully");
      }

      setModalOpen(false);
      await refreshPresenters();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deletePresenter(id);
      notifySuccess("Presenter deleted successfully");
      await refreshPresenters();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  function getStationName(id: number | null): string {
    if (id === null) return "—";
    const station = stations.find((s) => s.stationId === id);
    return station?.stationName ?? "—";
  }

  const stationOptions = stations.map((station) => ({
    value: String(station.stationId),
    label: station.stationName ?? `Station ${station.stationId}`,
  }));

  return (
    <Container size="md" py={60}>
      <Group justify="space-between" mb="xl">
        <Title order={2} fw={700}>
          Presenters
        </Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openAddModal}>
          Add Presenter
        </Button>
      </Group>

      <Paper withBorder shadow="sm" radius="md" p="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>#</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Station</Table.Th>
              <Table.Th w={120} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {presenters.map((presenter, index) => (
              <Table.Tr key={presenter.presenterId}>
                <Table.Td c="dimmed">{index + 1}</Table.Td>
                <Table.Td>{presenter.presenterName}</Table.Td>
                <Table.Td>{getStationName(presenter.stationId)}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEditModal(presenter)}
                      aria-label="Edit presenter"
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(presenter.presenterId)}
                      aria-label="Delete presenter"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {presenters.length === 0 && (
          <Container py="xl" ta="center" c="dimmed">
            No presenters yet. Click &quot;Add Presenter&quot; to create one.
          </Container>
        )}
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPresenter ? "Edit Presenter" : "Add Presenter"}
        centered
      >
        <TextInput
          label="Presenter name"
          placeholder="Enter presenter name"
          value={presenterName}
          onChange={(event) => setPresenterName(event.currentTarget.value)}
          mb="md"
          data-autofocus
        />
        <Select
          label="Station"
          placeholder="Select a station"
          data={stationOptions}
          value={stationId}
          onChange={setStationId}
          clearable
          mb="md"
        />
        <Button onClick={handleSubmit} fullWidth>
          {editingPresenter ? "Save Changes" : "Add Presenter"}
        </Button>
      </Modal>
    </Container>
  );
}