import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "¡Feliz Cumpleaños! 🎂",
  description: "Una sorpresa especial para tu día",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
