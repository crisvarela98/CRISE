import React from 'react';
import { Product } from '../types';
import { Plus, Minus, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
  onOpenDetails,
}) => {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.precio);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative w-full flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#14151f] border border-[#252738] hover:border-[#383a52] transition-all duration-200 shadow-md"
    >
      {/* Product Image (Left) */}
      <div
        className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#1c1d28] cursor-pointer border border-[#262838]"
        onClick={() => onOpenDetails(product)}
      >
        <img
          src={product.imagen}
          alt={product.nombre}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Customizable or Featured badge */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#161424]/90 border border-[#f48fb1]/40 text-[#fbcfe8] text-[9px] sm:text-[10px] font-semibold tracking-wide backdrop-blur-xs shadow-sm">
          <Sparkles className="w-2.5 h-2.5 text-[#f48fb1]" />
          <span>Personalizable</span>
        </div>
      </div>

      {/* Product Information (Right) */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.sku && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#1e202d] text-neutral-400 border border-[#2b2d3d] uppercase tracking-wider">
                {product.sku}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3
            className="text-white font-serif-brand font-bold text-sm sm:text-base leading-snug line-clamp-1 cursor-pointer hover:text-pink-300 transition-colors mt-0.5"
            onClick={() => onOpenDetails(product)}
          >
            {product.nombre}
          </h3>

          {/* Description snippet */}
          <p className="text-neutral-400 text-xs line-clamp-1 mt-0.5 font-sans">
            {product.descripcion}
          </p>
        </div>

        {/* Bottom Row: Price, Detalles link, and Action Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#242636] mt-2 flex-nowrap">
          {/* Price */}
          <span className="text-white font-bold text-sm sm:text-base tracking-tight font-mono whitespace-nowrap shrink-0">
            {formattedPrice}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {/* Detalles button */}
            <button
              type="button"
              onClick={() => onOpenDetails(product)}
              className="text-xs font-semibold text-[#ce93d8] hover:text-[#f48fb1] transition-colors cursor-pointer px-1 py-0.5 whitespace-nowrap"
            >
              Detalles
            </button>

            {/* Circular + Action Button or Compact Counter */}
            <div className="shrink-0 flex items-center justify-end">
              {quantityInCart === 0 ? (
                <button
                  type="button"
                  onClick={() => onAddToCart(product)}
                  disabled={!product.disponible}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-md active:scale-90 ${
                    product.disponible
                      ? 'bg-[#f48fb1] text-neutral-950 hover:bg-[#f06292] font-black'
                      : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  }`}
                  title={product.disponible ? 'Agregar al pedido' : 'Agotado'}
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </button>
              ) : (
                <div className="flex items-center gap-0.5 sm:gap-1 bg-[#1e202d] p-0.5 sm:p-1 rounded-full border border-[#303346] shadow-sm">
                  <button
                    type="button"
                    onClick={() => onRemoveFromCart(product.id)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-[#151620] text-neutral-300 hover:text-white transition-colors"
                    title="Restar uno"
                  >
                    <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </button>
                  <span className="text-xs font-bold text-pink-300 px-1 min-w-[14px] text-center font-mono">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-[#f48fb1] text-neutral-950 hover:bg-pink-400 transition-colors"
                    title="Sumar uno"
                  >
                    <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
