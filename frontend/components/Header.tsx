"use client";

import { Group, Text, ActionIcon, Avatar, useMantineColorScheme, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function Header() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group
      justify="space-between"
      h="100%"
      px="xl"
      style={{
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Text size="lg" fw={800} tt="uppercase" style={{ letterSpacing: "0.5px" }}>
        Revenue Management System
      </Text>

      <Group gap="sm">
        <Tooltip label="Switch theme">
	        <ActionIcon
	          variant="light"
	          size="lg"
	          onClick={() => toggleColorScheme()}
	          aria-label="Toggle color scheme"
	        >
	          {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
	        </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
