import React, { useState, useRef } from 'react';
import { GoogleSheetConfig, Product } from '../types';
import {
  X,
  Sheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  FileSpreadsheet,
  RotateCcw,
  HelpCircle,
  Upload,
  FileText,
} from 'lucide-react';
import {
  fetchProductsFromGoogleSheet,
  resetToDefaultCatalog,
  SAMPLE_SHEET_CSV_TEMPLATE,
  importProductsFromCSVText,
} from '../services/googleSheets';
import { downloadCostingExcel } from '../services/costingExcel';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetConfig;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateConfig: (config: GoogleSheetConfig) => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateProducts,
  onUpdateConfig,
}) => {
  const [sheetInput, setSheetInput] = useState(config.sheetIdOrUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'sheet' | 'file'>('sheet');
  const [csvPasteText, setCsvPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | null;
    text: string;
  }>({
    type: config.status === 'success' ? 'success' : null,
    text: config.status === 'success' ? `Catálogo conectado (${config.itemCount} productos)` : '',
  });
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCsvContent(text);
      }
    };
    reader.readAsText(file);
  };

  const processCsvContent = (text: string) => {
    setIsLoading(true);
    const result = importProductsFromCSVText(text);
    setIsLoading(false);
    if (result.success && result.products.length > 0) {
      onUpdateProducts(result.products);
      const newConfig: GoogleSheetConfig = {
        sheetIdOrUrl: 'archivo_csv_cargado',
        lastSync: new Date().toISOString(),
        status: 'success',
        itemCount: result.products.length,
      };
      onUpdateConfig(newConfig);
      setStatusMessage({
        type: 'success',
        text: `¡Éxito! Se cargaron ${result.products.length} productos desde el archivo CSV.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message || 'Error al procesar el archivo CSV.',
      });
    }
  };

  const handleSync = async () => {
    if (!sheetInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Por favor pega el link o ID de tu archivo de Google Sheets.',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({
      type: 'info',
      text: 'Conectando con Google Sheets y descargando productos...',
    });

    const result = await fetchProductsFromGoogleSheet(sheetInput);
    setIsLoading(false);

    if (result.success) {
      onUpdateProducts(result.products);
      const newConfig: GoogleSheetConfig = {
        sheetIdOrUrl: sheetInput,
        lastSync: new Date().toISOString(),
        status: 'success',
        itemCount: result.products.length,
      };
      onUpdateConfig(newConfig);
      setStatusMessage({
        type: 'success',
        text: result.message,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message,
      });
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Deseas vaciar y eliminar todos los productos de la app?')) {
      const emptyProds = resetToDefaultCatalog();
      onUpdateProducts(emptyProds);
      setSheetInput('');
      const newConfig: GoogleSheetConfig = {
        sheetIdOrUrl: '',
        lastSync: null,
        status: 'idle',
        itemCount: 0,
      };
      onUpdateConfig(newConfig);
      setStatusMessage({
        type: 'info',
        text: 'Se eliminaron todos los productos de la aplicación.',
      });
    }
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_SHEET_CSV_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#171822] border border-[#2c2f3f] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#242735] bg-[#14151c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#34A853]/20 border border-[#34A853]/40 flex items-center justify-center text-[#34A853]">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Control de Productos con Google Sheets
              </h2>
              <p className="text-neutral-400 text-xs">
                Actualiza precios, disponibilidad y nuevos productos en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#20222e] hover:bg-[#2b2e3e] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5 text-sm">
          {/* Status Message if any */}
          {statusMessage.text && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-700/50 text-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/40 border border-rose-700/50 text-rose-200'
                  : 'bg-sky-950/40 border border-sky-700/50 text-sky-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-sky-400 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* Mode Selector */}
          <div className="flex bg-[#12131a] p-1 rounded-2xl border border-[#232635] gap-1">
            <button
              type="button"
              onClick={() => setActiveMode('sheet')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'sheet'
                  ? 'bg-[#252838] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sheet className="w-3.5 h-3.5 text-[#34A853]" />
              <span>Google Sheets (Enlace Web)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('file')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                activeMode === 'file'
                  ? 'bg-[#252838] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#F48FB1]" />
              <span>Subir Archivo CSV</span>
            </button>
          </div>

          {activeMode === 'sheet' ? (
            <>
              {/* Input for Sheet URL or ID */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                  Enlace o ID de tu Google Sheet
                </label>
                <div className="flex gap-2">
                  <input
                    id="google-sheet-url-input"
                    type="text"
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0X.../edit"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-[#1f212d] border border-[#2f3244] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#70C0F8]"
                  />
                  <button
                    id="sync-google-sheet-action"
                    type="button"
                    onClick={handleSync}
                    disabled={isLoading}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#34A853] to-[#2E8B57] hover:brightness-110 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Sincronizando...' : 'Sincronizar'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Pega la URL completa de tu Google Sheet desde el navegador. La web se actualizará automáticamente.
                </p>
              </div>

              {/* Instructions Step-by-Step */}
              <div className="p-4 rounded-2xl bg-[#14151c] border border-[#252837] space-y-3">
                <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#F48FB1]" />
                  ¿Cómo configurar tu hoja en 3 simples pasos?
                </h4>

                <ol className="space-y-2.5 text-xs text-neutral-300 list-decimal list-inside leading-relaxed">
                  <li className="pl-1">
                    <strong className="text-white">Crea tu hoja en Google Sheets:</strong> con las columnas <code className="text-[#F48FB1] bg-[#1d1f2b] px-1 py-0.5 rounded">SKU, NOMBRE, DESCRIPCION, COSTO, IMAGEN</code>.
                  </li>
                  <li className="pl-1">
                    <strong className="text-white">Habilita acceso de lectura:</strong> En Google Sheets haz clic en <span className="text-[#70C0F8] font-semibold">Compartir</span> &gt; <span className="text-white font-semibold">Acceso general</span> &gt; Selecciona <span className="text-emerald-400 font-semibold">"Cualquier persona con el enlace"</span> (en modo Lector).
                  </li>
                  <li className="pl-1">
                    <strong className="text-white">Pega el enlace aquí:</strong> Copia el enlace y presiona <span className="text-[#34A853] font-semibold">"Sincronizar"</span>.
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* File upload box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2f3246] hover:border-[#F48FB1] rounded-2xl p-6 text-center bg-[#13141d] hover:bg-[#181a24] transition-all cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-[#202230] group-hover:bg-[#F48FB1]/20 flex items-center justify-center text-neutral-400 group-hover:text-[#F48FB1] transition-colors mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">
                  Haz clic para seleccionar tu archivo CSV
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Arrastra o selecciona el archivo CSV exportado desde Excel o Google Sheets
                </p>
              </div>

              {/* Or paste CSV text */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>O pega el texto CSV directamente:</span>
                </label>
                <textarea
                  value={csvPasteText}
                  onChange={(e) => setCsvPasteText(e.target.value)}
                  placeholder="SKU,NOMBRE,DESCRIPCION,COSTO,IMAGEN&#10;CRISE000001,Torta Matilda,&quot;...&quot;,&quot;53.500,00&quot;,https://..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#1b1d28] border border-[#2b2e40] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (csvPasteText.trim()) {
                      processCsvContent(csvPasteText);
                      setCsvPasteText('');
                    }
                  }}
                  disabled={!csvPasteText.trim()}
                  className="w-full py-2 rounded-xl bg-[#F48FB1] hover:brightness-110 text-neutral-900 font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                >
                  Importar y Actualizar Catálogo
                </button>
              </div>
            </div>
          )}

          {/* Internal Private Costing & Recipe Excel Workbook Download (For owner only) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c16] to-[#0e1611] border border-emerald-500/30 space-y-3 shadow-inner">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Planilla Excel Interna (Privada)
                  </h4>
                  <p className="text-[11px] text-emerald-200/80">
                    3 Hojas: 1. Costos y Ganancia · 2. Insumos (g y ml) · 3. Receta con Cantidades
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadCostingExcel()}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#217346] to-[#1e663d] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
                title="Descargar archivo Excel .xlsx privado de CRISÉ"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Descargar Excel</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Archivo confidencial para uso exclusivo del negocio. Al descargarlo podrás abrirlo en Excel o Google Drive para calcular rentabilidad, costo por gramo/mililitro y gramajes de recetas sin que los clientes lo vean.
            </p>
          </div>

          {/* Column structure guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Columnas en tu Google Sheet:
              </span>
              <button
                type="button"
                onClick={copyTemplate}
                className="text-xs text-[#F48FB1] hover:text-pink-300 flex items-center gap-1 font-semibold"
                title="Copiar encabezados y datos de muestra"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar formato de columnas</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#111218] border border-[#272938] font-mono text-[11px] text-neutral-200 overflow-x-auto whitespace-nowrap space-y-1">
              <div>
                <span className="text-[#70C0F8] font-bold">SKU</span>, <span className="text-white font-bold">NOMBRE</span>, <span className="text-purple-300">DESCRIPCION</span>, <span className="text-emerald-400 font-bold">COSTO</span>, <span className="text-amber-300">IMAGEN</span>
              </div>
            </div>
            <p className="text-[11px] text-neutral-400">
              ⚡ <strong>Sincronización automática silenciosa:</strong> La tienda actualiza el catálogo en segundo plano de forma automática cada 4 horas y al iniciar sesión, 100% invisible para tus clientes.
            </p>
            <p className="text-[10px] text-neutral-500">
              💡 <strong>Atajo rápido:</strong> Puedes abrir este panel en cualquier momento presionando <kbd className="px-1.5 py-0.5 rounded bg-[#1e202d] text-neutral-300 font-mono text-[10px] border border-neutral-700">Ctrl + Shift + A</kbd> o tocando el discreto candado de "Gestión interna" al final de la página.
            </p>
          </div>

          {/* Reset button */}
          <div className="pt-2 flex items-center justify-between border-t border-[#232635] text-xs">
            <button
              type="button"
              onClick={handleReset}
              className="text-neutral-400 hover:text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar / Eliminar todos los productos</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#20222e] hover:bg-[#2b2e3e] text-white font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
