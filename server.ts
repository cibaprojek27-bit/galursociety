import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import type { 
  Product, 
  ProductVariant, 
  Order, 
  OrderItem, 
  InventoryMovement, 
  StoreSettings, 
  DashboardSummary 
} from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));

// Database & Uploads storage directory
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'galur_store.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded product photos directly
app.use('/uploads', express.static(UPLOADS_DIR));

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  inventoryMovements: InventoryMovement[];
  settings: StoreSettings;
  adminTokens: string[];
  adminCredentials?: {
    email: string;
    password: string;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'GALUR SOCIETY',
  tagline: 'BUILT FROM THE STREETS.',
  subtagline: 'Independent Streetwear. Timeless Identity.',
  heroImage: '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg',
  whatsappNumber: '6281234567890',
  instagram: '@galursociety.archive',
  flatShippingFee: 22000,
  freeShippingThreshold: 500000,
  announcement: 'FREE SHIPPING ORDERS OVER RP 500.000 — ARCHIVE RELEASE 2026',
  bankDetails: 'BCA: 8830192831 a.n GALUR SOCIETY | Mandiri: 1370019283921 | QRIS All Payment',
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'gs-prod-01',
    name: '"SYSTEM REBELS" ARCHIVE VINTAGE TEE',
    slug: 'system-rebels-archive-vintage-tee',
    category: 'T-Shirt',
    description: 'Heavyweight boxy cut t-shirt crafted from premium 16s 240gsm combed cotton. Pre-shrunk with enzyme acid wash and distressed hand-cracked screenprint featuring the iconic Archive Atelier System Rebels skull insignia. Double-stitched raw neckband for old-school resilience.',
    materials: '100% Combed Cotton 16s (240 GSM) · Distressed Screenprint · Vintage Stone Wash',
    price: 285000,
    discountPrice: 255000,
    images: [
      '/src/assets/images/product_vintage_tee_1792935713250.jpg',
      '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg'
    ],
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-ts01-s', productId: 'gs-prod-01', size: 'S', color: 'Vintage Washed Black', stock: 6, sku: 'GS-TS01-S' },
      { id: 'v-ts01-m', productId: 'gs-prod-01', size: 'M', color: 'Vintage Washed Black', stock: 14, sku: 'GS-TS01-M' },
      { id: 'v-ts01-l', productId: 'gs-prod-01', size: 'L', color: 'Vintage Washed Black', stock: 18, sku: 'GS-TS01-L' },
      { id: 'v-ts01-xl', productId: 'gs-prod-01', size: 'XL', color: 'Vintage Washed Black', stock: 8, sku: 'GS-TS01-XL' },
      { id: 'v-ts01-xxl', productId: 'gs-prod-01', size: 'XXL', color: 'Vintage Washed Black', stock: 2, sku: 'GS-TS01-XXL' },
    ]
  },
  {
    id: 'gs-prod-02',
    name: '"OVERCASTE" ACID WASHED HEAVY HOODIE',
    slug: 'overcaste-acid-washed-heavy-hoodie',
    category: 'Hoodie',
    description: 'Custom-milled 420gsm heavy French terry fleece with manual garment acid fade, dropped shoulders, raw-edge distressed ribbed cuffs and hem, double-layered structured hood without drawstrings for a pure brutalist silhouette.',
    materials: '420 GSM French Terry Cotton · Acid Garment Wash · Raw Distressed Hem & Cuffs',
    price: 580000,
    discountPrice: 520000,
    images: [
      '/src/assets/images/product_acid_hoodie_1792935714157.jpg',
      '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg'
    ],
    isNewArrival: true,
    isBestSeller: true,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-hd02-s', productId: 'gs-prod-02', size: 'S', color: 'Acid Charcoal', stock: 3, sku: 'GS-HD02-S' },
      { id: 'v-hd02-m', productId: 'gs-prod-02', size: 'M', color: 'Acid Charcoal', stock: 9, sku: 'GS-HD02-M' },
      { id: 'v-hd02-l', productId: 'gs-prod-02', size: 'L', color: 'Acid Charcoal', stock: 12, sku: 'GS-HD02-L' },
      { id: 'v-hd02-xl', productId: 'gs-prod-02', size: 'XL', color: 'Acid Charcoal', stock: 5, sku: 'GS-HD02-XL' },
      { id: 'v-hd02-xxl', productId: 'gs-prod-02', size: 'XXL', color: 'Acid Charcoal', stock: 0, sku: 'GS-HD02-XXL' },
    ]
  },
  {
    id: 'gs-prod-03',
    name: '"BLACKSMITH" RUGGED CANVAS WORK JACKET',
    slug: 'blacksmith-rugged-canvas-work-jacket',
    category: 'Jacket',
    description: 'Heavyweight 14oz brushed cotton duck canvas shell treated with custom garment stone wash. Vintage corduroy collar, heavyweight antique brass #10 zipper, utility chest flap pocket with riveted corners, and quilted satin inner lining for thermal insulation.',
    materials: '14oz Cotton Duck Canvas · 100% Cotton Corduroy Collar · Quilted Satin Lining',
    price: 790000,
    discountPrice: null,
    images: [
      '/src/assets/images/product_work_jacket_1792935715027.jpg',
      '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg'
    ],
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-jk03-m', productId: 'gs-prod-03', size: 'M', color: 'Washed Industrial Black', stock: 4, sku: 'GS-JK03-M' },
      { id: 'v-jk03-l', productId: 'gs-prod-03', size: 'L', color: 'Washed Industrial Black', stock: 7, sku: 'GS-JK03-L' },
      { id: 'v-jk03-xl', productId: 'gs-prod-03', size: 'XL', color: 'Washed Industrial Black', stock: 3, sku: 'GS-JK03-XL' },
      { id: 'v-jk03-xxl', productId: 'gs-prod-03', size: 'XXL', color: 'Washed Industrial Black', stock: 1, sku: 'GS-JK03-XXL' },
    ]
  },
  {
    id: 'gs-prod-04',
    name: '"MEMENTO MORI" DISTRESSED THERMAL LONG SLEEVE',
    slug: 'memento-mori-distressed-thermal-long-sleeve',
    category: 'Long Sleeve',
    description: 'Heavy 220gsm waffle thermal knit sleeves combined with distressed jersey cotton body. Gothic discharge lettering with faded skull graphic, curved raw drop hem, and reinforced thumbhole cuffs.',
    materials: '220 GSM Combed Waffle Knit & Cotton Jersey · Discharge Print · Thumbhole Cuffs',
    price: 340000,
    discountPrice: 295000,
    images: [
      '/src/assets/images/product_longsleeve_grunge_1792935714653.jpg',
      '/src/assets/images/product_vintage_tee_1792935713250.jpg'
    ],
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-ls04-s', productId: 'gs-prod-04', size: 'S', color: 'Carbon Black', stock: 5, sku: 'GS-LS04-S' },
      { id: 'v-ls04-m', productId: 'gs-prod-04', size: 'M', color: 'Carbon Black', stock: 8, sku: 'GS-LS04-M' },
      { id: 'v-ls04-l', productId: 'gs-prod-04', size: 'L', color: 'Carbon Black', stock: 11, sku: 'GS-LS04-L' },
      { id: 'v-ls04-xl', productId: 'gs-prod-04', size: 'XL', color: 'Carbon Black', stock: 3, sku: 'GS-LS04-XL' },
      { id: 'v-ls04-xxl', productId: 'gs-prod-04', size: 'XXL', color: 'Carbon Black', stock: 0, sku: 'GS-LS04-XXL' },
    ]
  },
  {
    id: 'gs-prod-05',
    name: '"UNDERGROUND CELL" HEAVYWEIGHT GRAPHIC TEE',
    slug: 'underground-cell-heavyweight-graphic-tee',
    category: 'T-Shirt',
    description: 'Washed graphite finish with oversized dropped silhouette. High-density cracked chest graphic inspired by 90s underground industrial record labels. Pre-washed with silicone enzyme bath for authentic drape.',
    materials: '100% Combed Cotton 16s (240 GSM) · Silicone Soft-Wash · Cracked Plastisol Print',
    price: 295000,
    discountPrice: null,
    images: [
      '/src/assets/images/product_vintage_tee_1792935713250.jpg',
      '/src/assets/images/hero_streetwear_vintage_1792935711123.jpg'
    ],
    isNewArrival: false,
    isBestSeller: true,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-ts05-s', productId: 'gs-prod-05', size: 'S', color: 'Washed Graphite', stock: 4, sku: 'GS-TS05-S' },
      { id: 'v-ts05-m', productId: 'gs-prod-05', size: 'M', color: 'Washed Graphite', stock: 12, sku: 'GS-TS05-M' },
      { id: 'v-ts05-l', productId: 'gs-prod-05', size: 'L', color: 'Washed Graphite', stock: 15, sku: 'GS-TS05-L' },
      { id: 'v-ts05-xl', productId: 'gs-prod-05', size: 'XL', color: 'Washed Graphite', stock: 6, sku: 'GS-TS05-XL' },
      { id: 'v-ts05-xxl', productId: 'gs-prod-05', size: 'XXL', color: 'Washed Graphite', stock: 2, sku: 'GS-TS05-XXL' },
    ]
  },
  {
    id: 'gs-prod-06',
    name: '"ARCHIVE PROTOCOL" DISTRESSED DAD CAP',
    slug: 'archive-protocol-distressed-dad-cap',
    category: 'Accessories',
    description: 'Unstructured 6-panel washed cotton twill cap. Pre-curved visor with subtle abrasive edge distressing, antique brass hardware adjuster, and tonal embroidered Galur emblem.',
    materials: '100% Washed Cotton Twill · Antique Brass Buckle · Tonal Embroidery',
    price: 185000,
    discountPrice: null,
    images: [
      '/src/assets/images/product_work_jacket_1792935715027.jpg'
    ],
    isNewArrival: true,
    isBestSeller: false,
    isFeatured: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    variants: [
      { id: 'v-ac06-os', productId: 'gs-prod-06', size: 'One Size', color: 'Faded Black', stock: 16, sku: 'GS-AC06-OS' }
    ]
  }
];

