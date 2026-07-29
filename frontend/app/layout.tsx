import type { Metadata } from "next";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ColorSchemeScript, MantineProvider, Flex, Box, ScrollArea } from '@mantine/core';
import { theme } from '../theme';
import { Notifications } from '@mantine/notifications';
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revenue Management",
  description: "Internal revenue management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className="min-h-full flex flex-col">
        <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-right" />
          <Flex mih="100vh">
            <Box
              w={260}
              style={{ borderRight: "1px solid var(--mantine-color-gray-3)", flexShrink: 0 }}
            >
              <ScrollArea h="100vh">
                <Sidebar />
              </ScrollArea>
            </Box>
            <Box flex={1} p="xl" style={{ overflowY: "auto" }}>
              {children}
            </Box>
          </Flex>
        </MantineProvider>
      </body>
    </html>
  );
}