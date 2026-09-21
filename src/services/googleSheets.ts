import { Product } from '../types';
import { DEFAULT_PRODUCTS } from '../data/defaultProducts';

const STORAGE_KEY_PRODUCTS = 'crise_patisserie_products';
const STORAGE_KEY_SHEET_CONFIG = 'crise_patisserie_sheet_config';

export interface SheetParseResult {
  products: Product[];
  success: boolean;
  message: string;
}

export function extractSheetId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // If it's a published web link (/d/e/2PACX-.../pub)
  const pubMatch = trimmed.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/);
  if (pubMatch && pubMatch[1]) {
    return `pub:${pubMatch[1]}`;
  }

  // If it's already an ID (alphanumeric, dashes, underscores, usually 30-50 chars)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex to extract from standard Google Sheets URL
  // e.g. https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines: string[] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of CRLF
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some(c => c.length > 0)) {
        // Only push non-empty rows
        lines.push(JSON.stringify(currentRow));
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      lines.push(JSON.stringify(currentRow));
    }
  }

  if (lines.length < 2) return [];

  const headers: string[] = JSON.parse(lines[0]).map((h: string) => 
    h.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  const results: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const row: string[] = JSON.parse(lines[r]);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index].replace(/^"|"$/g, '').trim() : '';
    });
    results.push(obj);
  }

  return results;
}

export function mapRowToProduct(row: Record<string, string>, index: number): Product | null {
  // Find fields flexibly (supports lowercase, accents removed)
  const getField = (...possibleNames: string[]): string => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== '') {
        return row[name];
      }
    }
    return '';
  };

  const nombre = getField('nombre', 'titulo', 'producto', 'name', 'title');
  if (!nombre) return null;

  const sku = getField('sku', 'id', 'codigo', 'cod', 'item');
  const id = sku || `prod-${index + 1}`;

  // Parse Costo & Precio with full support for Argentine currency (e.g. 18.200, 31.000, 35000)
  const parseNumber = (val: string): number => {
    if (!val) return 0;
    let str = val.trim().replace(/[$£€\s]/g, '');
    if (!str) return 0;

    // Dot as thousands, comma as decimal (e.g. 18.200,50)
    if (str.includes('.') && str.includes(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
      return parseFloat(str) || 0;
    }

    // Multiple dots (e.g. 1.200.000)
    if ((str.match(/\./g) || []).length > 1) {
      str = str.replace(/\./g, '');
      return parseFloat(str) || 0;
    }

    // Single dot with exactly 3 digits after it (e.g. 18.200, 31.000, 35.000, 8.500)
    if (/^\d+\.\d{3}$/.test(str)) {
      str = str.replace('.', '');
      return parseFloat(str) || 0;
    }

    // Single comma with 3 digits after it (e.g. 18,200)
    if (/^\d+,\d{3}$/.test(str)) {
      str = str.replace(',', '');
      return parseFloat(str) || 0;
    }

    // Comma as decimal separator (e.g. 18,50)
    if (str.includes(',')) {
      str = str.replace(',', '.');
    }

    return parseFloat(str) || 0;
  };

  const rawCosto = getField('costo', 'cost', 'costo_total', 'costototal', 'costo_elaboracion', 'costo unitario');
  const costo = rawCosto ? parseNumber(rawCosto) : undefined;

  const rawPrecio = getField('precio', 'price', 'preciodeventa', 'precio_de_venta', 'precioventa', 'pvp', 'valor', 'importe', 'precio final');
  let precio = rawPrecio ? parseNumber(rawPrecio) : 0;

  // If precio is not specified in the CSV, but COSTO exists, the store price is the value in COSTO
  if (precio === 0 && costo && costo > 0) {
    precio = costo;
  } else if (precio === 0) {
    precio = 53500;
  }

  const categoria = getField('categoria', 'category', 'rubro', 'tipo') || 'Tartas Personalizadas';
  const descripcion = getField('descripcion', 'description', 'detalle') || '';
  
  let imagen = getField('imagen', 'image', 'foto', 'url_imagen', 'img');
  if (!imagen || !imagen.startsWith('http')) {
    imagen = 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80';
  }

  const rawDisponible = getField('disponible', 'disponibilidad', 'stock', 'activo', 'available');
  let disponible = true;
  if (rawDisponible) {
    const val = rawDisponible.toLowerCase();
    if (val === 'no' || val === 'false' || val === '0' || val === 'agotado') {
      disponible = false;
    }
  }

  const rawDestacado = getField('destacado', 'featured', 'estrella');
  const destacado = ['si', 'true', '1', 'yes'].includes(rawDestacado.toLowerCase()) || true;

  const porciones = getField('porciones', 'portions', 'rinde', 'tamano') || '12 a 15 porciones';
  const tiempoAnticipacion = getField('tiempoanticipacion', 'anticipacion', 'demora', 'preaviso') || '24 hs de anticipación';

  return {
    id,
    sku: sku || undefined,
    nombre,
    categoria,
    precio,
    costo: costo || undefined,
    descripcion,
    imagen,
    disponible,
    destacado,
    porciones,
    tiempoAnticipacion
  };
}