// In-memory + persistent disk DB helper
class DatabaseStore {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDataDir();
    this.data = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          products: parsed.products || INITIAL_PRODUCTS,
          orders: parsed.orders || [],
          inventoryMovements: parsed.inventoryMovements || [],
          settings: parsed.settings || DEFAULT_SETTINGS,
          adminTokens: parsed.adminTokens || ['galur-session-token-master-2026'],
          adminCredentials: parsed.adminCredentials || {
            email: 'admin@galursociety.com',
            password: 'galur2026!',
          },
        };
      }
    } catch (err) {
      console.error('Error reading database file, using fallback initial data:', err);
    }

    const initial: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: [],
      inventoryMovements: [],
      settings: DEFAULT_SETTINGS,
      adminTokens: ['galur-session-token-master-2026'],
      adminCredentials: {
        email: 'admin@galursociety.com',
        password: 'galur2026!',
      },
    };
    this.saveImmediate(initial);
    return initial;
  }

  private saveImmediate(dataToSave: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    this.saveImmediate(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }
}

const db = new DatabaseStore();

// Admin auth middleware
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing authorization header' });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const validTokens = db.getData().adminTokens;
  if (!validTokens.includes(token) && token !== 'galur-session-token-master-2026') {
    res.status(403).json({ success: false, error: 'Forbidden: Invalid admin token' });
    return;
  }
  next();
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// Get Store Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getData().settings });
});

