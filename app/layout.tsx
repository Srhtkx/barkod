import type React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stok Sayım Uygulaması",
  description: "HTTPS rehberi ile barkod okuma",
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
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
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
          
          /* Mobil optimizasyonları */
          @media (max-width: 480px) {
            body {
              font-size: 14px;
            }
            
            input {
              font-size: 16px !important; /* iOS zoom engellemesi */
              -webkit-appearance: none;
            }
            
            button {
              -webkit-appearance: none;
            }
          }
          
          /* Touch optimizasyonları */
          button {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          
          input {
            -webkit-tap-highlight-color: transparent;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
