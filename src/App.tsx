import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, GoogleSheetConfig } from './types';
import {
  getCachedProducts,
  getSheetConfig,
  saveProductsToLocalStorage,
  saveSheetConfig,
  fetchProductsFromGoogleSheet,
  isSyncExpired
} from './services/googleSheets';
import { DEFAULT_PRODUCTS } from './data/defaultProducts';
import { Header } from './components/Header';
import { CategorySelector } from './components/CategorySelector';
import { ProductCard } from './components/ProductCard';
import { CartView } from './components/CartView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { FloatingCartButton } from './components/FloatingCartButton';
import { Footer } from './components/Footer';
import { UtensilsCrossed } from 'lucide-react';

const STORAGE_KEY_CART = 'crise_patisserie_cart';

export default function App() {
  // Navigation tabs: 'catalogo' | 'carrito' (matching public store view)
  const [activeTab, setActiveTab] = useState<'catalogo' | 'carrito'>('catalogo');

  // Products state (loads cached products, or DEFAULT_PRODUCTS with Torta Matilda)
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = getCachedProducts();
    if (cached && cached.length > 0) {
      return cached;
    }
    return DEFAULT_PRODUCTS;
  });

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => getSheetConfig());
  const [activeCategory, setActiveCategory] = useState<string>('Todas las Delicias');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Auto-sync function: keeps catalog always fresh from Google Sheets
  const triggerAutoSync = useCallback(async () => {
    const config = getSheetConfig();
    if (!config.sheetIdOrUrl) return;

    try {
      const res = await fetchProductsFromGoogleSheet(config.sheetIdOrUrl);
      if (res.success && res.products.length > 0) {
        setProducts(res.products);
        saveProductsToLocalStorage(res.products);
        const updatedConfig: GoogleSheetConfig = {
          ...config,
          lastSync: new Date().toISOString(),
          status: 'success',
          itemCount: res.products.length,
        };
        setSheetConfig(updatedConfig);
        saveSheetConfig(updatedConfig);
      }
    } catch (e) {
      console.warn('Auto-sync error:', e);
    }
  }, []);

  // Background timer: syncs immediately on load, on tab focus, and every 30 seconds
  useEffect(() => {
    triggerAutoSync();

    // Periodic background sync every 30 seconds
    const interval = setInterval(() => {
      triggerAutoSync();
    }, 30 * 1000);

    const handleFocus = () => {
      triggerAutoSync();
    };
    window.addEventListener('focus', handleFocus);

    // Secret shortcut for store owner: Ctrl + Shift + A (or Cmd + Shift + A)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsSheetModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerAutoSync]);

  // Cart state with persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not persist cart', e);
    }
  }, [cartItems]);

  // Extract categories dynamically from current products
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoria) set.add(p.categoria.trim());
    });
    return ['Todas las Delicias', ...Array.from(set)];
  }, [products]);

  // Product counts per category
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {
      'Todas las Delicias': products.length,
    };
    products.forEach((p) => {
      const cat = p.categoria ? p.categoria.trim() : 'Otras Delicias';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered products based on active category & search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === 'Todas las Delicias' || p.categoria === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Cart helper map for fast quantity lookup
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cartItems.forEach((item) => {
      map[item.product.id] = item.cantidad;
    });
    return map;
  }, [cartItems]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.cantidad, 0),
    [cartItems]
  );

  const totalCartPrice = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.product.precio * item.cantidad, 0),
    [cartItems]
  );

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prev, { product, cantidad: quantity }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.cantidad > 1) {
        return prev.map((item) =>
          item.product.id === productId
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-neutral-100 flex flex-col font-sans-brand selection:bg-[#f48fb1] selection:text-neutral-950">
      {/* Top Header matching Screenshot 1 & 2 */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={totalCartCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'catalogo' ? (
          <div className="animate-in fade-in duration-150">
            {/* Category Dropdown, Search Input & Filter Pills (shown when products exist) */}
            {products.length > 0 && (
              <CategorySelector
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                productCountByCategory={productCountByCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            )}

            {/* Product List with safe bottom padding so buttons are never obstructed */}
            <div className="w-full max-w-2xl mx-auto px-4 pt-2 space-y-3 pb-32">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantityInCart={cartQuantities[product.id] || 0}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onRemoveFromCart={handleRemoveFromCart}
                    onOpenDetails={setSelectedProduct}
                  />
                ))
              ) : (
                <div className="py-14 text-center space-y-3.5 rounded-3xl bg-[#141520] border border-[#252838] p-8 mt-4 shadow-xl">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#1c1d29] border border-[#2b2e40] flex items-center justify-center text-neutral-400">
                    <UtensilsCrossed className="w-7 h-7 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {products.length === 0 ? 'Catálogo en Preparación' : 'No encontramos productos en esta sección'}
                  </h3>
                  <p className="text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed">
                    {products.length === 0
                      ? 'Estamos preparando y horneando nuevas delicias artesanales para ti.'
                      : searchQuery
                      ? `No hay coincidencias para "${searchQuery}".`
                      : 'Esta categoría aún no cuenta con delicias cargadas.'}
                  </p>
                  {products.length === 0 ? (
                    <button
                      onClick={() => setIsSheetModalOpen(true)}
                      className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors underline decoration-dotted"
                    >
                      <span>Sincronizar inventario</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveCategory('Todas las Delicias');
                      }}
                      className="px-5 py-2 rounded-full bg-[#f48fb1] text-neutral-950 font-bold text-xs hover:bg-pink-400 transition-colors"
                    >
                      Ver todo el catálogo
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Floating Cart Button */}
            <FloatingCartButton
              totalItems={totalCartCount}
              totalPrice={totalCartPrice}
              onClick={() => setActiveTab('carrito')}
            />
          </div>
        ) : (
          /* Carrito View */
          <div className="animate-in fade-in duration-150">
            <CartView
              cartItems={cartItems}
              onBackToCatalog={() => setActiveTab('catalogo')}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={(id) => handleUpdateQuantity(id, -999)}
              onClearCart={handleClearCart}
            />
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Google Sheets Configuration Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={sheetConfig}
        onUpdateProducts={(newProducts) => {
          setProducts(newProducts);
          saveProductsToLocalStorage(newProducts);
        }}
        onUpdateConfig={setSheetConfig}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
