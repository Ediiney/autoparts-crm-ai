import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AutoParts CRM AI",
    template: "%s | AutoParts CRM AI",
  },
  description: "CRM inteligente para atendimento, catálogo e cotação de autopeças.",
  applicationName: "AutoParts CRM AI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