// Get Public Products
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, sort } = req.query;
  let products = db.getData().products.filter(p => p.status === 'active');

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    products = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
  } else {
    // Newest first by default
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ success: true, data: products });
});

// Get Product by ID or Slug
app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const product = db.getData().products.find(p => p.id === id || p.slug === id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: product });
});

// Create Customer Order (Server-authoritative inventory validation & atomic decrement)
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const { 
      customerName, 
      whatsapp, 
      email, 
      shippingAddress, 
      city, 
      postalCode, 
      notes, 
      paymentMethod, 
      items 
    } = req.body;

    if (!customerName || !whatsapp || !shippingAddress || !city || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Semua informasi pengiriman dan barang harus diisi.' });
      return;
    }

    const state = db.getData();

    // 1. Validate items and stock in real-time
    const validatedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = state.products.find(p => p.id === item.productId);
      if (!product || product.status !== 'active') {
        res.status(400).json({ success: false, error: `Produk "${item.productName || 'Item'}" tidak ditemukan atau tidak aktif.` });
        return;
      }

      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) {
        res.status(400).json({ success: false, error: `Ukuran/variasi untuk "${product.name}" tidak ditemukan.` });
        return;
      }

      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);
      if (variant.stock < requestedQty) {
        res.status(400).json({ 
          success: false, 
          error: `Stok untuk "${product.name} (Ukuran ${variant.size})" tidak mencukupi. Tersedia: ${variant.stock}, diminta: ${requestedQty}.` 
        });
        return;
      }

      const effectiveUnitPrice = product.discountPrice ?? product.price;
      subtotal += effectiveUnitPrice * requestedQty;

      validatedItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        size: variant.size,
        color: variant.color,
        unitPrice: effectiveUnitPrice,
        quantity: requestedQty,
        image: product.images[0] || ''
      });
    }

    // 2. Shipping calculation from store settings
    const settings = state.settings;
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
    const totalAmount = subtotal + shippingFee;

    const orderId = `GS-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // 3. Atomically decrement stock and generate audit trail records
    for (const item of validatedItems) {
      const product = state.products.find(p => p.id === item.productId)!;
      const variant = product.variants.find(v => v.id === item.variantId)!;

      const prevStock = variant.stock;
      variant.stock -= item.quantity;

      const movement: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantLabel: `${variant.size} / ${variant.color}`,
        type: 'out',
        quantityDelta: -item.quantity,
        previousStock: prevStock,
        newStock: variant.stock,
        reason: `Pesanan Baru #${orderId} (${customerName})`,
        performedBy: 'System / Customer Order',
        createdAt: new Date().toISOString()
      };
      state.inventoryMovements.unshift(movement);
    }

    // 4. Save new order
    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      whatsapp: whatsapp.trim(),
      email: (email || '').trim(),
      shippingAddress: shippingAddress.trim(),
      city: city.trim(),
      postalCode: (postalCode || '').trim(),
      notes: (notes || '').trim(),
      paymentMethod: paymentMethod || 'bank_transfer',
      status: 'Pending',
      subtotal,
      shippingFee,
      totalAmount,
      items: validatedItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.orders.unshift(newOrder);
    db.save();

    res.status(201).json({ success: true, data: newOrder });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Gagal memproses pesanan di server.' });
  }
});

