import type { Metadata } from "next";
import { Providers } from "@/provider/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FP Integrasi Sistem Kelompok F Kelas B",
  description: "Aplikasi Integrasi Sistem Kelompok F Kelas B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
