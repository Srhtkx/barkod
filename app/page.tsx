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
    setTimeout(() => setNotification(null), 4000);
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
              maxWidth: "90%",
              textAlign: "center",
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
            <HTTPSSetupGuide />
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

// HTTPS Kurulum Rehberi Komponenti
function HTTPSSetupGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";

  if (isSecure) return null;

  const steps = [
    {
      title: "🚀 Ngrok ile Hızlı Çözüm (Önerilen)",
      content: (
        <div>
          <p style={{ marginBottom: "12px" }}>En kolay ve hızlı çözüm:</p>
          <div
            style={{
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              padding: "12px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            # 1. Ngroku indirin: https://ngrok.com/download
            <br /># 2. Terminalde çalıştırın:
            <br />
            ngrok http 3000
            <br /># 3. Verilen HTTPS URLsini kullanın
          </div>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Ngrok size https://abc123.ngrok.io gibi bir URL verecek. Bu URLyi
            telefonunuzda açın.
          </p>
        </div>
      ),
    },
    {
      title: "🔧 Next.js HTTPS Kurulumu",
      content: (
        <div>
          <p style={{ marginBottom: "12px" }}>Development için HTTPS:</p>
          <div
            style={{
              backgroundColor: "#1f2937",
              color: "#f9fafb",
              padding: "12px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            # 1. mkcert kurulumu:
            <br />
            brew install mkcert # macOS
            <br />
            choco install mkcert # Windows
            <br />
            <br /># 2. Sertifika oluştur:
            <br />
            mkcert -install
            <br />
            mkcert localhost 192.168.1.17
            <br />
            <br /># 3. Next.jsi HTTPS ile başlat:
            <br />
            npm run dev -- --experimental-https
          </div>
        </div>
      ),
    },
    {
      title: "📱 Alternatif Çözümler",
      content: (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
              1. Vercel Deploy
            </h4>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              Projeyi Vercele deploy edin, otomatik HTTPS alır.
            </p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
              2. Netlify Deploy
            </h4>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              GitHuba push edip Netlifyda deploy edin.
            </p>
          </div>
          <div>
            <h4 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
              3. Cloudflare Tunnel
            </h4>
            <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
              cloudflared tunnel --url http://localhost:3000
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          backgroundColor: "#fef3c7",
          border: "2px solid #f59e0b",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <h3 style={{ margin: 0, color: "#92400e", fontSize: "18px" }}>
            HTTPS Gerekli
          </h3>
        </div>
        <p style={{ margin: 0, color: "#92400e", fontSize: "14px" }}>
          iOS Safaride kamera kullanmak için HTTPS bağlantısı zorunludur.
          Aşağıdaki çözümlerden birini uygulayın:
        </p>
      </div>

      <button
        onClick={() => setShowGuide(!showGuide)}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          marginBottom: showGuide ? "16px" : "0",
        }}
      >
        {showGuide ? "🔼 Rehberi Gizle" : "🔽 HTTPS Kurulum Rehberi"}
      </button>

      {showGuide && (
        <div>
          {/* Step Navigation */}
          <div style={{ display: "flex", marginBottom: "20px", gap: "8px" }}>
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                style={{
                  flex: 1,
                  padding: "8px",
                  backgroundColor:
                    currentStep === index ? "#3b82f6" : "#f3f4f6",
                  color: currentStep === index ? "white" : "#666",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Step Content */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
            }}
          >
            <h4 style={{ margin: "0 0 12px 0", color: "#1f2937" }}>
              {steps[currentStep].title}
            </h4>
            {steps[currentStep].content}
          </div>

          {/* Navigation Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              style={{
                padding: "8px 16px",
                backgroundColor: currentStep === 0 ? "#f3f4f6" : "#6b7280",
                color: currentStep === 0 ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "6px",
                cursor: currentStep === 0 ? "not-allowed" : "pointer",
              }}
            >
              ← Önceki
            </button>
            <button
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
              disabled={currentStep === steps.length - 1}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  currentStep === steps.length - 1 ? "#f3f4f6" : "#6b7280",
                color: currentStep === steps.length - 1 ? "#9ca3af" : "white",
                border: "none",
                borderRadius: "6px",
                cursor:
                  currentStep === steps.length - 1 ? "not-allowed" : "pointer",
              }}
            >
              Sonraki →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Basitleştirilmiş Barkod Tarayıcı (Manuel Odaklı)
function BarcodeScanner({
  onBarcodeScanned,
}: {
  onBarcodeScanned: (barcode: string) => void;
}) {
  const [manualBarcode, setManualBarcode] = useState("");
  const [recentBarcodes, setRecentBarcodes] = useState<string[]>([]);

  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";

  // Manuel barkod girişi
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim());

      // Son barkodları kaydet
      const newRecent = [
        manualBarcode.trim(),
        ...recentBarcodes.filter((b) => b !== manualBarcode.trim()),
      ].slice(0, 5);
      setRecentBarcodes(newRecent);
      localStorage.setItem("recent-barcodes", JSON.stringify(newRecent));

      setManualBarcode("");
    }
  };

  // Son barkodları yükle
  useEffect(() => {
    const saved = localStorage.getItem("recent-barcodes");
    if (saved) {
      try {
        setRecentBarcodes(JSON.parse(saved));
      } catch (e) {
        console.error("Recent barcodes yüklenemedi:", e);
      }
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {!isSecure ? (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔒</div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              margin: "0 0 8px 0",
              color: "#dc2626",
            }}
          >
            Kamera Kullanılamıyor
          </h2>
          <p style={{ color: "#666", fontSize: "14px", margin: "0 0 20px 0" }}>
            HTTPS gerekli. Yukarıdaki rehberi takip edin veya manuel giriş
            kullanın.
          </p>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📷</div>
          <h2
            style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 8px 0" }}
          >
            Kamera Hazır
          </h2>
          <p
            style={{ color: "#10b981", fontSize: "14px", margin: "0 0 20px 0" }}
          >
            HTTPS aktif - Kamera özelliği kullanılabilir
          </p>
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📷 Kamerayı Başlat
          </button>
        </div>
      )}

      {/* Manuel Barkod Girişi */}
      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: "20px",
        }}
      >
        <h3
          style={{
            fontSize: "18px",
            fontWeight: "600",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          ✏️ Manuel Barkod Girişi
        </h3>

        <form onSubmit={handleManualSubmit} style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Barkod numarasını girin..."
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualBarcode.trim()}
              style={{
                padding: "14px 20px",
                backgroundColor: manualBarcode.trim() ? "#10b981" : "#9ca3af",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: manualBarcode.trim() ? "pointer" : "not-allowed",
                transition: "background-color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              ✅ Ekle
            </button>
          </div>
        </form>

        {/* Son Kullanılan Barkodlar */}
        {recentBarcodes.length > 0 && (
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#666",
              }}
            >
              🕒 Son Kullanılan Barkodlar
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              {recentBarcodes.map((barcode, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setManualBarcode(barcode);
                  }}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e9ecef")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                >
                  {barcode}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hızlı Barkod Örnekleri */}
        <div style={{ marginTop: "20px" }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "12px",
              color: "#666",
            }}
          >
            🚀 Test Barkodları
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              "1234567890123",
              "9876543210987",
              "1111111111111",
              "2222222222222",
            ].map((testBarcode) => (
              <button
                key={testBarcode}
                onClick={() => setManualBarcode(testBarcode)}
                style={{
                  padding: "8px",
                  backgroundColor: "#e7f3ff",
                  border: "1px solid #b3d9ff",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  color: "#0066cc",
                }}
              >
                {testBarcode}
              </button>
            ))}
          </div>
        </div>
      </div>
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
              width: "36px",
              height: "36px",
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
              minWidth: "44px",
              textAlign: "center",
              backgroundColor: "#f3f4f6",
              padding: "8px 12px",
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
              width: "36px",
              height: "36px",
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
              width: "36px",
              height: "36px",
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
