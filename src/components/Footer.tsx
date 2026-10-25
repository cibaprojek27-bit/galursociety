import React from 'react';
import { MessageSquare, Instagram, MapPin, Mail, ArrowUp } from 'lucide-react';
import { useStore } from '../context/StoreContext.js';

export const Footer: React.FC = () => {
  const { settings, setIsAdminViewOpen } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact-section" className="bg-[#08080a] border-t border-[#1a1a22] text-[#8c8c98]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-display text-3xl font-black uppercase text-white tracking-tight">
              {settings.brandName || 'GALUR SOCIETY'}
            </span>
            <p className="text-xs leading-relaxed text-[#9494a0] max-w-sm">
              Independent vintage & grunge streetwear label. Engineered with heavyweight fabrics, distressed aesthetics, and timeless identity. Built from the streets, made to outlast.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#14141c] hover:bg-[#1f1f2a] text-[#50e3c2] border border-[#22222e] rounded-xs transition-colors"
                title="Hubungi WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#14141c] hover:bg-[#1f1f2a] text-[#f4f4f0] border border-[#22222e] rounded-xs transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Arsip & Menu
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a href="#catalog-section" className="hover:text-white transition-colors">
                  All Collections
                </a>
              </li>
              <li>
                <a href="#about-section" className="hover:text-white transition-colors">
                  About Atelier
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsAdminViewOpen(true)}
                  className="hover:text-[#50e3c2] transition-colors"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Assistance */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Bantuan & Kebijakan
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>Pengiriman Se-Indonesia</li>
              <li>Garansi Penukaran Ukuran</li>
              <li>Instruksi Cuci Vintage</li>
              <li>Panduan Ukuran (Size Guide)</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3 text-xs font-mono">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
              Hubungi Kami
            </h4>
            <div className="space-y-2 text-[#9494a0]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#6e6e7c] shrink-0 mt-0.5" />
                <span>Jakarta Studio // Hub Batam Fulfillment</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#6e6e7c] shrink-0" />
                <span>+{settings.whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#6e6e7c] shrink-0" />
                <span>archive@galursociety.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#181820] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6c6c78]">
          <p>© {new Date().getFullYear()} GALUR SOCIETY. ALL RIGHTS RESERVED. INDEPENDENT STREETWEAR LABEL.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
