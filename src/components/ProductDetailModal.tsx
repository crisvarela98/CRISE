import React, { useState } from 'react';
import { Product } from '../types';
import { X, Clock, Users, AlertTriangle, Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(product.precio);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#181922] border border-[#2d3040] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative w-full h-56 sm:h-64 bg-neutral-900 shrink-0">
          <img
            src={product.imagen}
            alt={product.nombre}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181922] via-transparent to-transparent opacity-90" />
          
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#70C0F8]/20 border border-[#70C0F8]/50 text-[#70C0F8] backdrop-blur-md">
              {product.categoria}
            </span>
            {product.destacado && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F48FB1] text-neutral-950 flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                Especialidad de la Casa
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div>
            {product.sku && (
              <span className="inline-block font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#212332] text-neutral-300 border border-[#303348] mb-1.5 uppercase tracking-wider">
                SKU: {product.sku}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif-brand">
              {product.nombre}
            </h2>
            <div className="text-2xl font-bold text-white mt-1">
              {formattedPrice}
            </div>
          </div>

          <p className="text-neutral-300 text-sm leading-relaxed">
            {product.descripcion}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {product.porciones && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1f212e] border border-[#2b2d3d] text-xs text-neutral-200">
                <Users className="w-4 h-4 text-[#70C0F8] shrink-0" />
                <span>
                  <strong className="text-neutral-400 block text-[10px] uppercase tracking-wider">Rinde estimado</strong>
                  {product.porciones}
                </span>
              </div>
            )}

            {product.tiempoAnticipacion && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1f212e] border border-[#2b2d3d] text-xs text-neutral-200">
                <Clock className="w-4 h-4 text-[#F48FB1] shrink-0" />
                <span>
                  <strong className="text-neutral-400 block text-[10px] uppercase tracking-wider">Elaboración</strong>
                  {product.tiempoAnticipacion}
                </span>
              </div>
            )}
          </div>

          {/* Allergens note if any */}
          {product.alergenos && product.alergenos.length > 0 && (
            <div className="p-3 rounded-xl bg-[#231a24] border border-[#3d2433] text-xs text-pink-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F48FB1] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-pink-300">Contiene o puede contener:</span>
                <span>{product.alergenos.join(', ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 bg-[#14151c] border-t border-[#252735] flex items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center bg-[#1f212e] border border-[#2e3142] rounded-full p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to order button */}
          <button
            onClick={handleAdd}
            disabled={!product.disponible}
            className={`flex-1 py-3 px-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
              product.disponible
                ? 'bg-gradient-to-r from-[#F48FB1] via-[#EC4899] to-[#70C0F8] text-neutral-950 font-bold hover:opacity-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {product.disponible
                ? `Agregar ${quantity > 1 ? `(${quantity})` : ''} • ${new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    maximumFractionDigits: 0,
                  }).format(product.precio * quantity)}`
                : 'Producto Agotado'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
