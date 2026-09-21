import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface FloatingCartButtonProps {
  totalItems: number;
  totalPrice: number;
  onClick: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  totalItems,
  onClick,
}) => {
  return (
    <div className="fixed bottom-6 right-5 z-40">
      <button
        id="floating-cart-fab"
        type="button"
        onClick={onClick}
        className="relative w-14 h-14 rounded-full bg-[#12131c] border-2 border-[#f48fb1] flex items-center justify-center shadow-[0_6px_25px_rgba(244,143,177,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer group"
        title="Ver Carrito de Compras"
      >
        <ShoppingBag className="w-6 h-6 text-white stroke-[1.9] group-hover:text-pink-300 transition-colors" />

        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-[#f48fb1] text-neutral-950 border-2 border-[#12131c] text-[11px] font-black flex items-center justify-center shadow-md">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
};
