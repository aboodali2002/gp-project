import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "./_components/auth-context";
import { DarkModeProvider } from "./_components/dark-mode-provider";
import { HtmlAttributes } from "./_components/html-attributes";
import "../../styles/globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "CorporateQuota - Fair Equity Management",
  description: "Calculate and manage fair equity splits for startup founders",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Ensure locale is valid, fallback to 'en' if undefined
  const validLocale = locale && ['en', 'ar'].includes(locale) ? locale : 'en';
  const messages = await getMessages({ locale: validLocale });

  return (
    <NextIntlClientProvider messages={messages}>
      <HtmlAttributes />
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </NextIntlClientProvider>
  );
}
