import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stok Sayım Uygulaması",
  description: "Kamera ile barkod okuma ve manuel giriş ile stok sayımı",
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
      <head>
        <style>{`
          * {
            box-sizing: border-box;
          }
          
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: #f5f5f5;
          }
          
          button:hover {
            opacity: 0.9;
          }
          
          button:active {
            transform: scale(0.98);
          }
          
          input:focus {
            border-color: #3b82f6 !important;
          }
          
          @keyframes scan {
            0% { transform: translate(-50%, -50%) translateY(-40px); }
            100% { transform: translate(-50%, -50%) translateY(40px); }
          }
          
          @media (max-width: 480px) {
            body {
              font-size: 14px;
            }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
