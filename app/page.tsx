"use client";

import { Html5Qrcode, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import { useEffect, useState } from "react";

export default function Home() {
  const [barkodlar, setBarkodlar] = useState<string[]>([]);
  const [sonuc, setSonuc] = useState<string | null>(null);

  useEffect(() => {
    const onceki = JSON.parse(localStorage.getItem("barkodlar") || "[]");
    setBarkodlar(onceki);

    const html5QrCode = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then((devices) => {
      const arkaKamera = devices.find((d) =>
        d.label.toLowerCase().includes("back")
      );

      const kameraId = arkaKamera ? arkaKamera.id : devices[0].id;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };

      html5QrCode
        .start(
          kameraId,
          config,
          (decodedText) => {
            setSonuc(decodedText);

            const guncel = JSON.parse(
              localStorage.getItem("barkodlar") || "[]"
            );

            if (!guncel.includes(decodedText)) {
              const yeniListe = [...guncel, decodedText];
              localStorage.setItem("barkodlar", JSON.stringify(yeniListe));
              setBarkodlar(yeniListe);

              fetch("/api/kaydet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kod: decodedText }),
              });
            }
          },
          (error) => {}
        )
        .then(() => {
          // Kamera açıldıktan sonra terslik varsa düzelt
          setTimeout(() => {
            const video = document.querySelector(
              "#reader video"
            ) as HTMLVideoElement;
            if (video) {
              video.style.transform = "scaleX(1)"; // Ayna düzeltmesi
            }
          }, 1000);
        });
    });
  }, []);

  const handleSil = () => {
    localStorage.removeItem("barkodlar");
    setBarkodlar([]);
    setSonuc(null);
  };

  return (
    <main className="flex flex-col items-center p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📷 Barkod Okuyucu</h1>
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
