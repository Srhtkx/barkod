"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera } from "lucide-react";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onBarcodeScanned,
  onClose,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Arka kamera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsLoading(false);

      // Barkod tarama işlemini başlat
      setTimeout(() => {
        scanForBarcode();
      }, 1000);
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
      setError("Kamera erişimi reddedildi veya mevcut değil");
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const scanForBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context || video.videoWidth === 0) {
      setTimeout(scanForBarcode, 100);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Basit barkod simülasyonu - gerçek uygulamada ZXing veya QuaggaJS kullanılabilir
    // Bu örnekte manuel barkod girişi için bir input göstereceğiz

    setTimeout(scanForBarcode, 100);
  };

  const handleManualInput = () => {
    const barcode = prompt("Barkod numarasını manuel olarak girin:");
    if (barcode && barcode.trim()) {
      onBarcodeScanned(barcode.trim());
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center text-red-600">
          <Camera className="w-12 h-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleManualInput} className="flex-1">
            Manuel Giriş
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p>Kamera başlatılıyor...</p>
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded object-cover"
          playsInline
          muted
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Barkod okuma çerçevesi */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-red-500 border-dashed rounded opacity-75">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-600">
        Barkodu kırmızı çerçeve içine hizalayın
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleManualInput}
          variant="outline"
          className="flex-1 bg-transparent"
        >
          Manuel Giriş
        </Button>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Kapat
        </Button>
      </div>
    </div>
  );
}
