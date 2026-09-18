import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: {
    default: "AutoParts CRM",
    template: "%s | AutoParts CRM",
  },
  description: "CRM para atendimento, catálogo, orçamento e pedidos de autopeças.",
  applicationName: "AutoParts CRM",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
