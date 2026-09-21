import React, { useState } from 'react';
import { CartItem, CustomerOrder } from '../types';
import { ArrowLeft, ShoppingBag, Trash2, Plus, Minus, Check } from 'lucide-react';

interface CartViewProps {
  cartItems: CartItem[];
  onBackToCatalog: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  onBackToCatalog,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  // Default date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState<CustomerOrder>({
    nombre: '',
    telefono: '',
    direccion: '',
    tipoEntrega: 'delivery',
    fechaEntrega: defaultDateStr,
    horaEntrega: '16:00 - 18:00 hs',
    metodoPago: 'transferencia',
    notas: '',
  });

  const [errorMsg, setErrorMsg] = useState<string>('');

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.precio * item.cantidad,
    0
  );

  const costoEnvio = formData.tipoEntrega === 'delivery' ? 2500 : 0;
  const total = subtotal + costoEnvio;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      setErrorMsg('Por favor ingresá tu nombre y apellido.');
      return;
    }
    if (!formData.telefono.trim()) {
      setErrorMsg('Por favor ingresá tu teléfono o WhatsApp de contacto.');
      return;
    }
    if (formData.tipoEntrega === 'delivery' && !formData.direccion.trim()) {
      setErrorMsg('Por favor ingresá tu dirección para coordinar el envío a domicilio.');
      return;
    }

    setErrorMsg('');

    // Generate WhatsApp text
    let msg = `🧁 *NUEVO PEDIDO - CRISÉ PÂTISSERIE* 🧁\n\n`;
    msg += `👤 *Cliente:* ${formData.nombre.trim()}\n`;
    msg += `📱 *Teléfono:* ${formData.telefono.trim()}\n`;
    msg += `🛵 *Modalidad:* ${
      formData.tipoEntrega === 'delivery' ? 'Envío a Domicilio' : 'Retiro en el local CRISE'
    }\n`;

    if (formData.tipoEntrega === 'delivery' && formData.direccion) {
      msg += `📍 *Dirección de Entrega:* ${formData.direccion.trim()}\n`;
    }

    if (formData.fechaEntrega) {
      msg += `📅 *Fecha deseada:* ${formData.fechaEntrega}\n`;
    }
    if (formData.horaEntrega) {
      msg += `⏰ *Horario estimado:* ${formData.horaEntrega}\n`;
    }

    msg += `\n🍰 *DETALLE DEL PEDIDO:*\n`;
    cartItems.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.nombre}* x${item.cantidad} - ${formatCurrency(
        item.product.precio * item.cantidad
      )}\n`;
    });

    msg += `\n💵 *Subtotal:* ${formatCurrency(subtotal)}\n`;
    if (costoEnvio > 0) {
      msg += `🛵 *Envío a Domicilio:* ${formatCurrency(costoEnvio)}\n`;
    }
    msg += `✨ *TOTAL A ABONAR:* ${formatCurrency(total)}\n`;

    if (formData.notas?.trim()) {
      msg += `\n📝 *Dedicatoria / Aclaraciones:* ${formData.notas.trim()}\n`;
    }

    msg += `\n_Pedido realizado a través de la tienda web de CRISÉ Pâtisserie_`;

    // Pastelería WhatsApp phone number
    const whatsappPhone = '5491123456789';
    const encoded = encodeURIComponent(msg);
    const url = `https://wa.me/${whatsappPhone}?text=${encoded}`;

    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 space-y-6">
      {/* Sub-bar: [ ← VOLVER AL CATÁLOGO CRISE ] on left, "X productos" on right */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#181926] border border-[#2d3042] hover:border-[#f48fb1]/80 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-pink-300" />
          <span>VOLVER AL CATÁLOGO CRISE</span>
        </button>

        <span className="text-xs sm:text-sm text-neutral-300 font-medium">
          {totalItemsCount} {totalItemsCount === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* When Cart is Empty: Screenshot 2 layout */}
      {cartItems.length === 0 ? (
        <div className="rounded-3xl bg-[#141520] border border-[#252838] p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 shadow-xl">
          {/* Outline Bag Icon */}
          <div className="w-20 h-20 rounded-2xl border-2 border-[#f48fb1]/60 bg-[#1c1a29] flex items-center justify-center text-[#f48fb1] shadow-lg">
            <ShoppingBag className="w-10 h-10 stroke-[1.7]" />
          </div>

          <h2 className="font-serif-brand font-bold text-2xl sm:text-3xl text-white">
            Tu carrito está vacío
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base max-w-sm">
            Descubrí nuestras tartas personalizadas y postres artesanales en el catálogo.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToCatalog}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#93c5fd] via-[#d8b4fe] to-[#f472b6] text-neutral-950 font-bold text-xs sm:text-sm tracking-wider uppercase hover:opacity-95 transition-all shadow-lg active:scale-95"
            >
              EXPLORAR CATÁLOGO CRISE
            </button>
          </div>
        </div>
      ) : (
        /* When Cart has Items: Product Review + "Datos de tu Pedido" (Screenshot 3) */
        <div className="space-y-6">
          {/* Items in Cart Card */}
          <div className="rounded-2xl bg-[#141520] border border-[#262838] p-4 sm:p-5 shadow-lg divide-y divide-[#222434]">
            <div className="pb-3 flex items-center justify-between">
              <h3 className="font-serif-brand text-lg font-bold text-white">
                Productos seleccionados
              </h3>
              <span className="text-xs text-neutral-400">
                Revisá tus cantidades
              </span>
            </div>

            <div className="py-2 space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-3 pt-2"
                >
                  <img
                    src={item.product.imagen}
                    alt={item.product.nombre}
                    className="w-14 h-14 rounded-lg object-cover border border-[#2e3144] shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif-brand font-semibold text-sm text-white truncate">
                      {item.product.nombre}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {formatCurrency(item.product.precio)} c/u
                    </p>
                    <p className="text-xs font-bold text-pink-300">
                      Subtotal: {formatCurrency(item.product.precio * item.cantidad)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 bg-[#1c1d28] p-1 rounded-full border border-[#2d3042]">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white px-1.5 min-w-[18px] text-center">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-[#f48fb1] text-neutral-950 hover:bg-pink-400"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Remove item */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-400 text-xs">
                <span>Subtotal productos:</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {formData.tipoEntrega === 'delivery' && (
                <div className="flex justify-between text-neutral-400 text-xs">
                  <span>Envío a Domicilio:</span>
                  <span className="text-white font-medium">{formatCurrency(costoEnvio)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-[#222434]">
                <span>Total a confirmar:</span>
                <span className="text-pink-300">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* "Datos de tu Pedido" Form Card - EXACTLY matching Screenshot 3 */}
          <form
            onSubmit={handleSendWhatsAppOrder}
            className="rounded-2xl bg-[#141520] border border-[#262838] p-5 sm:p-6 shadow-xl space-y-5"
          >
            {/* Header: Title + Subtitle on Left, PASO FINAL on Right */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif-brand font-bold text-xl sm:text-2xl text-white">
                  Datos de tu Pedido
                </h3>
                <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                  Completá los datos para coordinar la entrega o retiro en CRISE.
                </p>
              </div>

              {/* "PASO FINAL" round pill/badge */}
              <div className="shrink-0 flex flex-col items-center justify-center px-3 py-1 rounded-full bg-[#351b2a] border border-[#f48fb1]/70 text-[#f48fb1] text-[10px] sm:text-[11px] font-black tracking-widest uppercase leading-tight shadow-md">
                <span>PASO</span>
                <span>FINAL</span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#242636]" />

            {/* Error banner if validation fails */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}

            {/* 1. NOMBRE Y APELLIDO: */}
            <div className="space-y-1.5">
              <label
                htmlFor="pedido-nombre"
                className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
              >
                NOMBRE Y APELLIDO:
              </label>
              <input
                id="pedido-nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Clara Menéndez"
                required
                className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#f48fb1] focus:ring-1 focus:ring-[#f48fb1] text-sm transition-all"
              />
            </div>

            {/* 2. WHATSAPP / TELÉFONO DE CONTACTO: */}
            <div className="space-y-1.5">
              <label
                htmlFor="pedido-telefono"
                className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
              >
                WHATSAPP / TELÉFONO DE CONTACTO:
              </label>
              <input
                id="pedido-telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej: +54 9 11 2345-6789"
                required
                className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#f48fb1] focus:ring-1 focus:ring-[#f48fb1] text-sm transition-all"
              />
            </div>

            {/* 3. MODALIDAD DE ENTREGA: */}
            <div className="space-y-2">
              <span className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300">
                MODALIDAD DE ENTREGA:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoEntrega: 'delivery' })}
                  className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                    formData.tipoEntrega === 'delivery'
                      ? 'bg-[#211a28] border-2 border-[#f48fb1] text-white shadow-md'
                      : 'bg-[#181926] border border-[#2b2e40] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {formData.tipoEntrega === 'delivery' && <Check className="w-3.5 h-3.5 text-pink-300" />}
                  <span>Envío a Domicilio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoEntrega: 'takeaway' })}
                  className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-center flex items-center justify-center gap-1.5 ${
                    formData.tipoEntrega === 'takeaway'
                      ? 'bg-[#211a28] border-2 border-[#f48fb1] text-white shadow-md'
                      : 'bg-[#181926] border border-[#2b2e40] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {formData.tipoEntrega === 'takeaway' && <Check className="w-3.5 h-3.5 text-pink-300" />}
                  <span>Retiro en el local CRISE</span>
                </button>
              </div>
            </div>

            {/* 4. DIRECCIÓN DE ENTREGA (if delivery): */}
            {formData.tipoEntrega === 'delivery' && (
              <div className="space-y-1.5">
                <label
                  htmlFor="pedido-direccion"
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
                >
                  DIRECCIÓN DE ENTREGA:
                </label>
                <input
                  id="pedido-direccion"
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle, número, piso/depto, barrio"
                  required={formData.tipoEntrega === 'delivery'}
                  className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#f48fb1] focus:ring-1 focus:ring-[#f48fb1] text-sm transition-all"
                />
              </div>
            )}

            {/* 5. FECHA DESEADA & HORARIO ESTIMADO (Side by side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="pedido-fecha"
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
                >
                  FECHA DESEADA:
                </label>
                <input
                  id="pedido-fecha"
                  type="date"
                  value={formData.fechaEntrega}
                  onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                  className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white focus:outline-none focus:border-[#f48fb1] text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="pedido-horario"
                  className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
                >
                  HORARIO ESTIMADO:
                </label>
                <select
                  id="pedido-horario"
                  value={formData.horaEntrega}
                  onChange={(e) => setFormData({ ...formData, horaEntrega: e.target.value })}
                  className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white focus:outline-none focus:border-[#f48fb1] text-sm"
                >
                  <option value="10:00 - 12:00 hs (Mañana)">10:00 - 12:00 hs (Mañana)</option>
                  <option value="14:00 - 16:00 hs (Tarde temprana)">14:00 - 16:00 hs (Tarde temprana)</option>
                  <option value="16:00 - 18:00 hs (Tarde)">16:00 - 18:00 hs (Tarde)</option>
                  <option value="18:00 - 20:00 hs (Cierre)">18:00 - 20:00 hs (Cierre)</option>
                </select>
              </div>
            </div>

            {/* 6. DEDICATORIA O ACLARACIONES ESPECIALES: */}
            <div className="space-y-1.5">
              <label
                htmlFor="pedido-notas"
                className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-300"
              >
                DEDICATORIA O ACLARACIONES ESPECIALES:
              </label>
              <textarea
                id="pedido-notas"
                rows={3}
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Ej: Es para un cumpleaños sorpresa de 30 años..."
                className="w-full px-4 py-3 bg-[#181926] border border-[#2b2e40] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#f48fb1] focus:ring-1 focus:ring-[#f48fb1] text-sm transition-all"
              />
            </div>

            {/* 7. CONFIRMAR PEDIDO POR WHATSAPP BUTTON (Full width, gradient, bold) */}
            <div className="pt-2">
              <button
                id="confirm-order-whatsapp-button"
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#93c5fd] via-[#d8b4fe] to-[#f472b6] text-neutral-950 font-black text-sm sm:text-base uppercase tracking-wider hover:opacity-95 shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>CONFIRMAR PEDIDO POR WHATSAPP</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
