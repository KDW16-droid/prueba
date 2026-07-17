import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Melius Time | Reloj checador",
  description:
    "Control de asistencia, autorizaciones e históricos para consultores Melius.",
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
