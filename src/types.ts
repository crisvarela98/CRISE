export interface Product {
  id: string;
  sku?: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo?: number;
  descripcion: string;
  imagen: string;
  disponible: boolean;
  destacado?: boolean;
  porciones?: string;
  alergenos?: string[];
  tiempoAnticipacion?: string;
}

export interface CartItem {
  product: Product;
  cantidad: number;
  aclaracion?: string;
}

export interface CustomerOrder {
  nombre: string;
  telefono: string;
  direccion: string;
  tipoEntrega: 'delivery' | 'takeaway';
  fechaEntrega?: string;
  horaEntrega?: string;
  metodoPago: 'transferencia' | 'efectivo' | 'mercadopago';
  notas?: string;
}

export interface GoogleSheetConfig {
  sheetIdOrUrl: string;
  lastSync: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  itemCount: number;
}