// -------------------------------------------------------------
// ADMIN AUTHENTICATION
// -------------------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const state = db.getData();
  const configuredCreds = state.adminCredentials || {
    email: 'admin@galursociety.com',
    password: 'galur2026!',
  };

  if (email === configuredCreds.email && password === configuredCreds.password) {
    const token = `gs-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    if (!state.adminTokens.includes(token)) {
      state.adminTokens.push(token);
      db.save();
    }
    res.json({
      success: true,
      token,
      admin: {
        email: configuredCreds.email,
        name: 'Master Curator',
        role: 'SUPER_ADMIN',
      },
    });
    return;
  }

  res.status(401).json({ success: false, error: 'Email atau password admin tidak valid.' });
});

// Update Admin Credentials (Email / Password)
app.put('/api/admin/change-credentials', requireAdmin, (req: Request, res: Response) => {
  const { email, currentPassword, newPassword } = req.body;
  const state = db.getData();
  const currentCreds = state.adminCredentials || {
    email: 'admin@galursociety.com',
    password: 'galur2026!',
  };

  if (currentPassword !== currentCreds.password) {
    res.status(400).json({ success: false, error: 'Password saat ini tidak cocok.' });
    return;
  }

  if (newPassword && newPassword.length < 6) {
    res.status(400).json({ success: false, error: 'Password baru minimal 6 karakter.' });
    return;
  }

  state.adminCredentials = {
    email: email && email.trim() ? email.trim() : currentCreds.email,
    password: newPassword && newPassword.trim() ? newPassword.trim() : currentCreds.password,
  };
  db.save();

  res.json({
    success: true,
    message: 'Kredensial admin berhasil diperbarui.',
    email: state.adminCredentials.email,
  });
});

// Upload Product Photo from File / Gallery
app.post('/api/admin/upload', requireAdmin, (req: Request, res: Response) => {
  try {
    const { image, fileName } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ success: false, error: 'Data gambar wajib disertakan.' });
      return;
    }

    // Match Base64 Data URL
    const matches = image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ success: false, error: 'Format data gambar tidak valid (harus data:image/...;base64,...).' });
      return;
    }

    const rawExt = matches[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt.includes('png') ? 'png' : rawExt.includes('webp') ? 'webp' : 'jpg';
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanName = fileName ? fileName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30) : 'galur_prod';
    const uniqueFileName = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    res.json({ success: true, url: publicUrl });
  } catch (err: any) {
    console.error('Error handling product upload:', err);
    res.status(500).json({ success: false, error: 'Gagal mengunggah foto produk ke server.' });
  }
});

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// Dashboard Overview
app.get('/api/admin/overview', requireAdmin, (_req: Request, res: Response) => {
  const state = db.getData();
  const totalProducts = state.products.length;

  let totalStockUnits = 0;
  let lowStockCount = 0;
  let soldOutCount = 0;

  for (const product of state.products) {
    for (const v of product.variants) {
      totalStockUnits += v.stock;
      if (v.stock === 0) {
        soldOutCount++;
      } else if (v.stock <= 4) {
        lowStockCount++;
      }
    }
  }

  const validOrders = state.orders.filter(o => o.status !== 'Cancelled');
  const totalOrders = state.orders.length;
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const summary: DashboardSummary = {
    totalProducts,
    totalStockUnits,
    lowStockCount,
    soldOutCount,
    totalOrders,
    totalRevenue
  };

  res.json({ success: true, data: summary });
});

// List all products for admin
app.get('/api/admin/products', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getData().products });
});

// Create new product
app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      materials,
      price,
      discountPrice,
      images,
      isNewArrival,
      isBestSeller,
      isFeatured,
      status,
      variants
    } = req.body;

    if (!name || !price || !category) {
      res.status(400).json({ success: false, error: 'Nama, kategori, dan harga wajib diisi.' });
      return;
    }

    const state = db.getData();
    const id = `gs-prod-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const formattedVariants: ProductVariant[] = (variants || []).map((v: any, idx: number) => ({
      id: `v-${id}-${idx}`,
      productId: id,
      size: v.size || 'M',
      color: v.color || 'Vintage Black',
      stock: Math.max(0, parseInt(v.stock, 10) || 0),
      sku: v.sku || `GS-${category.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
    }));

    const newProduct: Product = {
      id,
      name,
      slug,
      category,
      description: description || '',
      materials: materials || '100% Heavy Combed Cotton 16s',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/product_vintage_tee_1792935713250.jpg'],
      isNewArrival: Boolean(isNewArrival),
      isBestSeller: Boolean(isBestSeller),
      isFeatured: Boolean(isFeatured),
      status: status === 'hidden' ? 'hidden' : 'active',
      variants: formattedVariants,
      createdAt: new Date().toISOString()
    };

    // Log initial stock movements
    for (const v of formattedVariants) {
      if (v.stock > 0) {
        state.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: id,
          productName: name,
          variantId: v.id,
          variantLabel: `${v.size} / ${v.color}`,
          type: 'in',
          quantityDelta: v.stock,
          previousStock: 0,
          newStock: v.stock,
          reason: 'Initial Product Stock In',
          performedBy: 'Admin',
          createdAt: new Date().toISOString()
        });
      }
    }

    state.products.unshift(newProduct);
    db.save();

    res.status(201).json({ success: true, data: newProduct });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Gagal membuat produk baru.' });
  }
});

// Update product
app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const state = db.getData();
  const index = state.products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    return;
  }

  const existing = state.products[index];
  const payload = req.body;

  // Process variants and audit stock changes
  let updatedVariants = existing.variants;
  if (Array.isArray(payload.variants)) {
    updatedVariants = payload.variants.map((v: any, idx: number) => {
      const existingVar = existing.variants.find(ev => ev.id === v.id);
      const newStock = Math.max(0, parseInt(v.stock, 10) || 0);

      if (existingVar && existingVar.stock !== newStock) {
        const delta = newStock - existingVar.stock;
        state.inventoryMovements.unshift({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: existing.id,
          productName: payload.name || existing.name,
          variantId: existingVar.id,
          variantLabel: `${existingVar.size} / ${existingVar.color}`,
          type: delta > 0 ? 'in' : 'out',
          quantityDelta: delta,
          previousStock: existingVar.stock,
          newStock: newStock,
          reason: 'Admin Product Edit Update',
          performedBy: 'Admin',
          createdAt: new Date().toISOString()
        });
      }

      return {
        id: v.id || `v-${id}-${idx}-${Date.now()}`,
        productId: id,
        size: v.size || 'M',
        color: v.color || 'Vintage Black',
        stock: newStock,
        sku: v.sku || existingVar?.sku || `GS-${id.substring(0, 4)}`
      };
    });
  }

  const updatedProduct: Product = {
    ...existing,
    name: payload.name ?? existing.name,
    category: payload.category ?? existing.category,
    description: payload.description ?? existing.description,
    materials: payload.materials ?? existing.materials,
    price: payload.price !== undefined ? Number(payload.price) : existing.price,
    discountPrice: payload.discountPrice !== undefined ? (payload.discountPrice ? Number(payload.discountPrice) : null) : existing.discountPrice,
    images: payload.images ?? existing.images,
    isNewArrival: payload.isNewArrival !== undefined ? Boolean(payload.isNewArrival) : existing.isNewArrival,
    isBestSeller: payload.isBestSeller !== undefined ? Boolean(payload.isBestSeller) : existing.isBestSeller,
    isFeatured: payload.isFeatured !== undefined ? Boolean(payload.isFeatured) : existing.isFeatured,
    status: payload.status ?? existing.status,
    variants: updatedVariants
  };

  state.products[index] = updatedProduct;
  db.save();

  res.json({ success: true, data: updatedProduct });
});

// Delete product
app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const state = db.getData();
  const initialLen = state.products.length;
  state.products = state.products.filter(p => p.id !== id);

  if (state.products.length === initialLen) {
    res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    return;
  }

  db.save();
  res.json({ success: true, message: 'Produk berhasil dihapus.' });
});

// Manual Stock Adjustment (+ or -) with Audit Trail
app.post('/api/admin/inventory/adjust', requireAdmin, (req: Request, res: Response) => {
  const { productId, variantId, delta, reason } = req.body;

  if (!productId || !variantId || delta === undefined || !reason) {
    res.status(400).json({ success: false, error: 'Product ID, Variant ID, jumlah perubahan (delta), dan alasan wajib diisi.' });
    return;
  }

  const state = db.getData();
  const product = state.products.find(p => p.id === productId);
  if (!product) {
    res.status(404).json({ success: false, error: 'Produk tidak ditemukan.' });
    return;
  }

  const variant = product.variants.find(v => v.id === variantId);
  if (!variant) {
    res.status(404).json({ success: false, error: 'Variasi produk tidak ditemukan.' });
    return;
  }

  const numDelta = parseInt(delta, 10);
  if (isNaN(numDelta) || numDelta === 0) {
    res.status(400).json({ success: false, error: 'Jumlah perubahan tidak valid atau bernilai nol.' });
    return;
  }

  const targetStock = variant.stock + numDelta;
  if (targetStock < 0) {
    res.status(400).json({ 
      success: false, 
      error: `Stok tidak boleh negatif! Stok saat ini: ${variant.stock}, pengurangan diminta: ${Math.abs(numDelta)}.` 
    });
    return;
  }

  const prevStock = variant.stock;
  variant.stock = targetStock;

  const movement: InventoryMovement = {
    id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: product.id,
    productName: product.name,
    variantId: variant.id,
    variantLabel: `${variant.size} / ${variant.color}`,
    type: numDelta > 0 ? 'in' : 'out',
    quantityDelta: numDelta,
    previousStock: prevStock,
    newStock: targetStock,
    reason: String(reason).trim(),
    performedBy: 'Admin',
    createdAt: new Date().toISOString()
  };

  state.inventoryMovements.unshift(movement);
  db.save();

  res.json({ success: true, data: { variant, movement } });
});

// Inventory Movements Log
app.get('/api/admin/inventory/movements', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, data: db.getData().inventoryMovements });
});

// Orders List for Admin
app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
  const { status, search } = req.query;
  let orders = [...db.getData().orders];

  if (status && status !== 'All') {
    orders = orders.filter(o => o.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q) || 
      o.customerName.toLowerCase().includes(q) ||
      o.whatsapp.includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, data: orders });
});

// Update Order Status (With automatic stock restitution on Cancellation!)
app.put('/api/admin/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Paid', 'Processing', 'Shipped', 'Completed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: 'Status pesanan tidak valid.' });
    return;
  }

  const state = db.getData();
  const order = state.orders.find(o => o.id === id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan.' });
    return;
  }

  const previousStatus = order.status;

  // Handle stock restitution if cancelled!
  if (previousStatus !== 'Cancelled' && status === 'Cancelled') {
    for (const item of order.items) {
      const product = state.products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          const prev = variant.stock;
          variant.stock += item.quantity;

          state.inventoryMovements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: `${variant.size} / ${variant.color}`,
            type: 'in',
            quantityDelta: item.quantity,
            previousStock: prev,
            newStock: variant.stock,
            reason: `Restitusi Stok: Pembatalan Pesanan #${order.id}`,
            performedBy: 'Admin / Order Cancellation',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  } else if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
    // If un-cancelling, re-deduct if stock available
    for (const item of order.items) {
      const product = state.products.find(p => p.id === item.productId);
      if (product) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (variant) {
          if (variant.stock < item.quantity) {
            res.status(400).json({ 
              success: false, 
              error: `Tidak dapat mengaktifkan pesanan kembali: Stok untuk ${product.name} (${variant.size}) tersisa ${variant.stock}, dibutuhkan ${item.quantity}.` 
            });
            return;
          }
          const prev = variant.stock;
          variant.stock -= item.quantity;

          state.inventoryMovements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: `${variant.size} / ${variant.color}`,
            type: 'out',
            quantityDelta: -item.quantity,
            previousStock: prev,
            newStock: variant.stock,
            reason: `Pengurangan Stok: Pesanan #${order.id} Diaktifkan Kembali`,
            performedBy: 'Admin',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  db.save();

  res.json({ success: true, data: order });
});

// Update Store Settings
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const state = db.getData();
  state.settings = {
    ...state.settings,
    ...req.body
  };
  db.save();
  res.json({ success: true, data: state.settings });
});

// -------------------------------------------------------------
// VITE INTEGRATION & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Galur Society] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
