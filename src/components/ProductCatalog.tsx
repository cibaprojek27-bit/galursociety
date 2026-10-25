import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { Product, ProductCategory, ProductSize } from '../types.js';
import { ProductCard } from './ProductCard.js';

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: string;
}

const CATEGORIES: Array<'All' | ProductCategory> = [
  'All',
  'T-Shirt',
  'Long Sleeve',
  'Hoodie',
  'Jacket',
  'Accessories',
];

const SIZES: Array<'All' | ProductSize> = ['All', 'S', 'M', 'L', 'XL', 'XXL'];

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  initialCategory = 'All',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Status filter
        if (p.status !== 'active') return false;

        // Category filter
        if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchMat = p.materials.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchMat) return false;
        }

        // Size filter
        if (selectedSize !== 'All') {
          const hasSizeWithStock = p.variants.some(
            v => v.size === selectedSize && v.stock > 0
          );
          if (!hasSizeWithStock) return false;
        }

        // Stock filter
        if (stockFilter === 'in_stock') {
          const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
          if (totalStock <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.price;
        const priceB = b.discountPrice ?? b.price;
        if (sortOption === 'price_asc') return priceA - priceB;
        if (sortOption === 'price_desc') return priceB - priceA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, searchQuery, selectedSize, stockFilter, sortOption]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedSize('All');
    setStockFilter('all');
    setSortOption('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchQuery.trim() !== '' ||
    selectedSize !== 'All' ||
    stockFilter !== 'all' ||
    sortOption !== 'newest';

  return (
    <section id="catalog-section" className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1e1e26]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888894] mb-1">
            <span>Catalogue</span>
            <span aria-hidden="true">·</span>
            <span>Archive Index</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#f4f4f0]">
            ALL COLLECTIONS
          </h2>
        </div>

        <div className="text-xs font-mono text-[#8a8a96]">
          Showing <span className="text-[#f4f4f0] font-bold">{filteredProducts.length}</span> of {products.length} pieces
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 space-y-4">
        {/* Top controls: Category segmented tabs & Search bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#f4f4f0] text-[#0b0b0d]'
                    : 'bg-[#141419] text-[#9999a2] hover:text-[#f4f4f0] hover:bg-[#1e1e26]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6e7c]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search archive piece..."
              className="w-full bg-[#121216] border border-[#24242e] focus:border-[#4e4e5e] focus:outline-none pl-9 pr-4 py-2 text-xs text-[#f4f4f0] placeholder-[#646470]"
            />
          </div>
        </div>

        {/* Secondary Filters: Size, Stock Status, Sort Order */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Size Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#6c6c78] uppercase text-[11px]">Size:</span>
              <div className="flex items-center gap-1">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-2 py-1 text-[11px] font-mono uppercase transition-colors ${
                      selectedSize === s
                        ? 'bg-[#2a2a34] text-white font-bold'
                        : 'bg-[#121216] text-[#868694] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-[#2b2b36] hidden sm:inline">|</span>

            {/* In Stock Only Toggle */}
            <button
              onClick={() => setStockFilter(stockFilter === 'all' ? 'in_stock' : 'all')}
              className={`px-3 py-1 font-mono text-[11px] uppercase border transition-colors ${
                stockFilter === 'in_stock'
                  ? 'border-[#50e3c2] text-[#50e3c2] bg-[#50e3c2]/10'
                  : 'border-[#24242e] text-[#8a8a96] hover:text-white bg-[#121216]'
              }`}
            >
              In Stock Only
            </button>

            {/* Reset Filters if any active */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-[#f87171] hover:text-white bg-[#f87171]/10 rounded-xs transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-[#6c6c78] uppercase text-[11px]">Sort:</span>
            <select
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
              className="bg-[#121216] border border-[#24242e] text-[#d6d6d0] text-xs py-1 px-2.5 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Drop</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mt-10">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-[#1e1e26] bg-[#101014] p-8">
            <p className="font-display text-2xl uppercase tracking-wider text-[#a0a0aa]">
              NO ARCHIVE PIECES FOUND
            </p>
            <p className="text-xs font-mono text-[#6c6c78] mt-2">
              Tidak ada produk yang sesuai dengan filter atau kata kunci pencarian Anda.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 px-6 py-2.5 bg-[#f4f4f0] text-[#0b0b0d] font-bold text-xs uppercase tracking-wider hover:bg-white"
            >
              Lihat Semua Koleksi
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