export async function fetchProductsFromGoogleSheet(sheetIdOrUrl: string): Promise<SheetParseResult> {
  const sheetId = extractSheetId(sheetIdOrUrl);
  if (!sheetId) {
    return {
      products: [],
      success: false,
      message: 'ID o URL de Google Sheet no válida. Asegúrate de pegar el link completo del documento.'
    };
  }

  const timestamp = Date.now();
  const candidateUrls: string[] = [];

  if (sheetId.startsWith('pub:')) {
    const pubKey = sheetId.replace('pub:', '');
    candidateUrls.push(`https://docs.google.com/spreadsheets/d/e/${pubKey}/pub?output=csv&_t=${timestamp}`);
  } else {
    // Attempt using the GViz public CSV endpoint (real-time, immediate update)
    candidateUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&_t=${timestamp}`);
    candidateUrls.push(`https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&_t=${timestamp}`);
  }

  try {
    let response: Response | null = null;
    for (const url of candidateUrls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          response = res;
          break;
        }
      } catch (err) {
        // try next candidate
      }
    }

    if (!response || !response.ok) {
      throw new Error(`No se pudo conectar a la hoja. Verifica que en Google Sheets esté compartida como "Cualquier persona con el enlace puede ser lector" o "Publicada en la web".`);
    }

    const csvText = await response.text();
    
    // Check if Google returned an HTML login page instead of CSV
    if (csvText.includes('<!DOCTYPE html>') || csvText.includes('<html') || csvText.includes('google-signin')) {
      return {
        products: [],
        success: false,
        message: 'El documento no tiene acceso público. En Google Sheets ve a: Compartir > "Cualquier persona con el enlace" -> "Lector".'
      };
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      return {
        products: [],
        success: false,
        message: 'No se encontraron filas con datos en la hoja de cálculo. Verifica que tenga una fila de encabezados.'
      };
    }

    const products: Product[] = [];
    rows.forEach((row, i) => {
      const p = mapRowToProduct(row, i);
      if (p) products.push(p);
    });

    if (products.length === 0) {
      return {
        products: [],
        success: false,
        message: 'No se pudieron mapear productos. Asegúrate de tener al menos las columnas "Nombre" y "Precio".'
      };
    }

    // Save to local cache
    saveProductsToLocalStorage(products);
    saveSheetConfig({
      sheetIdOrUrl,
      lastSync: new Date().toISOString(),
      status: 'success',
      itemCount: products.length
    });

    return {
      products,
      success: true,
      message: `¡Se sincronizaron con éxito ${products.length} productos desde Google Sheets!`
    };
  } catch (error: any) {
    console.error('Error fetching Google Sheet:', error);
    return {
      products: [],
      success: false,
      message: error?.message || 'Error de conexión con Google Sheets. Verifica los permisos de la hoja.'
    };
  }
}

export function importProductsFromCSVText(csvText: string): SheetParseResult {
  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return {
      products: [],
      success: false,
      message: 'No se encontraron filas con datos en el archivo CSV.'
    };
  }

  const products: Product[] = [];
  rows.forEach((row, i) => {
    const p = mapRowToProduct(row, i);
    if (p) products.push(p);
  });

  if (products.length === 0) {
    return {
      products: [],
      success: false,
      message: 'No se pudieron mapear productos. Asegúrate de tener al menos las columnas "NOMBRE" y "COSTO" o "PRECIO".'
    };
  }

  saveProductsToLocalStorage(products);
  saveSheetConfig({
    sheetIdOrUrl: 'csv_upload',
    lastSync: new Date().toISOString(),
    status: 'success',
    itemCount: products.length
  });

  return {
    products,
    success: true,
    message: `¡Se importaron ${products.length} productos con éxito!`
  };
}

export function getCachedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate old default product price if still present
        const updated = parsed.map((p: Product) => {
          if (p.id === 'CRISE000001' && (p.precio === 31000 || p.costo === 18200)) {
            return { ...p, precio: 53500, costo: 53500 };
          }
          return p;
        });
        return updated;
      }
    }
  } catch (e) {
    console.warn('Could not read cached products', e);
  }
  return DEFAULT_PRODUCTS;
}

export function clearProductsStorage(): Product[] {
  try {
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem('crise_patisserie_cart');
  } catch (e) {
    console.error('Failed to clear products storage', e);
  }
  return [];
}

export function saveProductsToLocalStorage(products: Product[]) {
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to localStorage', e);
  }
}

export const AUTO_SYNC_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Can be set via environment variable or pasted by the store owner
export const DEFAULT_SHEET_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_SHEET_URL) || '';

export function isSyncExpired(lastSync: string | null): boolean {
  if (!lastSync) return true;
  try {
    const last = new Date(lastSync).getTime();
    const now = Date.now();
    return (now - last) >= AUTO_SYNC_INTERVAL_MS;
  } catch {
    return true;
  }
}

export function getSheetConfig(): {
  sheetIdOrUrl: string;
  lastSync: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  itemCount: number;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHEET_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.sheetIdOrUrl && DEFAULT_SHEET_URL) {
        parsed.sheetIdOrUrl = DEFAULT_SHEET_URL;
      }
      return parsed;
    }
  } catch (e) {
    // fallback
  }
  return {
    sheetIdOrUrl: DEFAULT_SHEET_URL || '',
    lastSync: null,
    status: 'idle',
    itemCount: DEFAULT_PRODUCTS.length
  };
}

export function saveSheetConfig(config: any) {
  try {
    localStorage.setItem(STORAGE_KEY_SHEET_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save sheet config', e);
  }
}

export function resetToDefaultCatalog(): Product[] {
  clearProductsStorage();
  saveSheetConfig({
    sheetIdOrUrl: '',
    lastSync: null,
    status: 'idle',
    itemCount: 0
  });
  return [];
}

export const SAMPLE_SHEET_CSV_TEMPLATE = `SKU,NOMBRE,DESCRIPCION,COSTO,IMAGEN
CRISE000001,"Torta Matilda","Esta torta de película, intensamente chocolatosa, es perfecta para cumpleaños y meriendas golosas.",18200,"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ818KPQaU96mQhYFO2QMeBAly_7usYSCcsSfZPsdZwpnwPGv5fOdZQIyc&s=10"
`;
