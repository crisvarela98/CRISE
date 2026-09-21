import React, { useState, useMemo } from 'react';
import {
  INSUMOS_DEFAULT,
  RECETAS_DEFAULT,
  Insumo,
  RecetaProducto,
} from '../data/costingData';
import { downloadCostingExcel } from '../services/costingExcel';
import {
  Download,
  FileSpreadsheet,
  Calculator,
  Layers,
  BookOpen,
  Search,
  Sparkles,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Package,
  Clock,
  Flame,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface CostingManagerProps {
  onBackToCatalog: () => void;
  onOpenSheetsSync: () => void;
}

export const CostingManager: React.FC<CostingManagerProps> = ({
  onBackToCatalog,
  onOpenSheetsSync,
}) => {
  // Active sheet tab: 'hoja1' | 'hoja2' | 'hoja3'
  const [activeSheet, setActiveSheet] = useState<'hoja1' | 'hoja2' | 'hoja3'>('hoja1');

  // Insumos state (Hoja 2)
  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    try {
      const saved = localStorage.getItem('crise_insumos_data');
      return saved ? JSON.parse(saved) : INSUMOS_DEFAULT;
    } catch {
      return INSUMOS_DEFAULT;
    }
  });

  // Selected recipe (Hoja 3 and Hoja 1)
  const [recetas] = useState<RecetaProducto[]>(RECETAS_DEFAULT);
  const [selectedRecetaId] = useState<string>('receta-torta-matilda');

  // Profit margin percentage state (Hoja 1)
  const [margenGanancia, setMargenGanancia] = useState<number>(75);

  // Insumos filter & search (Hoja 2)
  const [insumoSearch, setInsumoSearch] = useState('');
  const [insumoCategory, setInsumoCategory] = useState<'todos' | 'solido' | 'liquido' | 'empaque' | 'servicio'>('todos');

  // Persist insumos changes
  const updateInsumoPrecio = (id: string, nuevoPrecio: number) => {
    setInsumos((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const precio = Math.max(0, nuevoPrecio);
          const costoPorUnidad = precio / (item.cantidadCompra || 1);
          return { ...item, precioCompra: precio, costoPorUnidad };
        }
        return item;
      });
      try {
        localStorage.setItem('crise_insumos_data', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save insumos', e);
      }
      return updated;
    });
  };

  const handleResetInsumos = () => {
    if (confirm('¿Restablecer todos los precios de insumos a los valores predeterminados de CRISÉ?')) {
      setInsumos(INSUMOS_DEFAULT);
      localStorage.removeItem('crise_insumos_data');
    }
  };

  // Map of insumos for fast lookup
  const insumosMap = useMemo(() => {
    const map = new Map<string, Insumo>();
    insumos.forEach((i) => map.set(i.id, i));
    return map;
  }, [insumos]);

  // Current Recipe
  const currentReceta = useMemo(() => {
    return recetas.find((r) => r.id === selectedRecetaId) || recetas[0];
  }, [recetas, selectedRecetaId]);

  // Cost calculations for Hoja 1
  const costingCalculation = useMemo(() => {
    let subtotalMateriaPrima = 0;
    let subtotalEmpaque = 0;
    let subtotalServicios = 0;

    const ingredientesDetallados = currentReceta.ingredientes.map((ing) => {
      const insumo = insumosMap.get(ing.insumoId);
      const costoUnitario = insumo ? insumo.costoPorUnidad : 0;
      const costoTotal = ing.cantidad * costoUnitario;

      if (insumo?.categoria === 'empaque') {
        subtotalEmpaque += costoTotal;
      } else if (insumo?.categoria === 'servicio') {
        subtotalServicios += costoTotal;
      } else {
        subtotalMateriaPrima += costoTotal;
      }

      return {
        ...ing,
        costoUnitario,
        costoTotal,
        categoria: insumo?.categoria || 'solido',
        presentacionCompra: insumo?.presentacionCompra || '',
      };
    });

    const subtotalManoObra = currentReceta.costosAdicionales.reduce(
      (acc, c) => acc + c.monto,
      0
    );

    const costoTotalProduccion =
      subtotalMateriaPrima + subtotalEmpaque + subtotalServicios + subtotalManoObra;

    // Suggested sale price based on configured margin
    const precioSugeridoVenta = costoTotalProduccion * (1 + margenGanancia / 100);
    const gananciaNeta = precioSugeridoVenta - costoTotalProduccion;

    // Compare with current store catalog price ($32.000 for Matilda)
    const precioCatalogoActual = 32000;
    const gananciaCatalogo = precioCatalogoActual - costoTotalProduccion;
    const margenRealCatalogo = (gananciaCatalogo / costoTotalProduccion) * 100;

    return {
      ingredientesDetallados,
      subtotalMateriaPrima,
      subtotalEmpaque,
      subtotalServicios,
      subtotalManoObra,
      costoTotalProduccion,
      precioSugeridoVenta,
      gananciaNeta,
      precioCatalogoActual,
      gananciaCatalogo,
      margenRealCatalogo,
    };
  }, [currentReceta, insumosMap, margenGanancia]);

  // Filtered insumos list for Hoja 2
  const filteredInsumos = useMemo(() => {
    return insumos.filter((item) => {
      const matchesCat = insumoCategory === 'todos' || item.categoria === insumoCategory;
      const q = insumoSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.presentacionCompra.toLowerCase().includes(q) ||
        (item.notas && item.notas.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [insumos, insumoCategory, insumoSearch]);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatUnitCost = (val: number, unit: string) => {
    return `$${val.toFixed(2)} / ${unit}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#252839]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalog}
            className="p-2 rounded-xl bg-[#171825] border border-[#2b2e40] text-neutral-300 hover:text-white hover:border-[#f48fb1] transition-colors"
            title="Volver al Catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#2a1e38] text-[#f48fb1] border border-[#f48fb1]/30">
                PLANILLA GOOGLE SHEETS
              </span>
              <span className="text-xs text-neutral-400 hidden sm:inline">
                Costos, Insumos por g/ml y Receta Oficial
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif-brand font-bold text-white tracking-wide">
              Gestor de Costos & Recetas CRISÉ
            </h1>
          </div>
        </div>

        {/* Excel Export Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => downloadCostingExcel(insumos, recetas, margenGanancia)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#217346] to-[#1e663d] hover:from-[#288c55] hover:to-[#227747] text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            title="Descargar archivo Excel con las 3 Hojas para abrir en Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Planilla (.xlsx)</span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Sheet Tabs Selector: 1. Costos y Ganancia | 2. Insumos (g y ml) | 3. Receta con Cantidades */}
      <div className="grid grid-cols-3 gap-2 bg-[#12131e] p-1.5 rounded-2xl border border-[#26283b] shadow-inner">
        <button
          onClick={() => setActiveSheet('hoja1')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSheet === 'hoja1'
              ? 'bg-gradient-to-r from-[#bce0fd] via-[#dcbbf8] to-[#fbcfe8] text-neutral-950 shadow-md font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-[#191b29]'
          }`}
        >
          <Calculator className="w-4 h-4 shrink-0" />
          <span className="truncate">1. Costos & Ganancia</span>
        </button>

        <button
          onClick={() => setActiveSheet('hoja2')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSheet === 'hoja2'
              ? 'bg-gradient-to-r from-[#bce0fd] via-[#dcbbf8] to-[#fbcfe8] text-neutral-950 shadow-md font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-[#191b29]'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span className="truncate">2. Insumos (g y ml)</span>
        </button>

        <button
          onClick={() => setActiveSheet('hoja3')}
          className={`flex items-center justify-center gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSheet === 'hoja3'
              ? 'bg-gradient-to-r from-[#bce0fd] via-[#dcbbf8] to-[#fbcfe8] text-neutral-950 shadow-md font-bold'
              : 'text-neutral-300 hover:text-white hover:bg-[#191b29]'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate">3. Receta & Cantidades</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* HOJA 1: PRODUCTOS, MATERIALES EXACTOS Y CÁLCULO DE GANANCIA              */}
      {/* ========================================================================= */}
      {activeSheet === 'hoja1' && (
        <div className="space-y-6">
          {/* Header Card for Product Selection and Profit Margin Control */}
          <div className="bg-[#151624] border border-[#27293d] rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f48fb1]" />
                  <span className="text-xs font-semibold text-[#f48fb1] uppercase tracking-wider">
                    Hoja 1: Escandallo & Rentabilidad
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif-brand font-bold text-white mt-1">
                  {currentReceta.nombre}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Rendimiento: {currentReceta.rendimiento} · Peso aprox: {currentReceta.pesoAproximadoGramos}g
                </p>
              </div>

              {/* Interactive Profit Margin Slider */}
              <div className="w-full md:w-80 bg-[#1a1c2e] p-3.5 rounded-2xl border border-[#30344d]">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-neutral-300">Margen de Ganancia Deseado:</span>
                  <span className="text-base font-bold text-[#f48fb1]">{margenGanancia}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={margenGanancia}
                  onChange={(e) => setMargenGanancia(Number(e.target.value))}
                  className="w-full h-2 bg-[#25283b] rounded-lg appearance-none cursor-pointer accent-[#f48fb1]"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                  <span>30% (Económico)</span>
                  <span>75% (Recomendado)</span>
                  <span>150% (Exclusivo)</span>
                </div>
              </div>
            </div>

            {/* Financial Highlights Bento */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-[#10111a] p-3 rounded-xl border border-[#232537]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-blue-400" />
                  Materia Prima (Hoja 2)
                </span>
                <p className="text-lg sm:text-xl font-bold text-white mt-1">
                  {formatMoney(costingCalculation.subtotalMateriaPrima)}
                </p>
                <span className="text-[10px] text-neutral-500">Harina, manteca, chocolates, etc.</span>
              </div>

              <div className="bg-[#10111a] p-3 rounded-xl border border-[#232537]">
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Empaque & Servicios
                </span>
                <p className="text-lg sm:text-xl font-bold text-white mt-1">
                  {formatMoney(
                    costingCalculation.subtotalEmpaque +
                      costingCalculation.subtotalServicios +
                      costingCalculation.subtotalManoObra
                  )}
                </p>
                <span className="text-[10px] text-neutral-500">Caja alta, disco, cinta, gas, labor</span>
              </div>

              <div className="bg-[#10111a] p-3 rounded-xl border border-[#3b243d]">
                <span className="text-[11px] text-[#f48fb1] flex items-center gap-1 font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-[#f48fb1]" />
                  Costo Total de Elaboración
                </span>
                <p className="text-lg sm:text-xl font-black text-[#fbcfe8] mt-1">
                  {formatMoney(costingCalculation.costoTotalProduccion)}
                </p>
                <span className="text-[10px] text-pink-300/70">Costo real de producir 1 Matilda</span>
              </div>

              <div className="bg-gradient-to-br from-[#1b2b22] to-[#122019] p-3 rounded-xl border border-emerald-500/40">
                <span className="text-[11px] text-emerald-300 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Precio Sugerido ({margenGanancia}%)
                </span>
                <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
                  {formatMoney(costingCalculation.precioSugeridoVenta)}
                </p>
                <span className="text-[10px] text-emerald-300/80">
                  Ganancia neta: {formatMoney(costingCalculation.gananciaNeta)}
                </span>
              </div>
            </div>
          </div>

          {/* Table: Exact Materials & Insumos Cost Breakdown */}
          <div className="bg-[#151624] border border-[#27293d] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#242636] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-serif-brand text-base sm:text-lg font-bold text-white">
                  Materiales Exactos y Costos Calculados
                </h3>
                <p className="text-xs text-neutral-400">
                  Los costos unitarios ($/g y $/ml) se obtienen de la <strong>Hoja 2</strong> de insumos
                </p>
              </div>
              <div className="text-xs font-semibold text-neutral-300 px-3 py-1 rounded-full bg-[#1b1c2b] border border-[#2f3246]">
                Total Ingredientes: {costingCalculation.ingredientesDetallados.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#10111a] text-neutral-400 text-[11px] uppercase tracking-wider border-b border-[#222434]">
                  <tr>
                    <th className="py-3 px-4">Sección</th>
                    <th className="py-3 px-4">Material / Insumo</th>
                    <th className="py-3 px-4 text-center">Cantidad Exacta</th>
                    <th className="py-3 px-4 text-right">Costo Unit. (Hoja 2)</th>
                    <th className="py-3 px-4 text-right font-bold text-white">Subtotal ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202232] text-neutral-200">
                  {costingCalculation.ingredientesDetallados.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#1b1d2c] transition-colors">
                      <td className="py-2.5 px-4 font-medium text-neutral-400 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#1d1f2e] border border-[#2b2e42] text-[11px]">
                          {item.seccion}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {item.nombre}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">
                        <span className="font-bold text-[#f48fb1]">{item.cantidad}</span>{' '}
                        <span className="text-neutral-400 text-xs">{item.unidad}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-neutral-400 text-xs whitespace-nowrap">
                        {formatUnitCost(item.costoUnitario, item.unidad)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-white whitespace-nowrap">
                        {formatMoney(item.costoTotal)}
                      </td>
                    </tr>
                  ))}

                  {/* Adicionales (Mano de obra) */}
                  {currentReceta.costosAdicionales.map((item, idx) => (
                    <tr key={`adic-${idx}`} className="bg-[#171827]/70">
                      <td className="py-2.5 px-4 font-medium text-neutral-400 text-xs">
                        <span className="px-2 py-0.5 rounded-md bg-[#251e33] text-pink-300 border border-[#432d56] text-[11px]">
                          Mano de Obra
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-white italic">{item.concepto}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-neutral-400">1 serv.</td>
                      <td className="py-2.5 px-4 text-right font-mono text-neutral-400 text-xs">
                        {formatMoney(item.monto)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                        {formatMoney(item.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Footer Totals */}
                <tfoot className="bg-[#10111a] border-t-2 border-[#2b2e40] font-semibold text-xs sm:text-sm">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right text-neutral-300">
                      COSTO TOTAL DE PRODUCCIÓN:
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-base text-[#f48fb1]">
                      {formatMoney(costingCalculation.costoTotalProduccion)}
                    </td>
                  </tr>
                  <tr className="text-emerald-400 bg-emerald-950/20">
                    <td colSpan={4} className="py-2.5 px-4 text-right">
                      PRECIO SUGERIDO AL PÚBLICO (Margen {margenGanancia}%):
                    </td>
                    <td className="py-2.5 px-4 text-right font-black font-mono text-base text-emerald-400">
                      {formatMoney(costingCalculation.precioSugeridoVenta)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 2: TABLA MAESTRA DE INSUMOS (Por Gramos y Mililitros)                */}
      {/* ========================================================================= */}
      {activeSheet === 'hoja2' && (
        <div className="space-y-4">
          <div className="bg-[#151624] border border-[#27293d] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#70c0f8]" />
                  <span className="text-xs font-semibold text-[#70c0f8] uppercase tracking-wider">
                    Hoja 2: Costos Unitarios
                  </span>
                </div>
                <h2 className="text-xl font-serif-brand font-bold text-white mt-0.5">
                  Tabla de Insumos (Por Gramos y Mililitros)
                </h2>
                <p className="text-xs text-neutral-400">
                  Ingresa el precio de compra del paquete o botella y el sistema calcula automáticamente el costo por <strong>gramo ($/g)</strong> y por <strong>mililitro ($/ml)</strong>.
                </p>
              </div>

              <button
                onClick={handleResetInsumos}
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors underline cursor-pointer"
              >
                Restablecer precios iniciales
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={insumoSearch}
                  onChange={(e) => setInsumoSearch(e.target.value)}
                  placeholder="Buscar harina, manteca, chocolate, leche, esencia..."
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#11121c] border border-[#2a2c3e] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#70c0f8]"
                />
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'solido', label: 'Sólidos (g)' },
                    { id: 'liquido', label: 'Líquidos (ml)' },
                    { id: 'empaque', label: 'Empaque (un)' },
                    { id: 'servicio', label: 'Servicios' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setInsumoCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      insumoCategory === cat.id
                        ? 'bg-[#70c0f8] text-neutral-950 shadow'
                        : 'bg-[#1a1c2a] text-neutral-300 hover:text-white border border-[#2b2d40]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insumos Table */}
          <div className="bg-[#151624] border border-[#27293d] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#10111a] text-neutral-400 text-[11px] uppercase tracking-wider border-b border-[#222434]">
                  <tr>
                    <th className="py-3 px-4">Insumo / Ingrediente</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Presentación de Compra</th>
                    <th className="py-3 px-4 text-right">Precio de Compra ($)</th>
                    <th className="py-3 px-4 text-right font-bold text-white bg-[#141824]">
                      Costo Unitario ($/g o $/ml)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202232] text-neutral-200">
                  {filteredInsumos.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1b1d2c] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{item.nombre}</div>
                        {item.notas && (
                          <div className="text-[11px] text-neutral-400 mt-0.5">{item.notas}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.categoria === 'solido'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                              : item.categoria === 'liquido'
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                              : item.categoria === 'empaque'
                              ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {item.categoria === 'solido'
                            ? 'SÓLIDO (g)'
                            : item.categoria === 'liquido'
                            ? 'LÍQUIDO (ml)'
                            : item.categoria === 'empaque'
                            ? 'EMPAQUE'
                            : 'SERVICIO'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-300 whitespace-nowrap">
                        {item.presentacionCompra}
                      </td>
                      {/* Editable Purchase Price */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-[#10111a] px-2 py-1 rounded-lg border border-[#2b2d3f] focus-within:border-[#f48fb1]">
                          <span className="text-neutral-500 text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={item.precioCompra}
                            onChange={(e) =>
                              updateInsumoPrecio(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-20 text-right bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                          />
                        </div>
                      </td>
                      {/* Calculated Unit Cost ($/g or $/ml) */}
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap bg-[#141824]">
                        <span className="text-[#70c0f8] text-sm">
                          ${item.costoPorUnidad.toFixed(2)}
                        </span>{' '}
                        <span className="text-neutral-400 text-xs font-normal">
                          / {item.unidadCosteo}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOJA 3: RECETA CON CANTIDADES E INSTRUCCIONES TÉCNICAS                     */}
      {/* ========================================================================= */}
      {activeSheet === 'hoja3' && (
        <div className="space-y-6">
          <div className="bg-[#151624] border border-[#27293d] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ce93d8]" />
                  <span className="text-xs font-semibold text-[#ce93d8] uppercase tracking-wider">
                    Hoja 3: Ficha Técnica & Receta
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif-brand font-bold text-white mt-1">
                  {currentReceta.nombre}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-pink-300" />
                    Horneado: 35 min a 170°C
                  </span>
                  <span>·</span>
                  <span>Molde: 20 cm (3 capas)</span>
                  <span>·</span>
                  <span>Rendimiento: 14 porciones</span>
                </div>
              </div>
            </div>

            {/* Receta: Cantidades exactas en gramos y mililitros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Sección 1: Bizcocho Matilda */}
              <div className="bg-[#10111a] p-4 rounded-xl border border-[#242636] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#222434]">
                  <h4 className="font-serif-brand font-bold text-white text-base">
                    1. Bizcocho Húmedo de Chocolate
                  </h4>
                  <span className="text-[11px] font-semibold text-pink-300 bg-[#2b1f33] px-2 py-0.5 rounded-md">
                    Masa Base
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {currentReceta.ingredientes
                    .filter((i) => i.seccion === 'Bizcocho Húmedo')
                    .map((ing, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-[#1b1c28] last:border-0"
                      >
                        <span className="text-neutral-200">{ing.nombre}</span>
                        <span className="font-mono font-bold text-white bg-[#191a26] px-2 py-0.5 rounded-md border border-[#292c3d]">
                          {ing.cantidad} {ing.unidad}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Sección 2: Relleno y Cobertura Fudge */}
              <div className="bg-[#10111a] p-4 rounded-xl border border-[#242636] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#222434]">
                  <h4 className="font-serif-brand font-bold text-white text-base">
                    2. Relleno & Fudge Cremoso
                  </h4>
                  <span className="text-[11px] font-semibold text-purple-300 bg-[#261f36] px-2 py-0.5 rounded-md">
                    Ganache & Relleno
                  </span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {currentReceta.ingredientes
                    .filter((i) => i.seccion === 'Relleno y Cobertura Fudge')
                    .map((ing, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between py-1 border-b border-[#1b1c28] last:border-0"
                      >
                        <span className="text-neutral-200">{ing.nombre}</span>
                        <span className="font-mono font-bold text-white bg-[#191a26] px-2 py-0.5 rounded-md border border-[#292c3d]">
                          {ing.cantidad} {ing.unidad}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Procedimiento artesanal paso a paso */}
            <div className="pt-4 border-t border-[#232537] space-y-3">
              <h3 className="font-serif-brand font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f48fb1]" />
                Procedimiento de Elaboración en Taller CRISÉ
              </h3>
              <div className="space-y-3">
                {currentReceta.instrucciones.map((inst) => (
                  <div
                    key={inst.paso}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#10111a] border border-[#232536]"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#f48fb1] text-neutral-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {inst.paso}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{inst.titulo}</h4>
                      <p className="text-neutral-300 text-xs sm:text-sm mt-1 leading-relaxed">
                        {inst.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Google Sheets Integration Card */}
      <div className="bg-[#12141f] border border-[#282b3d] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1c2233] border border-[#303850] flex items-center justify-center text-[#34A853] shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">
              ¿Cómo usar esta planilla en tu Google Drive?
            </h4>
            <p className="text-xs text-neutral-400 mt-0.5 max-w-xl">
              Haz clic en <strong>Descargar Planilla (.xlsx)</strong>, luego ábrela en Google Drive con <em>"Abrir con Hojas de cálculo de Google"</em>. Todas las fórmulas y tablas ya vienen listas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenSheetsSync}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#191c2b] border border-[#32364c] hover:border-[#f48fb1] text-neutral-200 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Configurar Conexión Sheets</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
