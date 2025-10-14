"use client";

import { DarkModeProvider } from "../[locale]/_components/dark-mode-provider";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  );
}
