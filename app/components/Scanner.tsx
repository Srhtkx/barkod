"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";

export default function Scanner({
  onScan,
}: {
  onScan: (code: string) => void;
}) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");

    html5QrCode.start(
      { facingMode: "environment" }, // ✅ direkt arka kamerayı seçiyoruz
      {
        fps: 10,
        qrbox: { width: 300, height: 100 },
        aspectRatio: 1.77,
      },
      (decodedText) => {
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        });
      },
      (error) => {
        // okuma hatası, isteğe bağlı log
      }
    );

    return () => {
      html5QrCode.stop().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" className="w-full mx-auto" />;
}
