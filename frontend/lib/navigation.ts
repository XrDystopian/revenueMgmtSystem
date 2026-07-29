import {
  IconBuildingBroadcastTower,
  IconCategory,
  IconDeviceMobile,
  IconMicrophone,
  IconReceipt2,
  IconCash,
  IconClipboardList,
} from "@tabler/icons-react";

export const navItems = [
  { label: "Stations", href: "/stations", icon: IconBuildingBroadcastTower },
  { label: "Order Types", href: "/order-types", icon: IconCategory },
  { label: "USSD Codes", href: "/ussd", icon: IconDeviceMobile },
  { label: "Presenters", href: "/presenters", icon: IconMicrophone },
  { label: "Orders", href: "/orders", icon: IconReceipt2 },
  { label: "Presenter Expenses", href: "/presenter-expenses", icon: IconCash },
  { label: "Daily Logs", href: "/daily-logs", icon: IconClipboardList },
];