import type { Metadata } from "next";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ColorSchemeScript, MantineProvider, Flex, Box, ScrollArea } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

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
          <Notifications position="bottom-right" />
          <Flex direction="column" mih="100vh">
            <Box h={64} style={{ flexShrink: 0 }}>
              <Header />
            </Box>
            <Flex flex={1} style={{ minHeight: 0 }}>
              <Box
                w={260}
                style={{ borderRight: "1px solid var(--mantine-color-gray-3)", flexShrink: 0 }}
              >
                <ScrollArea h="100%">
                  <Sidebar />
                </ScrollArea>
              </Box>
              <Box flex={1} p="xs" style={{ overflowY: "auto" }}>
                {children}
              </Box>
            </Flex>
          </Flex>
        </MantineProvider>
      </body>
    </html>
  );
}