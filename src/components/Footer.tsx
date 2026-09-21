import React from 'react';
import { CriseLogo } from './CriseLogo';
import { Instagram, Facebook, MessageCircle, MapPin, Clock, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0e0f12] border-t border-[#232533] mt-16 pt-10 pb-20 sm:pb-12 text-neutral-400 text-xs">
      <div className="max-w-4xl mx-auto px-4">
        {/* Brand center */}
        <div className="flex flex-col items-center text-center space-y-3">
          <CriseLogo size="md" />

          <p className="max-w-md text-neutral-400 text-sm font-sans-brand">
            Pastelería artesanal elaborada diariamente con ingredientes seleccionados y amor por los detalles dulces.
          </p>

          {/* Social Links - matching screenshot: "Nos podés encontrar en:" with Facebook and Instagram */}
          <div className="pt-2 flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-300">
              Nos podés encontrar en:
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                title="Instagram @crisepatisserie"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                title="Facebook CRISÉ Pâtisserie"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                title="WhatsApp CRISÉ Pâtisserie"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg pt-4 text-left">
            <div className="p-3 rounded-2xl bg-[#14151c] border border-[#232534] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#70C0F8] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-xs font-semibold">Take Away & Envíos</strong>
                <span>Atelier de pastelería con entregas programadas y retiro coordinado.</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#14151c] border border-[#232534] flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#F48FB1] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-xs font-semibold">Horarios de Atención</strong>
                <span>Martes a Sábados: 9 a 20 hs.<br />Domingos: 10 a 18 hs.</span>
              </div>
            </div>
          </div>

          {/* Copyright clean */}
          <div className="pt-4 border-t border-[#1c1e28] w-full flex items-center justify-center gap-1 text-[11px] text-neutral-500">
            <span>© {new Date().getFullYear()} CRISÉ Pâtisserie • Hecho con</span>
            <Heart className="w-3 h-3 text-[#F48FB1] fill-[#F48FB1]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
