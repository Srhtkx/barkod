"use client";

import type React from "react";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  barcode: string;
  name: string;
  quantity: number;
  addedDate: string;
}

export default function StokSayimApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"scan" | "list">("scan");
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", barcode: "" });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // localStorage'dan verileri yükle
  useEffect(() => {
    const savedProducts = localStorage.getItem("stok-products");
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      }
    }
  }, []);

  // Verileri localStorage'a kaydet
  const saveToStorage = (updatedProducts: Product[]) => {
    localStorage.setItem("stok-products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  // Bildirim göster
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Barkod ile ürün ara veya ekle
  const handleBarcodeScanned = (barcode: string) => {
    if (!barcode.trim()) {
      showNotification("Lütfen geçerli bir barkod girin", "error");
      return;
    }

    const existingProduct = products.find((p) => p.barcode === barcode.trim());

    if (existingProduct) {
      // Mevcut ürünün stokunu artır
      const updatedProducts = products.map((p) =>
        p.barcode === barcode.trim() ? { ...p, quantity: p.quantity + 1 } : p
      );
      saveToStorage(updatedProducts);
      showNotification(
        `${existingProduct.name} stoku artırıldı! Yeni miktar: ${
          existingProduct.quantity + 1
        }`
      );
    } else {
      // Yeni ürün eklemek için dialog aç
      setNewProduct({ name: "", barcode: barcode.trim() });
      setShowAddDialog(true);
    }
  };

  // Yeni ürün ekle
  const addNewProduct = () => {
    if (!newProduct.name.trim()) {
      showNotification("Lütfen ürün adını girin", "error");
      return;
    }

    if (!newProduct.barcode.trim()) {
      showNotification("Lütfen barkod girin", "error");
      return;
    }

    // Aynı barkodlu ürün var mı kontrol et
    if (products.some((p) => p.barcode === newProduct.barcode.trim())) {
      showNotification("Bu barkodlu ürün zaten mevcut", "error");
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      barcode: newProduct.barcode.trim(),
      name: newProduct.name.trim(),
      quantity: 1,
      addedDate: new Date().toLocaleDateString("tr-TR"),
    };

    const updatedProducts = [...products, product];
    saveToStorage(updatedProducts);
    setNewProduct({ name: "", barcode: "" });
    setShowAddDialog(false);
    showNotification(`${product.name} başarıyla eklendi!`);
  };

  // Stok güncelle
  const updateQuantity = (id: string, change: number) => {
    const updatedProducts = products
      .map((p) => {
        if (p.id === id) {
          const newQuantity = Math.max(0, p.quantity + change);
          return { ...p, quantity: newQuantity };
        }
        return p;
      })
      .filter((p) => p.quantity > 0); // Stoku 0 olan ürünleri kaldır

    saveToStorage(updatedProducts);

    if (change > 0) {
      showNotification("Stok artırıldı");
    } else {
      showNotification("Stok azaltıldı");
    }
  };

  // Ürün sil
  const deleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (
      product &&
      window.confirm(
        `${product.name} ürününü silmek istediğinizden emin misiniz?`
      )
    ) {
      const updatedProducts = products.filter((p) => p.id !== id);
      saveToStorage(updatedProducts);
      showNotification(`${product.name} silindi`);
    }
  };

  // Filtrelenmiş ürünler
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
  );

  // Toplam ürün sayısı
  const totalProducts = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "16px",
      }}
    >
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {/* Bildirim */}
        {notification && (
          <div
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              padding: "12px 24px",
              borderRadius: "8px",
              backgroundColor:
                notification.type === "success" ? "#10b981" : "#ef4444",
              color: "white",
              fontWeight: "500",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            📦 Stok Sayım
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <span>{products.length} Ürün Çeşidi</span>
            <span>{totalProducts} Toplam Adet</span>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "16px",
            display: "flex",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <button
            onClick={() => setActiveTab("scan")}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: activeTab === "scan" ? "#3b82f6" : "transparent",
              color: activeTab === "scan" ? "white" : "#666",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📷 Barkod Oku
          </button>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: activeTab === "list" ? "#3b82f6" : "transparent",
              color: activeTab === "list" ? "white" : "#666",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            📋 Stok Listesi
          </button>
        </div>

        {/* Barkod Okuma Sekmesi */}
        {activeTab === "scan" && (
          <div style={{}}>
            <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />

            {/* Son Eklenen Ürünler */}
            {products.length > 0 && (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "20px",
                  marginTop: "16px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  Son Eklenen Ürünler
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {products
                    .slice(-3)
                    .reverse()
                    .map((product) => (
                      <div
                        key={product.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: "500", margin: "0 0 4px 0" }}>
                            {product.name}
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              margin: 0,
                            }}
                          >
                            {product.barcode}
                          </p>
                        </div>
                        <span
                          style={{
                            backgroundColor: "#e5e7eb",
                            color: "#374151",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {product.quantity} adet
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stok Listesi Sekmesi */}
        {activeTab === "list" && (
          <div>
            {/* Arama */}
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder="Ürün adı veya barkod ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            {/* Ürün Listesi */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "#666",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {products.length === 0
                    ? "Henüz ürün eklenmemiş"
                    : "Arama sonucu bulunamadı"}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onUpdateQuantity={updateQuantity}
                    onDelete={deleteProduct}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Yeni Ürün Ekleme Dialog */}
        {showAddDialog && (
          <AddProductDialog
            product={newProduct}
            onProductChange={setNewProduct}
            onAdd={addNewProduct}
            onClose={() => setShowAddDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

// Barkod Tarayıcı Komponenti
function BarcodeScanner({
  onBarcodeScanned,
}: {
  onBarcodeScanned: (barcode: string) => void;
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");

  // Kamerayı başlat
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Arka kamera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      setIsScanning(true);
    } catch (err) {
      console.error("Kamera erişim hatası:", err);
      setError(
        "Kamera erişimi reddedildi veya mevcut değil. Lütfen tarayıcı ayarlarından kamera iznini kontrol edin."
      );
    }
  };

  // Kamerayı durdur
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  // Manuel barkod girişi
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  // Simüle edilmiş barkod okuma (gerçek uygulamada ZXing kullanılır)
  const simulateBarcodeRead = () => {
    const testBarcode = prompt("Test için barkod numarası girin:");
    if (testBarcode) {
      onBarcodeScanned(testBarcode);
      stopCamera();
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {!isScanning ? (
        <div>
          {/* Kamera Başlatma */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📷</div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                margin: "0 0 8px 0",
              }}
            >
              Barkod Okuyucu
            </h2>
            <p
              style={{ color: "#666", fontSize: "14px", margin: "0 0 20px 0" }}
            >
              Kamerayı başlatarak barkod okutun veya manuel olarak girin
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={startCamera}
              style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              📷 Kamerayı Başlat
            </button>
          </div>

          {/* Manuel Barkod Girişi */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Manuel Barkod Girişi
            </h3>
            <form
              onSubmit={handleManualSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Barkod numarasını girin..."
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              <button
                type="submit"
                disabled={!manualBarcode.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: manualBarcode.trim() ? "#10b981" : "#9ca3af",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: manualBarcode.trim() ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                }}
              >
                ✅ Barkod Ekle
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          {/* Kamera Görüntüsü */}
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <video
              ref={(video) => {
                if (video && stream) {
                  video.srcObject = stream;
                  video.play();
                }
              }}
              style={{
                width: "100%",
                height: "240px",
                backgroundColor: "#000",
                borderRadius: "8px",
                objectFit: "cover",
              }}
              playsInline
              muted
            />

            {/* Barkod Okuma Çerçevesi */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "80px",
                border: "2px dashed #ef4444",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Köşe işaretleri */}
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  left: "-2px",
                  width: "20px",
                  height: "20px",
                  borderTop: "4px solid #ef4444",
                  borderLeft: "4px solid #ef4444",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "20px",
                  height: "20px",
                  borderTop: "4px solid #ef4444",
                  borderRight: "4px solid #ef4444",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  left: "-2px",
                  width: "20px",
                  height: "20px",
                  borderBottom: "4px solid #ef4444",
                  borderLeft: "4px solid #ef4444",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "20px",
                  height: "20px",
                  borderBottom: "4px solid #ef4444",
                  borderRight: "4px solid #ef4444",
                }}
              />
            </div>

            {/* Tarama çizgisi animasyonu */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "200px",
                height: "2px",
                backgroundColor: "#ef4444",
                animation: "scan 2s linear infinite",
              }}
            />
          </div>

          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>
              Barkodu kırmızı çerçeve içine hizalayın
            </p>
            <p style={{ color: "#999", fontSize: "12px", margin: 0 }}>
              Otomatik okuma aktif...
            </p>
          </div>

          {/* Kontrol Butonları */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={simulateBarcodeRead}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🔍 Test Okuma
            </button>
            <button
              onClick={stopCamera}
              style={{
                padding: "12px 16px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ❌ Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Ürün Kartı Komponenti
function ProductCard({
  product,
  onUpdateQuantity,
  onDelete,
}: {
  product: Product;
  onUpdateQuantity: (id: string, change: number) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" }}
          >
            {product.name}
          </h3>
          <p style={{ fontSize: "12px", color: "#666", margin: "0 0 2px 0" }}>
            {product.barcode}
          </p>
          <p style={{ fontSize: "10px", color: "#999", margin: 0 }}>
            Eklenme: {product.addedDate}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => onUpdateQuantity(product.id, -1)}
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "#666",
            }}
          >
            −
          </button>
          <span
            style={{
              minWidth: "40px",
              textAlign: "center",
              backgroundColor: "#f3f4f6",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {product.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(product.id, 1)}
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "#666",
            }}
          >
            +
          </button>
          <button
            onClick={() => onDelete(product.id)}
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid #fca5a5",
              borderRadius: "6px",
              backgroundColor: "#fef2f2",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              color: "#dc2626",
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// Ürün Ekleme Dialog Komponenti
function AddProductDialog({
  product,
  onProductChange,
  onAdd,
  onClose,
}: {
  product: { name: string; barcode: string };
  onProductChange: (product: { name: string; barcode: string }) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2
          style={{ fontSize: "20px", fontWeight: "600", marginBottom: "20px" }}
        >
          Yeni Ürün Ekle
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
              }}
            >
              Barkod
            </label>
            <input
              type="text"
              value={product.barcode}
              onChange={(e) =>
                onProductChange({ ...product, barcode: e.target.value })
              }
              placeholder="Barkod numarası"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "6px",
              }}
            >
              Ürün Adı
            </label>
            <input
              type="text"
              value={product.name}
              onChange={(e) =>
                onProductChange({ ...product, name: e.target.value })
              }
              placeholder="Ürün adını girin"
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              autoFocus
            />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Ekle
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 20px",
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
