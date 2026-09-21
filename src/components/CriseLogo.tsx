import React, { useState, useEffect } from 'react';

interface CriseLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero' | 'topbar';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
  allowUpload?: boolean;
}

const LOCAL_STORAGE_LOGO_KEY = 'crise_custom_logo_data';

export const CriseLogo: React.FC<CriseLogoProps> = ({
  size = 'hero',
  className = '',
  onClick,
  allowUpload = false,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_LOGO_KEY);
    } catch {
      return null;
    }
  });

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setCustomLogoUrl(localStorage.getItem(LOCAL_STORAGE_LOGO_KEY));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          try {
            localStorage.setItem(LOCAL_STORAGE_LOGO_KEY, result);
            setCustomLogoUrl(result);
            setImgError(false);
          } catch (err) {
            console.error('Failed to save logo to localStorage', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Topbar compact mode: "● CRISE" with the mini emblem
  if (size === 'topbar' || size === 'xs' || size === 'sm') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2 select-none ${
          onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
        } ${className}`}
      >
        {/* Mini circular emblem badge */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#121316] border border-[#70c0f8]/60 p-0.5 shrink-0 shadow-[0_0_10px_rgba(112,192,248,0.3)]">
          <img
            src={customLogoUrl || '/logo-crise.jpg'}
            alt="CRISÉ Emblem"
            className="w-full h-full object-cover rounded-full"
            onError={() => setImgError(true)}
          />
        </div>
        <span className="font-serif-brand font-black tracking-[0.18em] text-white text-base sm:text-lg uppercase">
          CRISE
        </span>
      </div>
    );
  }

  // Dimension mapping for hero and standard views
  const sizeClasses = {
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-36 h-36 sm:w-40 sm:h-40',
    hero: 'w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56',
  }[size === 'hero' ? 'hero' : size === 'lg' ? 'lg' : 'md'];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* Container for the circular emblem with ambient glow */}
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-full p-1 transition-transform duration-300 hover:scale-[1.02] ${
          onClick ? 'cursor-pointer' : ''
        }`}
      >
        {/* Soft pastel ambient halo behind the badge */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#70c0f8]/20 via-[#f48fb1]/25 to-[#ce93d8]/20 blur-xl opacity-75 pointer-events-none" />

        {/* Circular Emblem Frame */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-[#121316] shadow-2xl border-2 border-[#70c0f8]/40 ring-2 ring-[#f48fb1]/30">
          {!imgError ? (
            <img
              src={customLogoUrl || '/logo-crise.jpg'}
              alt="CRISÉ Pâtisserie - Logo Oficial"
              className="w-full h-full object-contain object-center scale-[1.02]"
              onError={() => setImgError(true)}
            />
          ) : (
            /* High-Fidelity Vector SVG representation if image file is not found */
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background */}
              <circle cx="250" cy="250" r="240" fill="#121316" />

              {/* Outer Scalloped Ring in Sky Blue */}
              <circle
                cx="250"
                cy="250"
                r="228"
                fill="none"
                stroke="#70c0f8"
                strokeWidth="7"
                strokeDasharray="14 12"
              />

              {/* Inner Scalloped Ring in Pink */}
              <circle
                cx="250"
                cy="250"
                r="215"
                fill="none"
                stroke="#f48fb1"
                strokeWidth="7"
                strokeDasharray="12 10"
              />

              {/* Cupcake Wrapper */}
              <polygon
                points="218,205 282,205 272,250 228,250"
                fill="#70c0f8"
              />
              {/* Wrapper Stripes */}
              <line x1="232" y1="205" x2="236" y2="250" stroke="#121316" strokeWidth="3" />
              <line x1="244" y1="205" x2="246" y2="250" stroke="#121316" strokeWidth="3" />
              <line x1="256" y1="205" x2="254" y2="250" stroke="#121316" strokeWidth="3" />
              <line x1="268" y1="205" x2="264" y2="250" stroke="#121316" strokeWidth="3" />

              {/* Frosting Tiers */}
              {/* Bottom Tier: Sky Blue */}
              <path
                d="M205,205 C205,188 295,188 295,205 C295,212 205,212 205,205 Z"
                fill="#70c0f8"
              />
              {/* Middle Tier: Pink */}
              <path
                d="M214,188 C214,170 286,170 286,188 C286,194 214,194 214,188 Z"
                fill="#f48fb1"
              />
              {/* Top Tier: Lavender */}
              <path
                d="M225,170 C225,150 275,150 275,170 C275,176 225,176 225,170 Z"
                fill="#ce93d8"
              />

              {/* Little Heart Topper */}
              <path
                d="M250,148 C246,140 238,140 238,146 C238,153 250,162 250,162 C250,162 262,153 262,146 C262,140 254,140 250,148 Z"
                fill="#f48fb1"
              />

              {/* Left Side Droplets */}
              <ellipse cx="178" cy="180" rx="10" ry="5" transform="rotate(-30 178 180)" fill="#70c0f8" />
              <ellipse cx="168" cy="198" rx="12" ry="5" transform="rotate(-15 168 198)" fill="#f48fb1" />
              <ellipse cx="178" cy="216" rx="9" ry="4" transform="rotate(10 178 216)" fill="#ce93d8" />

              {/* Right Side Droplets */}
              <ellipse cx="322" cy="180" rx="10" ry="5" transform="rotate(30 322 180)" fill="#70c0f8" />
              <ellipse cx="332" cy="198" rx="12" ry="5" transform="rotate(15 332 198)" fill="#f48fb1" />
              <ellipse cx="322" cy="216" rx="9" ry="4" transform="rotate(-10 322 216)" fill="#ce93d8" />

              {/* Text: CRISÉ (Split Colors) */}
              <text
                x="250"
                y="330"
                textAnchor="middle"
                fontFamily="'Playfair Display', Georgia, serif"
                fontWeight="800"
                fontSize="68"
                letterSpacing="4"
              >
                <tspan fill="#70c0f8">CR</tspan>
                <tspan fill="#70c0f8">I</tspan>
                <tspan fill="#f48fb1">SÉ</tspan>
              </text>

              {/* Divider Line with Heart */}
              <line x1="140" y1="360" x2="235" y2="360" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" />
              {/* Center Heart */}
              <path
                d="M250,358 C247,353 241,353 241,358 C241,363 250,370 250,370 C250,370 259,363 259,358 C259,353 253,353 250,358 Z"
                fill="#f48fb1"
              />
              <line x1="265" y1="360" x2="360" y2="360" stroke="#f3e8ff" strokeWidth="2" strokeLinecap="round" />

              {/* Text: Pâtisserie (Cursive Script) */}
              <text
                x="250"
                y="415"
                textAnchor="middle"
                fontFamily="'Dancing Script', cursive"
                fontWeight="700"
                fontSize="50"
                fill="#ce93d8"
              >
                Pâtisserie
              </text>
            </svg>
          )}
        </div>
      </div>

      {/* Subtitle brand text under the emblem */}
      <div className="mt-3 flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-[280px]">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#70c0f8]/60" />
        <span className="text-[11px] sm:text-xs font-sans tracking-[0.22em] text-neutral-300 font-bold uppercase whitespace-nowrap">
          PASTELERÍA ARTESANAL
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#f48fb1]/60" />
      </div>

      {/* Optional upload trigger so user can easily upload any original file from their device */}
      {allowUpload && (
        <label
          htmlFor="custom-logo-upload"
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181926] border border-[#2e3146] text-neutral-400 hover:text-white hover:border-[#f48fb1] text-[11px] font-medium cursor-pointer transition-colors"
          title="Subir archivo original desde tu dispositivo"
        >
          <span>Actualizar imagen de logo</span>
          <input
            id="custom-logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
