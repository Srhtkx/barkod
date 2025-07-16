"use client";

import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function Scanner({
  onScan,
}: {
  onScan: (code: string) => void;
}) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false // verbose
    );

    scanner.render(
      (decodedText) => {
        scanner.clear().then(() => onScan(decodedText));
      },
      (error) => console.warn(error)
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="reader" className="w-full mx-auto" />;
}
