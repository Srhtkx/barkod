/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

interface ScannerProps {
  onScan: (code: string) => void;
  onError: (message: string) => void;
}

export default function Scanner({ onScan, onError }: ScannerProps) {
  const scannerId = "reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
    }
    const html5QrCode = html5QrCodeRef.current;

    const startScanner = async () => {
      try {
        setIsScanning(true);
        await html5QrCode.start(
          { facingMode: "environment" }, // Arka kamera kullan
          {
            fps: 10, // Saniyedeki kare sayısı
            qrbox: { width: 280, height: 120 }, // Tarama kutusu boyutu
            aspectRatio: 1.77, // Video akışının en boy oranı (16:9)
            disableFlip: false, // html5-qrcode'un kendi aynalama düzeltmesini kullanmasına izin ver
          },
          (decodedText) => {
            console.log("Barkod okundu:", decodedText);
            onScan(decodedText);
            // Başarılı taramadan sonra durdur
            html5QrCode
              .stop()
              .then(() => {
                setIsScanning(false);
              })
              .catch((err) => {
                console.error("Scanner stop error:", err);
                onError("Tarayıcı durdurulurken hata oluştu.");
              });
          },
          (errorMessage) => {
            // Hata mesajlarını logla ama kullanıcıya gösterme (çok sık olabilir)
            // console.log("Scan error:", errorMessage);
          }
        );
        console.log("Scanner started successfully.");
      } catch (err: any) {
        setIsScanning(false);
        console.error("Scanner start error:", err);
        let userMessage = "Kamera başlatılamadı.";
        if (err.message.includes("NotAllowedError")) {
          userMessage =
            "Kamera izni reddedildi. Lütfen tarayıcı ayarlarınızdan kamera erişimine izin verin.";
        } else if (err.message.includes("NotFoundError")) {
          userMessage =
            "Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.";
        } else if (err.message.includes("NotReadableError")) {
          userMessage =
            "Kamera kullanımda. Başka uygulamaları kapatıp tekrar deneyin.";
        } else if (err.message.includes("ConstraintNotSatisfiedError")) {
          userMessage =
            "Kamera ayarları uyumsuz. Farklı bir kamera deneyin veya tarayıcınızı güncelleyin.";
        } else if (err.message.includes("SecureContextRequired")) {
          userMessage = "Kamera erişimi için HTTPS bağlantısı gereklidir.";
        }
        onError(userMessage);
      }
    };

    startScanner();

    return () => {
      // Bileşen unmount edildiğinde tarayıcıyı durdur
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            console.log("Scanner stopped on unmount.");
          })
          .catch((err) => {
            console.error("Scanner stop error on unmount:", err);
          });
      }
    };
  }, [onScan, onError]);

  return (
    <div className="card p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Barkod Tarayıcı
      </h2>
      <div id={scannerId} className="w-full mx-auto overflow-hidden rounded-lg">
        {/* html5-qrcode buraya video akışını yerleştirecek */}
      </div>
      {!isScanning && (
        <p className="text-center text-gray-600 mt-4">
          Kamera başlatılıyor veya bir hata oluştu.
        </p>
      )}
    </div>
  );
}
