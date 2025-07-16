"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Home() {
  const [barkodlar, setBarkodlar] = useState<string[]>([]);
  const [sonuc, setSonuc] = useState<string | null>(null);
  const scannerRef = useRef(false);

  useEffect(() => {
    const onceki = JSON.parse(localStorage.getItem("barkodlar") || "[]");
    setBarkodlar(onceki);

    if (!scannerRef.current) {
      scannerRef.current = true;

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
          setSonuc(decodedText);

          const guncel = JSON.parse(localStorage.getItem("barkodlar") || "[]");
          if (!guncel.includes(decodedText)) {
            const yeniListe = [...guncel, decodedText];
            localStorage.setItem("barkodlar", JSON.stringify(yeniListe));
            setBarkodlar(yeniListe);

            // BACKEND'E GÖNDER (json'a yazsın)
            fetch("/api/kaydet", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ kod: decodedText }),
            });
          }
        },
        () => {}
      );
    }
  }, []);

  const handleSil = () => {
    localStorage.removeItem("barkodlar");
    setBarkodlar([]);
    setSonuc(null);
  };

  return (
    <main className="flex flex-col items-center p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">📷 Barkod Okuyucu</h1>
      <div id="reader" className="mb-4" style={{ width: 300 }} />

      {sonuc && (
        <p className="text-green-600 font-medium text-lg mb-2">
          Son Okunan: {sonuc}
        </p>
      )}

      {barkodlar.length > 0 && (
        <div className="w-full bg-white shadow-md rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">📦 Kaydedilen Barkodlar</h2>
            <button
              onClick={handleSil}
              className="text-red-600 border border-red-500 px-3 py-1 rounded hover:bg-red-50"
            >
              Tümünü Sil
            </button>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-800">
            {barkodlar.map((kod, index) => (
              <li key={index}>{kod}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
