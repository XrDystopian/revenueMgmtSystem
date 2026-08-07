"use client";

import { NavLink, Stack, Divider } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <Stack gap="xs" p="md">
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