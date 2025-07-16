import type React from "react";
import type { Metadata } from "next";
import "./globals.css"; // Yeni global CSS dosyamızı import ediyoruz

export const metadata: Metadata = {
  title: "Stok Sayım Uygulaması",
  description: "Modern arayüzlü barkod okuma uygulaması",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
