import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useStore } from '../context/StoreContext.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { itemCount, setIsDrawerOpen } = useCart();
  const { settings, setIsAdminViewOpen, adminToken } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'collections', label: 'Collections' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === 'contact') {
      const footer = document.getElementById('contact-section');
      if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0b0d]/90 backdrop-blur-md border-b border-[#1e1e24]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f4f4f0] uppercase hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {settings.brandName || 'GALUR SOCIETY'}
          </button>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-[#9c9ca4]">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#f4f4f0] ${
                  activeTab === item.id ? 'text-[#f4f4f0] border-b-2 border-[#f4f4f0] pb-1' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1 primary action area */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Admin trigger button */}
            <button
              onClick={() => setIsAdminViewOpen(true)}
              title={adminToken ? 'Dashboard Admin Aktif' : 'Login Admin'}
              className="p-2 text-[#9c9ca4] hover:text-[#f4f4f0] hover:bg-[#1a1a20] rounded transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <ShieldCheck className={`w-4 h-4 ${adminToken ? 'text-[#50e3c2]' : ''}`} />
              <span className="hidden lg:inline">{adminToken ? 'Admin' : 'Staff'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center justify-center p-2.5 bg-[#17171d] hover:bg-[#202028] text-[#f4f4f0] rounded border border-[#2b2b34] transition-colors"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#f4f4f0] text-[#0b0b0d] text-[10px] font-bold font-mono">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#9c9ca4] hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e1e24] bg-[#0e0e12] px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="block w-full text-left py-2 text-sm font-semibold uppercase tracking-wider text-[#9c9ca4] hover:text-[#f4f4f0]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
