"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [kameralar, setKameralar] = useState<{ id: string; label: string }[]>(
    []
  );
  const [secilenKameraId, setSecilenKameraId] = useState<string | null>(null);
  const [barkodlar, setBarkodlar] = useState<string[]>([]);
  const [sonuc, setSonuc] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const onceki = JSON.parse(localStorage.getItem("barkodlar") || "[]");
    setBarkodlar(onceki);

    Html5Qrcode.getCameras().then((devices) => {
      setKameralar(devices);
      const backCam = devices.find((d) =>
        d.label.toLowerCase().includes("back")
      );
      setSecilenKameraId(backCam?.id || devices[0]?.id || null);
    });
  }, []);

  useEffect(() => {
    if (secilenKameraId) {
      if (qrRef.current) {
        qrRef.current.stop().then(() => qrRef.current!.clear());
      }

      const qr = new Html5Qrcode("reader");
      qrRef.current = qr;

      qr.start(
        secilenKameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setSonuc(decodedText);

          const mevcut = JSON.parse(localStorage.getItem("barkodlar") || "[]");

          if (!mevcut.includes(decodedText)) {
            const yeni = [...mevcut, decodedText];
            localStorage.setItem("barkodlar", JSON.stringify(yeni));
            setBarkodlar(yeni);

            fetch("/api/kaydet", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ kod: decodedText }),
            });
          }
        },
        () => {}
      );
    }
  }, [secilenKameraId]);

  const handleSil = () => {
    localStorage.removeItem("barkodlar");
    setBarkodlar([]);
    setSonuc(null);
  };

  return (
    <main className="flex flex-col items-center p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📷 Barkod Okuyucu</h1>

      <div className="mb-4">
        <label className="text-sm">Kamera Seç:</label>
        <select
          onChange={(e) => setSecilenKameraId(e.target.value)}
          value={secilenKameraId || ""}
          className="border p-2 ml-2"
        >
          {kameralar.map((kamera) => (
            <option key={kamera.id} value={kamera.id}>
              {kamera.label || "Kamera"}
            </option>
          ))}
        </select>
      </div>

      <div id="reader" style={{ width: 300 }} />

      {sonuc && (
        <p className="text-green-600 font-medium text-lg mt-2">
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
