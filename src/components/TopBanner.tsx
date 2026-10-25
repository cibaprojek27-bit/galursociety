import React from 'react';
import { useStore } from '../context/StoreContext.js';

export const TopBanner: React.FC = () => {
  const { settings } = useStore();

  if (!settings.announcement) return null;

  return (
    <div className="w-full bg-[#141418] border-b border-[#24242c] py-2 px-4 text-center">
      <p className="text-[11px] md:text-xs font-mono tracking-widest uppercase text-[#a8a8af]">
        {settings.announcement}
      </p>
    </div>
  );
};
