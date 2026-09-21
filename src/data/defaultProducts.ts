import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'CRISE000001',
    sku: 'CRISE000001',
    nombre: 'Torta Matilda',
    categoria: 'Tartas Personalizadas',
    costo: 53500,
    precio: 53500,
    descripcion: 'Esta torta de película, intensamente chocolatosa, es perfecta para cumpleaños y meriendas golosas.',
    imagen: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ818KPQaU96mQhYFO2QMeBAly_7usYSCcsSfZPsdZwpnwPGv5fOdZQIyc&s=10',
    disponible: true,
    destacado: true,
    porciones: '12 a 14 porciones generosas',
    tiempoAnticipacion: '24 hs de anticipación'
  }
];

