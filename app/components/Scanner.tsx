"use client";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect } from "react";

export default function Scanner({
  onScan,
}: {
  onScan: (code: string) => void;
}) {
  useEffect(() => {
    const cameraIdOrConfig = async () => {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length) {
        // Arka kamerayı bul
        const backCamera = cameras.find((cam) =>
          cam.label.toLowerCase().includes("back")
        );
        return backCamera?.id || cameras[0].id;
      } else {
        alert("Kamera bulunamadı");
        return null;
      }
    };

    cameraIdOrConfig().then((cameraId) => {
      if (!cameraId) return;

      const html5QrCode = new Html5Qrcode("reader");

      html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 300, height: 100 },
          aspectRatio: 1.77, // landscape görünüm
        },
        (decodedText) => {
          html5QrCode.stop().then(() => {
            onScan(decodedText);
          });
        },
        (error) => {
          // Opsiyonel hata logu
        }
      );
    });

    return () => {
      Html5Qrcode.getCameras().then((cams) => {
        if (cams.length > 0) {
          const html5QrCode = new Html5Qrcode("reader");
          html5QrCode.stop().catch(() => {});
        }
      });
    };
  }, [onScan]);

  return <div id="reader" className="w-full mx-auto" />;
}
