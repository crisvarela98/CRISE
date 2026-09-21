import React, { useState } from 'react';
import { CartItem, CustomerOrder } from '../types';
import { X, Trash2, Send, Home, MessageSquare, Plus, Minus, CheckCircle, Copy } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [formData, setFormData] = useState<CustomerOrder>({
    nombre: '',
    telefono: '',
    direccion: '',
    tipoEntrega: 'takeaway',
    fechaEntrega: '',
    horaEntrega: '',
    metodoPago: 'transferencia',
    notas: '',
  });

  const [copied, setCopied] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.precio * item.cantidad,
    0
  );

  // Delivery fee (symbolic or based on choice)
  const costoEnvio = formData.tipoEntrega === 'delivery' ? 2500 : 0;
  // Cash discount 10%
  const descuentoEfectivo = formData.metodoPago === 'efectivo' ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + costoEnvio - descuentoEfectivo;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);

  const generateWhatsAppMessage = () => {
    let msg = `🧁 *NUEVO PEDIDO - CRISÉ PÂTISSERIE* 🧁\n\n`;
    msg += `👤 *Cliente:* ${formData.nombre || 'No especificado'}\n`;
    msg += `📱 *Teléfono:* ${formData.telefono || 'No especificado'}\n`;
    msg += `🛵 *Modalidad:* ${formData.tipoEntrega === 'delivery' ? 'Envío a Domicilio' : 'Retiro por el local'}\n`;

    if (formData.tipoEntrega === 'delivery') {
      msg += `📍 *Dirección:* ${formData.direccion}\n`;
    }

    if (formData.fechaEntrega) {
      msg += `📅 *Fecha/Hora deseada:* ${formData.fechaEntrega} ${formData.horaEntrega ? `a las ${formData.horaEntrega}` : ''}\n`;
    }

    msg += `💳 *Método de pago:* ${
      formData.metodoPago === 'efectivo'
        ? 'Efectivo (con 10% OFF)'
        : formData.metodoPago === 'transferencia'
        ? 'Transferencia Bancaria'
        : 'Mercado Pago'
    }\n\n`;

    msg += `🍰 *DETALLE DEL PEDIDO:*\n`;
    cartItems.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.product.nombre}* x${item.cantidad} - ${formatCurrency(
        item.product.precio * item.cantidad
      )}\n`;
    });

    msg += `\n💵 *Subtotal:* ${formatCurrency(subtotal)}\n`;
    if (costoEnvio > 0) {
      msg += `🛵 *Envío:* ${formatCurrency(costoEnvio)}\n`;
    }
    if (descuentoEfectivo > 0) {
      msg += `🏷️ *Descuento 10% Efectivo:* -${formatCurrency(descuentoEfectivo)}\n`;
    }
    msg += `✨ *TOTAL A ABONAR:* ${formatCurrency(total)}\n`;

    if (formData.notas) {
      msg += `\n📝 *Aclaraciones / Dedicatoria:* ${formData.notas}\n`;
    }

    msg += `\n_Enviado desde el catálogo web de CRISÉ Pâtisserie_`;

    return msg;
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor ingresa tu nombre para el pedido.');
      return;
    }
    if (formData.tipoEntrega === 'delivery' && !formData.direccion.trim()) {
      alert('Por favor ingresa la dirección de entrega.');
      return;
    }

    const message = generateWhatsAppMessage();
    // Default bakery phone number (placeholder or user configured)
    const phoneNumber = '5491100000000'; // international WhatsApp format
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    setOrderSent(true);
  };

  const handleCopyMessage = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-[#171822] border border-[#2b2e3e] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header matching CRISÉ style */}
        <div className="p-4 sm:p-5 border-b border-[#252836] bg-[#14151c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F48FB1] animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-white font-serif-brand">
              Tu Pedido ({cartItems.reduce((acc, i) => acc + i.cantidad, 0)} ítems)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#20222e] hover:bg-[#2b2e3e] text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#20222e] flex items-center justify-center text-neutral-400">
                🧁
              </div>
              <h3 className="text-white font-medium text-lg">Tu carrito está vacío</h3>
              <p className="text-neutral-400 text-sm max-w-xs mx-auto">
                Explora nuestras creaciones dulces y agrega tus delicias favoritas.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-full bg-[#70C0F8] text-neutral-950 font-semibold text-sm hover:bg-sky-400 transition-colors"
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Product List in Cart */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 px-1">
                  <span>PRODUCTOS SELECCIONADOS</span>
                  <button
                    onClick={onClearCart}
                    className="text-pink-400 hover:text-pink-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Vaciar
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#1e202c] border border-[#2b2d3d]"
                    >
                      <img
                        src={item.product.imagen}
                        alt={item.product.nombre}
                        className="w-12 h-12 rounded-lg object-cover bg-neutral-900 shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {item.product.nombre}
                        </h4>
                        <span className="text-xs text-neutral-400">
                          {formatCurrency(item.product.precio)} c/u
                        </span>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5 bg-[#14151c] px-2 py-1 rounded-full border border-[#2e3142]">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white min-w-[16px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}
                          className="text-neutral-400 hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-white shrink-0">
                        {formatCurrency(item.product.precio * item.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Form - mirroring Screenshot 2 ("Nombre", "Dirección", "Enviar") */}
              <form id="checkout-customer-form" onSubmit={handleSendWhatsApp} className="space-y-4 pt-2">
                <div className="border-t border-[#252836] pt-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#70C0F8]"></span>
                    Datos de Entrega & Contacto
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Ej: Sofía Martínez"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                      />
                    </div>

                    {/* Teléfono / WhatsApp */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="Ej: 11 2345 6789"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                      />
                    </div>
                  </div>

                  {/* Modalidad de Entrega */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Modalidad de Entrega
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoEntrega: 'takeaway' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          formData.tipoEntrega === 'takeaway'
                            ? 'bg-[#292336] border-[#F48FB1] text-pink-200'
                            : 'bg-[#1e202c] border-[#2e3142] text-neutral-300 hover:bg-[#252838]'
                        }`}
                      >
                        <span>🏪 Retiro en Pastelería</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoEntrega: 'delivery' })}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                          formData.tipoEntrega === 'delivery'
                            ? 'bg-[#1e2738] border-[#70C0F8] text-sky-200'
                            : 'bg-[#1e202c] border-[#2e3142] text-neutral-300 hover:bg-[#252838]'
                        }`}
                      >
                        <span>🛵 Envío a Domicilio</span>
                      </button>
                    </div>
                  </div>

                  {/* Dirección if Delivery */}
                  {formData.tipoEntrega === 'delivery' && (
                    <div className="mt-3 animate-in fade-in">
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Dirección de entrega *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        placeholder="Calle, número, piso/depto, barrio"
                        className="w-full px-3.5 py-2.5 text-sm bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#70C0F8]"
                      />
                    </div>
                  )}

                  {/* Fecha & Hora */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Fecha deseada
                      </label>
                      <input
                        type="text"
                        value={formData.fechaEntrega}
                        onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                        placeholder="Hoy, mañana o fecha"
                        className="w-full px-3 py-2 text-xs bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1">
                        Horario estimado
                      </label>
                      <input
                        type="text"
                        value={formData.horaEntrega}
                        onChange={(e) => setFormData({ ...formData, horaEntrega: e.target.value })}
                        placeholder="Ej: 16:30 hs"
                        className="w-full px-3 py-2 text-xs bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                      />
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Método de Pago
                    </label>
                    <select
                      value={formData.metodoPago}
                      onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs bg-[#1e202c] border border-[#2e3142] rounded-xl text-white focus:outline-none focus:border-[#F48FB1]"
                    >
                      <option value="transferencia">Transferencia Bancaria / Alias</option>
                      <option value="efectivo">Efectivo contra entrega (10% Descuento)</option>
                      <option value="mercadopago">Mercado Pago (Link / QR)</option>
                    </select>
                  </div>

                  {/* Notas / Mensaje para la pastelería */}
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-neutral-300 mb-1">
                      Dedicatoria o aclaraciones
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                      placeholder="Ej: Vela de cumpleaños, dedicatoria especial, timbrar fuerte..."
                      className="w-full px-3 py-2 text-xs bg-[#1e202c] border border-[#2e3142] rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#F48FB1]"
                    />
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="p-3.5 rounded-2xl bg-[#14151c] border border-[#252838] space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {costoEnvio > 0 && (
                    <div className="flex justify-between text-sky-400">
                      <span>Costo de Envío</span>
                      <span>+{formatCurrency(costoEnvio)}</span>
                    </div>
                  )}
                  {descuentoEfectivo > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Descuento 10% Efectivo</span>
                      <span>-{formatCurrency(descuentoEfectivo)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-[#252838]">
                    <span>Total a Abonar</span>
                    <span className="text-[#F48FB1]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Primary Action Button: "Enviar Pedido por WhatsApp" - matching Screenshot 2's "Enviar" button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BA5A] hover:to-[#0E7166] text-white shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Enviar Pedido por WhatsApp</span>
                </button>

                {/* Copy Text Option */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-xs text-neutral-400 hover:text-neutral-200 inline-flex items-center gap-1.5 py-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Texto copiado al portapapeles!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar resumen del pedido en texto</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer with Return to Menu (Home Button matching Screenshot 2's circular home button on the bottom right) */}
        <div className="p-3 bg-[#13141a] border-t border-[#232533] flex items-center justify-between text-xs text-neutral-400">
          <span>CRISÉ Pâtisserie • Pedidos Online</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e202c] hover:bg-[#2b2e3e] text-white transition-colors"
            title="Volver al menú de delicias"
          >
            <Home className="w-3.5 h-3.5 text-[#70C0F8]" />
            <span>Volver al Catálogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
