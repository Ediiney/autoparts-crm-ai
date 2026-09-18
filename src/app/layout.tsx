import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "AutoParts CRM AI", description: "CRM inteligente para autopeças" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
