import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface CategorySelectorProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  productCountByCategory: Record<string, number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  productCountByCategory,
  searchQuery,
  onSearchChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-3.5 my-3">
      {/* 1. Central Pill Selector with Pink Dot: (● Tartas Personalizadas ⌄) */}
      <div className="flex justify-center relative" ref={dropdownRef}>
        <button
          id="category-dropdown-trigger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group inline-flex items-center justify-between gap-3 px-6 py-2.5 rounded-full bg-[#181924] border border-[#3b354d] hover:border-[#f48fb1]/80 text-white font-serif-brand text-base sm:text-lg shadow-lg transition-all active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f48fb1] shadow-[0_0_8px_#f48fb1] shrink-0" />
            <span className="font-semibold text-white tracking-wide">
              {activeCategory}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-neutral-300 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#f48fb1]' : ''
            }`}
          />
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div
            id="category-dropdown-menu"
            className="absolute top-full mt-2 w-72 max-w-[90vw] bg-[#1a1b26] border border-[#2f3244] rounded-2xl shadow-2xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 py-1.5 border-b border-[#292c3a]">
              Categorías CRISÉ
            </div>
            <div className="max-h-60 overflow-y-auto py-1 space-y-1">
              {categories.map((cat) => {
                const count = productCountByCategory[cat] ?? 0;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(cat);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors text-left ${
                      isSelected
                        ? 'bg-[#291f33] text-[#f48fb1] font-semibold'
                        : 'text-neutral-200 hover:bg-[#202230]'
                    }`}
                  >
                    <span>{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#13141a] text-neutral-400">
                        {count}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#f48fb1]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Search Bar: "Buscar tartas, sabores, macarons..." matching Screenshot 1 */}
      <div className="relative w-full">
        <input
          id="search-products-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar tartas, sabores, macarons..."
          className="w-full pl-4 pr-10 py-2.5 text-sm bg-[#151620] border border-[#2a2c3d] rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#f48fb1] focus:ring-1 focus:ring-[#f48fb1] transition-all shadow-inner"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <Search className="w-4 h-4 text-neutral-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        )}
      </div>

      {/* 3. Horizontal Pill Filters matching Screenshot 1 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 text-xs px-4 py-2 rounded-full font-medium transition-all ${
                isSelected
                  ? 'bg-[#231b2e] border border-[#c084fc] text-white shadow-sm font-semibold'
                  : 'bg-[#151620] border border-[#2a2c3d] text-neutral-300 hover:text-white hover:border-neutral-500'
              }`}
            >
              {cat === 'Todas las Delicias' ? 'Todos los productos' : cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
