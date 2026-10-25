import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  LayoutDashboard, 
  Package, 
  Boxes, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  RefreshCw, 
  LogOut, 
  Search, 
  Eye, 
  EyeOff,
  Upload,
  ImagePlus,
  Star,
  KeyRound,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.js';
import { formatIDR, formatDate } from '../../utils/formatters.js';
import type { 
  Product, 
  ProductVariant, 
  ProductCategory, 
  ProductSize,
  Order, 
  OrderStatus, 
  InventoryMovement, 
  DashboardSummary 
} from '../../types.js';

// Helper to compress camera/gallery images before upload to keep performance fast
function readFileAndCompress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const rawDataUrl = readerEvent.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Gagal membaca file gambar'));
        return;
      }

      if (file.type === 'image/svg+xml' || file.type === 'image/gif' || file.size < 200 * 1024) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxWidth = 1400;
        const maxHeight = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve(compressed);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminViewOpen, 
    setIsAdminViewOpen, 
    adminToken, 
    adminUser, 
    adminLogin, 
    adminLogout,
    settings,
    refreshProducts,
    refreshSettings
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'settings'>('overview');

  // Auth Form State - empty by default for public deployment
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Image Upload State for Product Management
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [showManualUrl, setShowManualUrl] = useState(false);

  // Admin Credentials Change State
  const [credForm, setCredForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
  });
  const [credMessage, setCredMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingCreds, setIsChangingCreds] = useState(false);

  // Overview metrics state
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Admin Products state
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [productDeleteConfirmId, setProductDeleteConfirmId] = useState<string | null>(null);

  // Inventory movements state
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [adjustModal, setAdjustModal] = useState<{
    open: boolean;
    product: Product | null;
    variant: ProductVariant | null;
    delta: number;
    reason: string;
  }>({
    open: false,
    product: null,
    variant: null,
    delta: 5,
    reason: 'Incoming Batch Restock',
  });
  const [adjustError, setAdjustError] = useState<string | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Store Settings Form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // Fetch helpers
  const fetchOverview = async () => {
    if (!adminToken) return;
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchAdminProducts = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setAdminProducts(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovements = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/inventory/movements', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setMovements(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (adminToken && isAdminViewOpen) {
      fetchOverview();
      fetchAdminProducts();
      fetchMovements();
      fetchOrders();
      setSettingsForm(settings);
    }
  }, [adminToken, isAdminViewOpen]);

  if (!isAdminViewOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal.');
      }
      adminLogin(data.token, data.admin);
    } catch (err: any) {
      setAuthError(err.message || 'Login gagal.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(editingProduct)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal menyimpan produk');
        return;
      }

      setEditingProduct(null);
      await fetchAdminProducts();
      await fetchOverview();
      await fetchMovements();
      await refreshProducts();
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setProductDeleteConfirmId(null);
        await fetchAdminProducts();
        await fetchOverview();
        await refreshProducts();
      }
    } catch (err) {
      alert('Gagal menghapus produk.');
    }
  };

  // Handle Inventory Adjust (+ or -)
  const handleInventoryAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);
    if (!adjustModal.product || !adjustModal.variant) return;

    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          productId: adjustModal.product.id,
          variantId: adjustModal.variant.id,
          delta: adjustModal.delta,
          reason: adjustModal.reason
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAdjustError(data.error || 'Gagal mengubah stok.');
        return;
      }

      setAdjustModal({ open: false, product: null, variant: null, delta: 5, reason: '' });
      await fetchAdminProducts();
      await fetchMovements();
      await fetchOverview();
      await refreshProducts();
    } catch (err: any) {
      setAdjustError(err.message || 'Gagal terhubung ke server.');
    }
  };

  // Handle Order Status Update (Supports cancellation automatic restitution!)
  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Gagal memperbarui status pesanan');
        return;
      }

      await fetchOrders();
      await fetchAdminProducts();
      await fetchMovements();
      await fetchOverview();
      await refreshProducts();
      if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
        setSelectedOrderDetail(data.data);
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Pengaturan toko berhasil disimpan ke database!');
        await refreshSettings();
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan.');
    }
  };

  // Handle Uploading Photos from Device File / Gallery
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    setIsUploadingImages(true);
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedBase64 = await readFileAndCompress(file);
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            image: compressedBase64,
            fileName: file.name,
          }),
        });

        const data = await res.json();
        if (data.success && data.url) {
          newUrls.push(data.url);
        } else {
          // Fallback to compressed base64 if server upload didn't return url
          newUrls.push(compressedBase64);
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }

    if (newUrls.length > 0) {
      const currentImages = editingProduct.images || [];
      setEditingProduct({
        ...editingProduct,
        images: [...currentImages, ...newUrls],
      });
    }

    setIsUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Admin Credentials Change
  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);
    setIsChangingCreds(true);

    try {
      const res = await fetch('/api/admin/change-credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(credForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setCredMessage({ text: data.error || 'Gagal mengubah password.', isError: true });
      } else {
        setCredMessage({ text: 'Kredensial login berhasil diperbarui!', isError: false });
        setCredForm({ email: '', currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      setCredMessage({ text: 'Terjadi kesalahan sistem.', isError: true });
    } finally {
      setIsChangingCreds(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex flex-col text-[#f4f4f0] animate-in fade-in duration-200">
      {/* Admin Top Navbar */}
      <header className="h-16 px-6 bg-[#0a0a0d] border-b border-[#1e1e24] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-display text-2xl font-black uppercase tracking-tight text-white">
            GALUR CONTROL ROOM
          </span>
          {adminToken && (
            <span className="text-[10px] font-mono uppercase bg-[#171720] border border-[#2b2b38] px-2 py-0.5 text-[#50e3c2]">
              Connected // Supabase Persistent Store
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {adminToken && (
            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171720] hover:bg-[#20202c] text-xs font-mono text-[#f87171] border border-[#2d2d38] rounded-xs transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}

          <button
            onClick={() => setIsAdminViewOpen(false)}
            className="p-1.5 text-[#888894] hover:text-white bg-[#171720] rounded hover:bg-[#22222e] transition-colors"
            title="Keluar ke Website"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      {!adminToken ? (
        /* Login Screen */
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f0f14] border border-[#262634] p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#7c7c8c]">
                Restricted Curator Access
              </span>
              <h2 className="font-display text-3xl font-extrabold uppercase text-white mt-1">
                MASUK ADMIN TOKO
              </h2>
              <p className="text-xs text-[#9c9ca8] mt-1">
                Masukkan kredensial pengelola untuk mengontrol stok, pesanan, dan katalog produk secara aman.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-[#2a1315] border border-[#6b252a] text-[#f87171] text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#888894] uppercase">Email Admin</label>
                <input
                  type="email"
                  required
                  placeholder="admin@galursociety.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#131319] border border-[#242430] p-2.5 text-white focus:outline-none focus:border-[#4d4d5e]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#888894] uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#131319] border border-[#242430] p-2.5 text-white focus:outline-none focus:border-[#4d4d5e]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-[#f4f4f0] hover:bg-white text-[#0b0b0d] font-bold uppercase tracking-wider transition-all"
              >
                {isLoggingIn ? 'Memverifikasi...' : 'Masuk Ke Dashboard'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Authenticated Admin Dashboard Workspace */
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <aside className="w-56 bg-[#0c0c10] border-r border-[#1e1e24] p-4 flex flex-col justify-between shrink-0">
            <div className="space-y-1">
              <div className="pb-3 px-2 border-b border-[#1b1b22] mb-3">
                <p className="text-xs font-bold text-white uppercase">{adminUser?.name || 'Master Curator'}</p>
                <p className="text-[10px] font-mono text-[#787884] truncate">{adminUser?.email}</p>
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === 'overview' ? 'bg-[#f4f4f0] text-[#0b0b0d]' : 'text-[#8e8e9a] hover:bg-[#16161f] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ringkasan</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === 'products' ? 'bg-[#f4f4f0] text-[#0b0b0d]' : 'text-[#8e8e9a] hover:bg-[#16161f] hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Manajemen Produk</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === 'inventory' ? 'bg-[#f4f4f0] text-[#0b0b0d]' : 'text-[#8e8e9a] hover:bg-[#16161f] hover:text-white'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Manajemen Stok</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === 'orders' ? 'bg-[#f4f4f0] text-[#0b0b0d]' : 'text-[#8e8e9a] hover:bg-[#16161f] hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Manajemen Pesanan</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors ${
                  activeTab === 'settings' ? 'bg-[#f4f4f0] text-[#0b0b0d]' : 'text-[#8e8e9a] hover:bg-[#16161f] hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Pengaturan Toko</span>
              </button>
            </div>

            <div className="p-3 bg-[#111116] border border-[#1e1e26] text-[10px] font-mono text-[#6c6c78]">
              GALUR CMS v2.6<br />Database: Synced Disk
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#0b0b0e]">
            {/* ---------------- A. RINGKASAN DASHBOARD ---------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#1e1e26]">
                  <div>
                    <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                      RINGKASAN DASHBOARD
                    </h2>
                    <p className="text-xs font-mono text-[#8a8a96]">
                      Metrik performa inventaris, stok menipis, dan pesanan pelanggan terkini.
                    </p>
                  </div>
                  <button
                    onClick={fetchOverview}
                    className="p-2 bg-[#14141a] hover:bg-[#1e1e26] border border-[#262632] rounded text-xs font-mono flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSummary ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* KPI Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#767684] block">Total Produk</span>
                    <span className="font-mono-numbers text-2xl font-bold text-white mt-1 block">
                      {summary?.totalProducts ?? 0}
                    </span>
                  </div>

                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#767684] block">Total Stok Fisik</span>
                    <span className="font-mono-numbers text-2xl font-bold text-white mt-1 block">
                      {summary?.totalStockUnits ?? 0} pcs
                    </span>
                  </div>

                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#fbbf24] block">Stok Menipis</span>
                    <span className="font-mono-numbers text-2xl font-bold text-[#fbbf24] mt-1 block">
                      {summary?.lowStockCount ?? 0} varian
                    </span>
                  </div>

                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#f87171] block">Stok Habis</span>
                    <span className="font-mono-numbers text-2xl font-bold text-[#f87171] mt-1 block">
                      {summary?.soldOutCount ?? 0} varian
                    </span>
                  </div>

                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#767684] block">Total Pesanan</span>
                    <span className="font-mono-numbers text-2xl font-bold text-white mt-1 block">
                      {summary?.totalOrders ?? 0}
                    </span>
                  </div>

                  <div className="p-4 bg-[#121217] border border-[#1f1f28]">
                    <span className="text-[10px] font-mono uppercase text-[#50e3c2] block">Total Penjualan</span>
                    <span className="font-mono-numbers text-xl font-bold text-[#50e3c2] mt-1 block truncate">
                      {formatIDR(summary?.totalRevenue ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Quick Stock Alert Watchlist */}
                <div className="bg-[#101015] border border-[#1e1e28] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl uppercase font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-[#fbbf24]" />
                      <span>PERINGATAN STOK MENIPIS & HABIS</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('inventory')}
                      className="text-xs font-mono text-[#a0a0ae] hover:text-white underline"
                    >
                      Buka Manajemen Stok →
                    </button>
                  </div>

                  <div className="divide-y divide-[#1a1a24]">
                    {adminProducts
                      .flatMap(p => p.variants.map(v => ({ product: p, variant: v })))
                      .filter(item => item.variant.stock <= 4)
                      .slice(0, 5)
                      .map(({ product, variant }) => (
                        <div key={variant.id} className="py-3 flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="font-bold text-white">{product.name}</span>
                            <span className="text-[#848492] ml-2">
                              [Size {variant.size} · {variant.color}]
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                                variant.stock === 0 ? 'bg-[#3b1215] text-[#f87171]' : 'bg-[#3b2b12] text-[#fbbf24]'
                              }`}
                            >
                              {variant.stock === 0 ? 'HABIS (0)' : `SISA ${variant.stock}`}
                            </span>
                            <button
                              onClick={() => {
                                setAdjustModal({
                                  open: true,
                                  product,
                                  variant,
                                  delta: 10,
                                  reason: 'Restock Peringatan Stok Rendah'
                                });
                              }}
                              className="px-2 py-1 bg-[#1a1a24] hover:bg-[#252532] text-[#e0e0da] border border-[#2e2e3c]"
                            >
                              Restock +
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- B. MANAJEMEN PRODUK ---------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#1e1e26]">
                  <div>
                    <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                      MANAJEMEN PRODUK
                    </h2>
                    <p className="text-xs font-mono text-[#8a8a96]">
                      Tambah produk baru, edit harga, ukuran, status tampil, dan foto catalog.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        category: 'T-Shirt',
                        description: '',
                        materials: '100% Combed Cotton 16s (240 GSM)',
                        price: 285000,
                        discountPrice: null,
                        images: [],
                        isNewArrival: true,
                        isBestSeller: false,
                        isFeatured: true,
                        status: 'active',
                        variants: [
                          { id: '', productId: '', size: 'S', color: 'Vintage Black', stock: 10, sku: 'GS-NEW-S' },
                          { id: '', productId: '', size: 'M', color: 'Vintage Black', stock: 15, sku: 'GS-NEW-M' },
                          { id: '', productId: '', size: 'L', color: 'Vintage Black', stock: 15, sku: 'GS-NEW-L' },
                          { id: '', productId: '', size: 'XL', color: 'Vintage Black', stock: 10, sku: 'GS-NEW-XL' },
                        ]
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f4f0] hover:bg-white text-[#0b0b0d] text-xs font-bold uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Produk Baru</span>
                  </button>
                </div>

                {/* Product Form Modal (Add / Edit) */}
                {editingProduct && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
                    <form
                      onSubmit={handleSaveProduct}
                      className="bg-[#101015] border border-[#2b2b3a] p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-4 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between border-b border-[#20202c] pb-3">
                        <h3 className="font-display text-2xl font-bold uppercase text-white">
                          {editingProduct.id ? 'EDIT INFORMASI PRODUK' : 'TAMBAH PRODUK BARU'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="p-1 text-[#8c8c98] hover:text-white"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[#888894] uppercase">Nama Produk *</label>
                          <input
                            type="text"
                            required
                            value={editingProduct.name || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#888894] uppercase">Kategori Produk</label>
                          <select
                            value={editingProduct.category || 'T-Shirt'}
                            onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as ProductCategory })}
                            className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                          >
                            <option value="T-Shirt">T-Shirt</option>
                            <option value="Long Sleeve">Long Sleeve</option>
                            <option value="Hoodie">Hoodie</option>
                            <option value="Jacket">Jacket</option>
                            <option value="Accessories">Accessories</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[#888894] uppercase">Harga Reguler (IDR) *</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.price || 0}
                            onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[#888894] uppercase">Harga Diskon (Opsional)</label>
                          <input
                            type="number"
                            value={editingProduct.discountPrice || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? Number(e.target.value) : null })}
                            placeholder="Kosongkan jika tidak ada diskon"
                            className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Deskripsi Produk</label>
                        <textarea
                          rows={3}
                          value={editingProduct.description || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Material & Spesifikasi</label>
                        <input
                          type="text"
                          value={editingProduct.materials || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, materials: e.target.value })}
                          className="w-full bg-[#15151c] border border-[#242432] p-2 text-white"
                        />
                      </div>

                      {/* Foto Produk: File / Galeri & Preview Grid */}
                      <div className="space-y-3 p-4 bg-[#13131a] border border-[#22222e]">
                        <div className="flex items-center justify-between">
                          <label className="text-[#888894] uppercase font-bold text-xs flex items-center gap-2">
                            <ImagePlus className="w-4 h-4 text-[#50e3c2]" />
                            <span>Foto Produk (Upload Dari Galeri / File)</span>
                          </label>
                          <span className="text-[11px] font-mono text-[#787886]">
                            {(editingProduct.images || []).length} Foto Terpilih
                          </span>
                        </div>

                        {/* Hidden Native File Input (accepts camera, gallery, device files) */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          multiple
                          onChange={handleFilesSelected}
                          className="hidden"
                        />

                        {/* Upload Trigger Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={isUploadingImages}
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#f4f4f0] hover:bg-white text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            {isUploadingImages ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-black" />
                                <span>Mengompres & Mengunggah...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-black" />
                                <span>Pilih Dari File / Galeri</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowManualUrl(!showManualUrl)}
                            className="px-3.5 py-2.5 bg-[#1a1a24] hover:bg-[#252534] text-[#c2c2c0] border border-[#2d2d3c] text-xs font-mono transition-colors"
                          >
                            {showManualUrl ? 'Tutup Input URL' : '+ Input URL Gambar Manual'}
                          </button>
                        </div>

                        {/* Optional Manual URL Input */}
                        {showManualUrl && (
                          <div className="flex gap-2 pt-1 animate-in fade-in">
                            <input
                              type="text"
                              placeholder="Masukkan URL foto (contoh: https://...)"
                              value={manualUrlInput}
                              onChange={e => setManualUrlInput(e.target.value)}
                              className="flex-1 bg-[#161620] border border-[#2b2b3a] p-2 text-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (manualUrlInput.trim()) {
                                  const current = editingProduct.images || [];
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: [...current, manualUrlInput.trim()]
                                  });
                                  setManualUrlInput('');
                                }
                              }}
                              className="px-4 py-2 bg-[#2a2a36] hover:bg-[#383848] text-white text-xs font-bold font-mono"
                            >
                              Tambahkan
                            </button>
                          </div>
                        )}

                        {/* Thumbnail Grid & Order Control */}
                        {(editingProduct.images || []).length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] text-[#787884] uppercase font-mono block">
                              Urutan Foto (Foto Pertama Menjadi Foto Utama di Katalog):
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {(editingProduct.images || []).map((imgUrl, imgIdx) => (
                                <div
                                  key={imgIdx}
                                  className={`relative group bg-[#0e0e13] border overflow-hidden ${
                                    imgIdx === 0
                                      ? 'border-[#50e3c2] ring-1 ring-[#50e3c2]'
                                      : 'border-[#262634]'
                                  }`}
                                >
                                  <div className="aspect-4/5 w-full bg-[#15151e] overflow-hidden">
                                    <img
                                      src={imgUrl}
                                      alt={`Preview ${imgIdx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>

                                  {/* Featured Badge */}
                                  {imgIdx === 0 && (
                                    <div className="absolute top-1 left-1 bg-[#0b0b0d]/90 text-[#50e3c2] text-[9px] font-bold px-1.5 py-0.5 border border-[#50e3c2]/50 uppercase">
                                      ★ Foto Utama
                                    </div>
                                  )}

                                  {/* Hover Actions: Set as Main & Delete */}
                                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = (editingProduct.images || []).filter((_, i) => i !== imgIdx);
                                          setEditingProduct({ ...editingProduct, images: updated });
                                        }}
                                        className="p-1.5 bg-[#2a1315] hover:bg-[#40191c] text-[#f87171] rounded-xs"
                                        title="Hapus Foto"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {imgIdx !== 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = [...(editingProduct.images || [])];
                                          const selected = current.splice(imgIdx, 1)[0];
                                          current.unshift(selected);
                                          setEditingProduct({ ...editingProduct, images: current });
                                        }}
                                        className="w-full py-1 bg-[#1a1a24] hover:bg-[#252534] text-[10px] text-white border border-[#333342] font-mono"
                                      >
                                        Jadikan Utama
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="py-8 px-4 border border-dashed border-[#2b2b3a] bg-[#101016] text-center cursor-pointer hover:border-[#4d4d60] transition-colors"
                          >
                            <Upload className="w-6 h-6 mx-auto text-[#6c6c7c] mb-2" />
                            <p className="text-xs text-[#a0a0ae] font-bold">
                              Klik untuk pilih foto dari Galeri HP atau File Laptop
                            </p>
                            <p className="text-[10px] text-[#646472] mt-1">
                              Mendukung format JPG, PNG, WEBP. Dapat memilih beberapa foto sekaligus.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Badges / Flags */}
                      <div className="grid grid-cols-4 gap-3 p-3 bg-[#13131a] border border-[#20202c]">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingProduct.isNewArrival)}
                            onChange={e => setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })}
                          />
                          <span>New Arrival</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingProduct.isBestSeller)}
                            onChange={e => setEditingProduct({ ...editingProduct, isBestSeller: e.target.checked })}
                          />
                          <span>Best Seller</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(editingProduct.isFeatured)}
                            onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                          />
                          <span>Featured</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.status === 'active'}
                            onChange={e => setEditingProduct({ ...editingProduct, status: e.target.checked ? 'active' : 'hidden' })}
                          />
                          <span>Status Aktif</span>
                        </label>
                      </div>

                      {/* Variants & Stocks */}
                      <div className="space-y-2 pt-2">
                        <label className="text-[#888894] uppercase block">Variasi Ukuran & Stok:</label>
                        <div className="space-y-2">
                          {(editingProduct.variants || []).map((v, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-[#14141d] border border-[#22222e]">
                              <input
                                type="text"
                                placeholder="Size"
                                value={v.size}
                                onChange={e => {
                                  const vars = [...(editingProduct.variants || [])];
                                  vars[idx] = { ...vars[idx], size: e.target.value as ProductSize };
                                  setEditingProduct({ ...editingProduct, variants: vars });
                                }}
                                className="w-16 bg-[#1a1a24] p-1.5 text-center text-white border border-[#2e2e3e]"
                              />
                              <input
                                type="text"
                                placeholder="Warna"
                                value={v.color}
                                onChange={e => {
                                  const vars = [...(editingProduct.variants || [])];
                                  vars[idx] = { ...vars[idx], color: e.target.value };
                                  setEditingProduct({ ...editingProduct, variants: vars });
                                }}
                                className="flex-1 bg-[#1a1a24] p-1.5 text-white border border-[#2e2e3e]"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-[#777]">Stok:</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={v.stock}
                                  onChange={e => {
                                    const vars = [...(editingProduct.variants || [])];
                                    vars[idx] = { ...vars[idx], stock: Math.max(0, parseInt(e.target.value, 10) || 0) };
                                    setEditingProduct({ ...editingProduct, variants: vars });
                                  }}
                                  className="w-20 bg-[#1a1a24] p-1.5 text-center text-white border border-[#2e2e3e]"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const vars = (editingProduct.variants || []).filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, variants: vars });
                                }}
                                className="p-1.5 text-[#f87171] hover:bg-[#2a1315]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              const vars = [...(editingProduct.variants || [])];
                              vars.push({
                                id: `v-new-${Date.now()}`,
                                productId: editingProduct.id || '',
                                size: 'L',
                                color: 'Vintage Black',
                                stock: 10,
                                sku: `GS-VAR-${Math.floor(100 + Math.random() * 900)}`
                              });
                              setEditingProduct({ ...editingProduct, variants: vars });
                            }}
                            className="px-3 py-1.5 bg-[#171722] hover:bg-[#20202c] text-white border border-[#2a2a38] text-[11px]"
                          >
                            + Tambah Varian Ukuran
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-[#20202c]">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-4 py-2 bg-[#171720] hover:bg-[#22222c] text-[#a4a4b2]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-[#f4f4f0] hover:bg-white text-[#0b0b0d] font-bold"
                        >
                          Simpan Ke Database
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-[#101015] border border-[#1e1e28] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#14141b] text-[#868694] uppercase border-b border-[#1e1e28]">
                      <tr>
                        <th className="p-3.5">Produk</th>
                        <th className="p-3.5">Kategori</th>
                        <th className="p-3.5">Harga</th>
                        <th className="p-3.5">Total Stok</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181822]">
                      {adminProducts.map(p => {
                        const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);

                        return (
                          <tr key={p.id} className="hover:bg-[#14141c] transition-colors">
                            <td className="p-3.5 flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-10 h-12 object-cover bg-[#171720]"
                              />
                              <div>
                                <p className="font-bold text-white font-sans">{p.name}</p>
                                <p className="text-[10px] text-[#70707e]">
                                  {p.variants.length} variasi ukuran
                                </p>
                              </div>
                            </td>
                            <td className="p-3.5 text-[#a0a0ae]">{p.category}</td>
                            <td className="p-3.5 font-bold font-mono-numbers text-white">
                              {formatIDR(p.discountPrice ?? p.price)}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                                  totalStock === 0
                                    ? 'bg-[#3b1215] text-[#f87171]'
                                    : totalStock <= 5
                                    ? 'bg-[#3b2b12] text-[#fbbf24]'
                                    : 'bg-[#12281e] text-[#50e3c2]'
                                }`}
                              >
                                {totalStock} pcs
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[11px] ${
                                  p.status === 'active' ? 'text-[#50e3c2]' : 'text-[#70707e]'
                                }`}
                              >
                                {p.status === 'active' ? 'Aktif' : 'Disembunyikan'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 bg-[#171720] hover:bg-[#22222e] text-[#d0d0c8]"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setProductDeleteConfirmId(p.id)}
                                className="p-1.5 bg-[#2a1315] hover:bg-[#3b191c] text-[#f87171]"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Delete Confirmation Modal */}
                {productDeleteConfirmId && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#121218] border border-[#303040] p-6 max-w-sm w-full space-y-4 text-center">
                      <AlertTriangle className="w-10 h-10 text-[#f87171] mx-auto" />
                      <h4 className="font-display text-xl uppercase font-bold text-white">
                        HAPUS PRODUK PERMANEN?
                      </h4>
                      <p className="text-xs font-mono text-[#9999a6]">
                        Tindakan ini akan menghapus produk dan seluruh varian stok dari database.
                      </p>
                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          onClick={() => setProductDeleteConfirmId(null)}
                          className="px-4 py-2 bg-[#1a1a24] text-xs font-mono"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(productDeleteConfirmId)}
                          className="px-4 py-2 bg-[#f87171] hover:bg-[#e05656] text-black font-bold text-xs font-mono uppercase"
                        >
                          Ya, Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- C. MANAJEMEN STOK & AUDIT TRAIL ---------------- */}
            {activeTab === 'inventory' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-[#1e1e26]">
                  <div>
                    <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                      MANAJEMEN STOK & AUDIT TRAIL
                    </h2>
                    <p className="text-xs font-mono text-[#8a8a96]">
                      Pencatatan real-time pergerakan stok, penambahan batch, audit manual, dan riwayat pesanan.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      fetchAdminProducts();
                      fetchMovements();
                    }}
                    className="p-2 bg-[#14141a] hover:bg-[#1e1e26] border border-[#262632] rounded text-xs font-mono flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync Stok</span>
                  </button>
                </div>

                {/* Stock Quick Adjustment Modal */}
                {adjustModal.open && adjustModal.variant && adjustModal.product && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <form
                      onSubmit={handleInventoryAdjustSubmit}
                      className="bg-[#121218] border border-[#2e2e3c] p-6 max-w-md w-full space-y-4 font-mono text-xs"
                    >
                      <div className="flex justify-between items-center border-b border-[#20202a] pb-2">
                        <h4 className="font-display text-xl uppercase font-bold text-white">
                          PENYESUAIAN STOK MANUAL
                        </h4>
                        <button
                          type="button"
                          onClick={() => setAdjustModal({ ...adjustModal, open: false })}
                        >
                          <X className="w-4 h-4 text-[#888]" />
                        </button>
                      </div>

                      {adjustError && (
                        <div className="p-2.5 bg-[#2c1315] text-[#f87171] border border-[#6b252a]">
                          {adjustError}
                        </div>
                      )}

                      <div className="p-3 bg-[#171720] border border-[#22222c] space-y-1">
                        <p className="font-bold text-white font-sans">{adjustModal.product.name}</p>
                        <p className="text-[#888896]">
                          Varian: Size {adjustModal.variant.size} · {adjustModal.variant.color}
                        </p>
                        <p className="text-[#50e3c2]">
                          Stok Saat Ini: <span className="font-bold text-white">{adjustModal.variant.stock} pcs</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Jumlah Perubahan (+ / -) *</label>
                        <input
                          type="number"
                          required
                          value={adjustModal.delta}
                          onChange={e => setAdjustModal({ ...adjustModal, delta: parseInt(e.target.value, 10) || 0 })}
                          className="w-full bg-[#181822] border border-[#2b2b3a] p-2 text-white"
                        />
                        <span className="text-[10px] text-[#70707e]">
                          Gunakan angka positif untuk menambah stok (restock), angka negatif untuk pengurangan manual.
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Alasan Penyesuaian *</label>
                        <input
                          type="text"
                          required
                          value={adjustModal.reason}
                          onChange={e => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                          placeholder="Contoh: Kedatangan stok baru Batch 04 / Koreksi opname"
                          className="w-full bg-[#181822] border border-[#2b2b3a] p-2 text-white"
                        />
                      </div>

                      <div className="pt-3 flex justify-end gap-2 border-t border-[#20202a]">
                        <button
                          type="button"
                          onClick={() => setAdjustModal({ ...adjustModal, open: false })}
                          className="px-4 py-2 bg-[#1a1a24] text-[#a4a4b0]"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#f4f4f0] text-black font-bold uppercase"
                        >
                          Simpan Penyesuaian
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Current Stock Inventory Matrix */}
                <div className="bg-[#101015] border border-[#1e1e28] p-4 space-y-3">
                  <h3 className="font-display text-xl uppercase font-bold text-white">
                    INVENTARIS STOK VARIAN AKTIF
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#14141b] text-[#868694] uppercase border-b border-[#1e1e28]">
                        <tr>
                          <th className="p-3">Produk</th>
                          <th className="p-3">Ukuran</th>
                          <th className="p-3">Warna</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Stok Tersedia</th>
                          <th className="p-3 text-right">Penyesuaian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181822]">
                        {adminProducts.flatMap(p =>
                          p.variants.map(v => (
                            <tr key={v.id} className="hover:bg-[#14141c]">
                              <td className="p-3 font-sans font-bold text-white">{p.name}</td>
                              <td className="p-3 font-bold text-[#f4f4f0]">{v.size}</td>
                              <td className="p-3 text-[#9c9ca8]">{v.color}</td>
                              <td className="p-3 text-[#70707c]">{v.sku}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold ${
                                    v.stock === 0
                                      ? 'bg-[#3b1215] text-[#f87171]'
                                      : v.stock <= 4
                                      ? 'bg-[#3b2b12] text-[#fbbf24]'
                                      : 'bg-[#12281e] text-[#50e3c2]'
                                  }`}
                                >
                                  {v.stock} pcs
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setAdjustModal({
                                      open: true,
                                      product: p,
                                      variant: v,
                                      delta: 10,
                                      reason: 'Manual Restock'
                                    });
                                  }}
                                  className="px-2.5 py-1 bg-[#1a1a24] hover:bg-[#252532] text-[#e0e0da] border border-[#2e2e3c]"
                                >
                                  Ubah Stok
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Audit Trail Movements Log */}
                <div className="bg-[#101015] border border-[#1e1e28] p-4 space-y-3">
                  <h3 className="font-display text-xl uppercase font-bold text-white">
                    RIWAYAT PERGERAKAN STOK (AUDIT TRAIL)
                  </h3>
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-[#14141b] text-[#868694] uppercase sticky top-0 border-b border-[#1e1e28]">
                        <tr>
                          <th className="p-3">Waktu</th>
                          <th className="p-3">Produk & Varian</th>
                          <th className="p-3">Perubahan</th>
                          <th className="p-3">Sebelum → Sesudah</th>
                          <th className="p-3">Alasan / Keterangan</th>
                          <th className="p-3">Oleh</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#181822]">
                        {movements.map(mov => (
                          <tr key={mov.id} className="hover:bg-[#14141c]">
                            <td className="p-3 text-[#777784] text-[11px] whitespace-nowrap">
                              {formatDate(mov.createdAt)}
                            </td>
                            <td className="p-3">
                              <span className="font-sans font-bold text-white block">{mov.productName}</span>
                              <span className="text-[10px] text-[#80808c]">{mov.variantLabel}</span>
                            </td>
                            <td className="p-3 font-bold">
                              <span
                                className={
                                  mov.quantityDelta > 0 ? 'text-[#50e3c2]' : 'text-[#f87171]'
                                }
                              >
                                {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta}
                              </span>
                            </td>
                            <td className="p-3 text-[#9a9aa8]">
                              {mov.previousStock} → <span className="font-bold text-white">{mov.newStock}</span>
                            </td>
                            <td className="p-3 text-[#d0d0cb]">{mov.reason}</td>
                            <td className="p-3 text-[#70707e] text-[10px]">{mov.performedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- D. MANAJEMEN PESANAN ---------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e1e26]">
                  <div>
                    <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                      MANAJEMEN PESANAN
                    </h2>
                    <p className="text-xs font-mono text-[#8a8a96]">
                      Verifikasi pesanan, update status pengiriman, dan restitusi otomatis saat pesanan dibatalkan.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Filter */}
                    <select
                      value={orderStatusFilter}
                      onChange={e => setOrderStatusFilter(e.target.value)}
                      className="bg-[#121217] border border-[#242432] text-xs font-mono p-2 text-white focus:outline-none"
                    >
                      <option value="All">Semua Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      onClick={fetchOrders}
                      className="p-2 bg-[#14141a] border border-[#262632] rounded text-xs font-mono flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-[#101015] border border-[#1e1e28] overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#14141b] text-[#868694] uppercase border-b border-[#1e1e28]">
                      <tr>
                        <th className="p-3.5">ID Pesanan</th>
                        <th className="p-3.5">Pelanggan & WhatsApp</th>
                        <th className="p-3.5">Kota</th>
                        <th className="p-3.5">Total Bayar</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181822]">
                      {orders
                        .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                        .map(order => (
                          <tr key={order.id} className="hover:bg-[#14141c] transition-colors">
                            <td className="p-3.5 font-bold text-white whitespace-nowrap">
                              {order.id}
                              <span className="block text-[10px] text-[#70707e]">
                                {formatDate(order.createdAt)}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span className="font-bold text-white font-sans">{order.customerName}</span>
                              <a
                                href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-[11px] text-[#50e3c2] hover:underline"
                              >
                                {order.whatsapp}
                              </a>
                            </td>
                            <td className="p-3.5 text-[#9a9aa8]">{order.city}</td>
                            <td className="p-3.5 font-bold font-mono-numbers text-white">
                              {formatIDR(order.totalAmount)}
                            </td>
                            <td className="p-3.5">
                              <select
                                value={order.status}
                                onChange={e => handleOrderStatusUpdate(order.id, e.target.value as OrderStatus)}
                                className={`text-[11px] font-bold py-1 px-2 border focus:outline-none bg-[#121218] ${
                                  order.status === 'Completed'
                                    ? 'text-[#50e3c2] border-[#22503d]'
                                    : order.status === 'Cancelled'
                                    ? 'text-[#f87171] border-[#552024]'
                                    : order.status === 'Shipped'
                                    ? 'text-[#60a5fa] border-[#203a55]'
                                    : 'text-[#fbbf24] border-[#554020]'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled (Restitusi Stok)</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => setSelectedOrderDetail(order)}
                                className="px-2.5 py-1 bg-[#181822] hover:bg-[#242432] text-[#d6d6ce] border border-[#2b2b3a]"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Detail Modal */}
                {selectedOrderDetail && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#101015] border border-[#2e2e3c] p-6 max-w-xl w-full space-y-4 font-mono text-xs max-h-[85vh] overflow-y-auto">
                      <div className="flex justify-between items-center border-b border-[#20202c] pb-3">
                        <div>
                          <span className="text-[10px] text-[#787886] uppercase">Rincian Lengkap Pesanan</span>
                          <h4 className="font-display text-2xl font-bold uppercase text-white">
                            {selectedOrderDetail.id}
                          </h4>
                        </div>
                        <button onClick={() => setSelectedOrderDetail(null)}>
                          <X className="w-5 h-5 text-[#888]" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-[#14141c] border border-[#22222e]">
                        <div>
                          <span className="text-[#787884] block">Nama Pelanggan:</span>
                          <span className="font-bold text-white font-sans">{selectedOrderDetail.customerName}</span>
                        </div>
                        <div>
                          <span className="text-[#787884] block">WhatsApp:</span>
                          <span className="font-bold text-[#50e3c2]">{selectedOrderDetail.whatsapp}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[#787884] block">Alamat Pengiriman:</span>
                          <span className="text-white">
                            {selectedOrderDetail.shippingAddress}, {selectedOrderDetail.city} {selectedOrderDetail.postalCode}
                          </span>
                        </div>
                        {selectedOrderDetail.notes && (
                          <div className="col-span-2">
                            <span className="text-[#787884] block">Catatan:</span>
                            <span className="text-[#d8d8d0] italic">{selectedOrderDetail.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        <span className="text-[#888894] uppercase block font-bold">Barang Dipesan:</span>
                        <div className="divide-y divide-[#1e1e28] border border-[#1e1e28]">
                          {selectedOrderDetail.items.map((item, idx) => (
                            <div key={idx} className="p-2.5 flex justify-between items-center bg-[#13131a]">
                              <div>
                                <p className="font-bold text-white font-sans">{item.productName}</p>
                                <p className="text-[10px] text-[#80808c]">
                                  Size {item.size} · {item.color} · Qty {item.quantity}
                                </p>
                              </div>
                              <span className="font-mono-numbers text-white font-bold">
                                {formatIDR(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-[#20202c]">
                        <div className="flex justify-between text-[#888894]">
                          <span>Subtotal:</span>
                          <span className="font-mono-numbers">{formatIDR(selectedOrderDetail.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-[#888894]">
                          <span>Ongkos Kirim:</span>
                          <span className="font-mono-numbers">{formatIDR(selectedOrderDetail.shippingFee)}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-[#22222e]">
                          <span>Total Pembayaran:</span>
                          <span className="font-mono-numbers text-[#50e3c2]">{formatIDR(selectedOrderDetail.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setSelectedOrderDetail(null)}
                          className="px-4 py-2 bg-[#f4f4f0] text-black font-bold uppercase"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- E. PENGATURAN TOKO ---------------- */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="pb-4 border-b border-[#1e1e26]">
                  <h2 className="font-display text-3xl font-extrabold uppercase text-white">
                    PENGATURAN TOKO
                  </h2>
                  <p className="text-xs font-mono text-[#8a8a96]">
                    Atur identitas brand, banner homepage, kontak WhatsApp, biaya ongkir, dan rekening bank.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-mono bg-[#101015] border border-[#1e1e28] p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Nama Brand</label>
                      <input
                        type="text"
                        value={settingsForm.brandName}
                        onChange={e => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">WhatsApp Order Line</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Hero Headline Utama</label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Hero Subheadline</label>
                      <input
                        type="text"
                        value={settingsForm.subtagline}
                        onChange={e => setSettingsForm({ ...settingsForm, subtagline: e.target.value })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#888894] uppercase">Pengumuman Banner (Announcement Bar)</label>
                    <input
                      type="text"
                      value={settingsForm.announcement}
                      onChange={e => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                      className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Tarif Flat Ongkir (IDR)</label>
                      <input
                        type="number"
                        value={settingsForm.flatShippingFee}
                        onChange={e => setSettingsForm({ ...settingsForm, flatShippingFee: Number(e.target.value) })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Ambang Gratis Ongkir (IDR)</label>
                      <input
                        type="number"
                        value={settingsForm.freeShippingThreshold}
                        onChange={e => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#888894] uppercase">Info Rekening Transfer Bank</label>
                    <textarea
                      rows={2}
                      value={settingsForm.bankDetails}
                      onChange={e => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })}
                      className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white resize-none"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-[#f4f4f0] hover:bg-white text-black font-bold uppercase tracking-wider"
                    >
                      Simpan Pengaturan Toko
                    </button>
                  </div>
                </form>

                {/* Form Ubah Password Admin */}
                <div className="bg-[#101015] border border-[#1e1e28] p-6 space-y-4 text-xs font-mono">
                  <div className="flex items-center gap-2 pb-3 border-b border-[#1e1e26]">
                    <KeyRound className="w-4 h-4 text-[#50e3c2]" />
                    <h3 className="font-display text-xl uppercase font-bold text-white">
                      KEAMANAN & UBAH PASSWORD ADMIN
                    </h3>
                  </div>

                  <p className="text-[#888894]">
                    Perbarui email login dan password untuk menjaga keamanan akses dashboard toko sebelum dipublikasikan.
                  </p>

                  {credMessage && (
                    <div
                      className={`p-3 border text-xs ${
                        credMessage.isError
                          ? 'bg-[#2a1315] border-[#6b252a] text-[#f87171]'
                          : 'bg-[#132a1c] border-[#22503d] text-[#50e3c2]'
                      }`}
                    >
                      {credMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleChangeCredentials} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[#888894] uppercase">Email Admin Baru (Kosongkan jika tetap)</label>
                      <input
                        type="email"
                        placeholder="admin@galursociety.com"
                        value={credForm.email}
                        onChange={e => setCredForm({ ...credForm, email: e.target.value })}
                        className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Password Saat Ini *</label>
                        <input
                          type="password"
                          required
                          placeholder="Password lama"
                          value={credForm.currentPassword}
                          onChange={e => setCredForm({ ...credForm, currentPassword: e.target.value })}
                          className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[#888894] uppercase">Password Baru *</label>
                        <input
                          type="password"
                          required
                          placeholder="Minimal 6 karakter"
                          value={credForm.newPassword}
                          onChange={e => setCredForm({ ...credForm, newPassword: e.target.value })}
                          className="w-full bg-[#15151c] border border-[#242432] p-2.5 text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isChangingCreds}
                        className="px-6 py-2.5 bg-[#1b1b24] hover:bg-[#252532] text-white border border-[#333344] font-bold uppercase tracking-wider disabled:opacity-50"
                      >
                        {isChangingCreds ? 'Memperbarui...' : 'Perbarui Password Admin'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
