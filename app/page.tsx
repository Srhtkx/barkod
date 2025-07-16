"use client";

import type React from "react";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Scanner bileşenini dinamik olarak import ediyoruz, SSR'ı kapatıyoruz
const Scanner = dynamic(() => import("@/app/components/Scanner"), {
  ssr: false,
});

interface Product {
  barcode: string;
  count: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // localStorage'dan verileri yükle
  useEffect(() => {
    const saved = localStorage.getItem("stoklar");
    if (saved) {
      try {
        setProducts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse products from localStorage", e);
        setProducts([]); // Hatalı veriyi temizle
      }
    }
  }, []);

  // Verileri localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("stoklar", JSON.stringify(products));
  }, [products]);

  // Bildirim göster
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // 4 saniye sonra bildirimi kaldır
  };

  // Barkod tarandığında veya manuel girildiğinde
  const handleScan = (barcode: string) => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) {
      showNotification("Geçersiz barkod.", "error");
      return;
    }

    const existing = products.find((p) => p.barcode === trimmedBarcode);
    if (existing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.barcode === trimmedBarcode ? { ...p, count: p.count + 1 } : p
        )
      );
      showNotification(
        `${trimmedBarcode} adedi artırıldı! Yeni adet: ${existing.count + 1}`
      );
    } else {
      setProducts((prev) => [...prev, { barcode: trimmedBarcode, count: 1 }]);
      showNotification(`${trimmedBarcode} yeni ürün olarak eklendi!`);
    }
    setManualBarcode(""); // Manuel giriş alanını temizle
  };

  // Manuel barkod girişi
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleScan(manualBarcode.trim());
    } else {
      showNotification("Lütfen manuel barkod girin.", "error");
    }
  };

  // Ürün adedini güncelle
  const updateQuantity = (barcode: string, change: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) =>
        p.barcode === barcode
          ? { ...p, count: Math.max(0, p.count + change) }
          : p
      );
      return updated.filter((p) => p.count > 0); // Adedi 0 olanları kaldır
    });
    showNotification(`Ürün adedi güncellendi: ${barcode}`);
  };

  // Ürünü sil
  const deleteProduct = (barcode: string) => {
    if (
      confirm(`${barcode} barkodlu ürünü silmek istediğinizden emin misiniz?`)
    ) {
      setProducts((prev) => prev.filter((p) => p.barcode !== barcode));
      showNotification(`${barcode} barkodlu ürün silindi.`, "error");
    }
  };

  // Tüm verileri temizle
  const clearStorage = () => {
    if (confirm("Tüm stok verileri silinecektir. Emin misiniz?")) {
      setProducts([]);
      localStorage.removeItem("stoklar");
      showNotification("Tüm veriler temizlendi.", "success");
    }
  };

  // Filtrelenmiş ürünler
  const filteredProducts = products.filter((p) =>
    p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-4 max-w-md mx-auto min-h-screen flex flex-col">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="card text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">📦 Stok Sayım</h1>
        <p className="text-gray-600">Toplam Ürün Çeşidi: {products.length}</p>
        <p className="text-gray-600">
          Toplam Adet: {products.reduce((sum, p) => sum + p.count, 0)}
        </p>
      </div>

      <Scanner
        onScan={handleScan}
        onError={(msg) => showNotification(msg, "error")}
      />

      {/* Manuel Barkod Girişi */}
      <div className="card p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          ✏️ Manuel Barkod Girişi
        </h2>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Barkod numarasını girin..."
            className="flex-grow"
          />
          <button type="submit" className="btn btn-primary">
            Ekle
          </button>
        </form>
      </div>

      {/* Stok Listesi */}
      <div className="card flex-grow">
        <h2 className="text-xl font-semibold mb-4">📋 Sayılan Ürünler</h2>
        <input
          type="text"
          placeholder="Barkod ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        {filteredProducts.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            {products.length === 0
              ? "Henüz ürün eklenmedi."
              : "Arama sonucu bulunamadı."}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredProducts.map((p) => (
              <li
                key={p.barcode}
                className="flex items-center justify-between border border-gray-200 p-3 rounded-lg bg-gray-50"
              >
                <div>
                  <strong className="block text-lg">{p.barcode}</strong>
                  <span className="text-sm text-gray-500">Adet: {p.count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(p.barcode, -1)}
                    className="btn btn-secondary w-8 h-8 p-0 text-base"
                  >
                    -
                  </button>
                  <span className="font-bold text-lg min-w-[30px] text-center">
                    {p.count}
                  </span>
                  <button
                    onClick={() => updateQuantity(p.barcode, 1)}
                    className="btn btn-secondary w-8 h-8 p-0 text-base"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteProduct(p.barcode)}
                    className="btn btn-danger w-8 h-8 p-0 text-base"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {products.length > 0 && (
          <button onClick={clearStorage} className="btn btn-danger w-full mt-6">
            Tüm Verileri Temizle
          </button>
        )}
      </div>
    </main>
  );
}
