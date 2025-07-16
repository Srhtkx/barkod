import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stok Sayım Uygulaması (Sıfırdan)",
  description: "Tamamen kendi oluşturduğunuz bileşenlerle barkod okuma",
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
          /* Global sıfırlamalar ve temel stiller */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background-color: #f5f5f5;
            -webkit-user-select: none; /* iOS'ta metin seçimini engelle */
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none; /* iOS'ta uzun basma menüsünü engelle */
            line-height: 1.5;
            color: #333;
          }
          
          /* Buton stilleri */
          button {
            background-color: #3b82f6; /* Mavi */
            color: white;
            border: none;
            border-radius: 8px;
            padding: 12px 20px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease, transform 0.1s ease;
            -webkit-appearance: none; /* iOS'ta varsayılan buton stilini kaldır */
            touch-action: manipulation; /* Dokunma gecikmesini azalt */
            -webkit-tap-highlight-color: transparent; /* Dokunma vurgusunu kaldır */
          }
          
          button:hover {
            background-color: #2563eb; /* Koyu mavi */
          }
          
          button:active {
            transform: scale(0.98);
          }
          
          button:disabled {
            background-color: #9ca3af; /* Gri */
            cursor: not-allowed;
          }
          
          /* Input stilleri */
          input[type="text"],
          input[type="number"] {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb; /* Açık gri kenarlık */
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.2s ease;
            -webkit-appearance: none; /* iOS'ta varsayılan input stilini kaldır */
            -webkit-tap-highlight-color: transparent; /* Dokunma vurgusunu kaldır */
          }
          
          input[type="text"]:focus,
          input[type="number"]:focus {
            border-color: #3b82f6; /* Mavi odak */
          }
          
          /* Kart stilleri */
          .card {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          /* Flex yardımcıları */
          .flex { display: flex; }
          .flex-col { flex-direction: column; }
          .items-center { align-items: center; }
          .justify-center { justify-content: center; }
          .justify-between { justify-content: space-between; }
          .gap-2 { gap: 8px; }
          .gap-4 { gap: 16px; }
          .gap-6 { gap: 24px; }
          .flex-1 { flex: 1; }
          
          /* Metin yardımcıları */
          .text-center { text-align: center; }
          .text-sm { font-size: 14px; }
          .text-lg { font-size: 18px; }
          .text-xl { font-size: 20px; }
          .font-bold { font-weight: 700; }
          .font-semibold { font-weight: 600; }
          .text-gray-600 { color: #4b5563; }
          .text-red-600 { color: #dc2626; }
          .text-green-600 { color: #16a34a; }
          
          /* Boşluk yardımcıları */
          .mb-4 { margin-bottom: 16px; }
          .mt-4 { margin-top: 16px; }
          .p-4 { padding: 16px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .px-4 { padding-left: 16px; padding-right: 16px; }
          
          /* Kamera ve tarama çerçevesi animasyonları */
          @keyframes scan {
            0% { 
              transform: translateY(-60px);
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
            100% { 
              transform: translateY(60px);
              opacity: 0.3;
            }
          }
          
          .scan-line {
            position: absolute;
            width: 100%;
            height: 3px;
            background-color: #ef4444;
            animation: scan 2s ease-in-out infinite;
            box-shadow: 0 0 15px #ef4444;
          }

          /* iOS Safari video optimizasyonları */
          @supports (-webkit-touch-callout: none) {
            video {
              -webkit-playsinline: true;
            }
          }
          
          /* Video ayna efekti (arka kamera için) */
          video {
            -webkit-transform: scaleX(-1);
            transform: scaleX(-1);
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
