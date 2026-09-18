import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "AutoParts CRM AI",
    template: "%s | AutoParts CRM AI",
  },
  description: "CRM inteligente para atendimento, catálogo, orçamento e pedidos de autopeças.",
  applicationName: "AutoParts CRM AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={dmSans.className}>{children}</body>
    </html>
  );
}
