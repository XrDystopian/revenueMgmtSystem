"use client";

import { NavLink, Stack, Text, ActionIcon, Group, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Stack gap="xs" p="md">
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          Revenue Management
        </Text>
        <ActionIcon
          variant="light"
          onClick={() => toggleColorScheme()}
          aria-label="Toggle color scheme"
        >
          {colorScheme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </ActionIcon>
      </Group>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          leftSection={<item.icon size={18} />}
          active={pathname === item.href}
          variant="filled"
        />
      ))}
    </Stack>
  );
}