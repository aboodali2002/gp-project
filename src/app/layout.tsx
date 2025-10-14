import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "./_components/auth-context";

export const metadata: Metadata = {
  title: "CorporateQuota - Fair Equity Management",
  description: "Calculate and manage fair equity splits for startup founders based on roles and major tasks across stages",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Set initial attributes before React hydration
              (function() {
                const path = window.location.pathname;
                const locale = path.startsWith('/ar') ? 'ar' : 'en';
                document.documentElement.lang = locale;
                document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
              })();
            `,
          }}
        />
      </head>
      <body>
        <TRPCReactProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
