import React from 'react';
import { CriseLogo } from './CriseLogo';

interface HeaderProps {
  activeTab: 'catalogo' | 'carrito';
  onSelectTab: (tab: 'catalogo' | 'carrito') => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  cartCount,
}) => {
  return (
    <header className="relative w-full bg-[#0d0d12] text-white">
      {/* 1. Top Bar: "● CRISE" on left, Segmented Pills on right */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Logo brand mark */}
        <CriseLogo
          size="topbar"
          onClick={() => onSelectTab('catalogo')}
          className="cursor-pointer shrink-0"
        />

        {/* Right actions: Tab Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Segmented Pill: [ 1. Catálogo ] [ 2. Carrito ] */}
          <div className="bg-[#141520] p-1 rounded-full border border-[#2d3042] flex items-center shadow-inner shrink-0">
            <button
              id="tab-catalogo-button"
              type="button"
              onClick={() => onSelectTab('catalogo')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === 'catalogo'
                  ? 'bg-gradient-to-r from-[#bce0fd] via-[#dcbbf8] to-[#fbcfe8] text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              1. Catálogo
            </button>

            <button
              id="tab-carrito-button"
              type="button"
              onClick={() => onSelectTab('carrito')}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'carrito'
                  ? 'bg-gradient-to-r from-[#bce0fd] via-[#dcbbf8] to-[#fbcfe8] text-neutral-950 shadow-md'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              <span>2. Carrito</span>
              {cartCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'carrito'
                      ? 'bg-neutral-950 text-pink-300'
                      : 'bg-[#f48fb1] text-neutral-950'
                  }`}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Hero Section: "C R I S E" with "— PASTELERÍA ARTESANAL —" */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-4 pb-2 flex flex-col items-center justify-center text-center">
        <CriseLogo size="hero" onClick={() => onSelectTab('catalogo')} />

        {/* If in Carrito view: Pill badge "Tu Carrito de Exclusividades" */}
        {activeTab === 'carrito' && (
          <div className="mt-4">
            <div className="inline-flex items-center px-5 py-1.5 rounded-full bg-[#181924] border border-[#373a50] text-neutral-200 text-xs font-medium tracking-wide shadow-sm">
              Tu Carrito de Exclusividades
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
