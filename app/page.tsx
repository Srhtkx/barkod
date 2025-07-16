"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Scanner = dynamic(() => import("@/app/components/Scanner"), {
  ssr: false,
});

interface Product {
  barcode: string;
  count: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("stoklar");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("stoklar", JSON.stringify(products));
  }, [products]);

  const handleScan = (barcode: string) => {
    const existing = products.find((p) => p.barcode === barcode);
    if (existing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.barcode === barcode ? { ...p, count: p.count + 1 } : p
        )
      );
    } else {
      setProducts((prev) => [...prev, { barcode, count: 1 }]);
    }
  };

  const clearStorage = () => {
    if (confirm("Tüm veriler silinsin mi?")) {
      setProducts([]);
      localStorage.removeItem("stoklar");
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">📦 Stok Sayım</h1>
      <Scanner onScan={handleScan} />

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">📋 Sayılan Ürünler</h2>
        {products.length === 0 ? (
          <p>Henüz ürün eklenmedi.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.barcode} className="border p-2 rounded">
                <strong>{p.barcode}</strong> - Adet: {p.count}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={clearStorage}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Verileri Temizle
        </button>
      </div>
    </main>
  );
}
