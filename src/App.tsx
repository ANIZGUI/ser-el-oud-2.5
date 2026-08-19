import { supabase } from "./utils/supabase";
import {
  type FormEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  Archive,
  Ban,
  BadgeCheck,
  Boxes,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit3,
  Gift,
  Heart,
  Leaf,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tags,
  Trash2,
  Truck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import {
  type Product,
  products as catalogProducts,
  reviews,
  storeStats,
} from "./data/catalog";

/* ───────────────────────── TYPES ───────────────────────── */

type Page =
  | "home"
  | "catalogue"
  | "story"
  | "services"
  | "contact"
  | "tracking"
  | "admin";

type SortKey = "featured" | "price-low" | "price-high" | "rating";
type Cart = Record<string, number>;
type AdminTab = "overview" | "orders" | "categories" | "admins" | "inventory";
type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Delivered"
  | "Cancelled";
type AdminRole = "Owner" | "Manager" | "Sales" | "Stock";
type AdminStatus = "Active" | "Paused";
type StoreProduct = Omit<Product, "category"> & { category: string };

type AdminOrder = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  date: string;
  items: string;
  total: number;
  status: OrderStatus;
  gift: boolean;
};

type AdminCategory = {
  id: string;
  name: string;
  products: number;
  active: boolean;
  margin: number;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastSeen: string;
};

type SupabaseProductRow = {
  id: string;
  name?: string | null;
  line?: string | null;
  category?: string | null;
  price?: number | null;
  volume?: string | null;
  concentration?: string | null;
  rating?: number | null;
  stock?: number | null;
  mood?: string | null;
  notes?: string[] | string | null;
  description?: string | null;
  tag?: string | null;
  swatch?: string | null;
  image_position?: string | null;
  imagePosition?: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
};

type NewProductInput = {
  name: string;
  line: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  imageUrl: string;
  notes: string[];
};

type SupabaseCategoryRow = {
  id: string;
  name: string;
  active: boolean;
  margin: number;
};

/* ───────────────────────── CONSTANTS ───────────────────────── */

const navigation: Array<{ id: Page; label: string }> = [
  { id: "home", label: "Home" },
  { id: "catalogue", label: "Catalogue" },
  { id: "story", label: "Story" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
  { id: "tracking", label: "Suivi" },
  { id: "admin", label: "Login" },
];

const socialLinks: Array<{
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}> = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://instagram.com/serreloud",
    icon: <InstagramIcon />,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://facebook.com/serreloud",
    icon: <FacebookIcon />,
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://tiktok.com/@serreloud",
    icon: <TikTokIcon />,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/21620200888",
    icon: <MessageCircle size={18} />,
  },
];

const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  "price-low": "Price low",
  "price-high": "Price high",
  rating: "Top rated",
};

const pageTitles: Record<Page, string> = {
  home: "Serr El Oud",
  catalogue: "Product Catalogue",
  story: "Our House",
  services: "Private Services",
  contact: "Visit And Order",
  tracking: "Suivi Commande",
  admin: "Tableau de bord",
};

const formatPrice = (price: number) => `${price} DT`;

const adminCredentials = {
  email: "admin@serreloud.tn",
  password: "admin1234",
};

const orderStatuses: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Delivered",
  "Cancelled",
];

const adminRoles: AdminRole[] = ["Owner", "Manager", "Sales", "Stock"];

const adminTabs: Array<{
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: ClipboardList },
  { id: "inventory", label: "Produits / Stock", icon: Boxes },
  { id: "categories", label: "Catégories", icon: Tags },
  { id: "admins", label: "Administrateurs", icon: UserCog },
];

const adminTabDescriptions: Record<AdminTab, string> = {
  overview: "Vue d’ensemble de votre activité",
  orders: "Suivi et traitement des commandes",
  inventory: "Catalogue, prix et niveaux de stock",
  categories: "Organisation du catalogue",
  admins: "Accès et rôles de l’équipe",
};

const orderStatusLabels: Record<OrderStatus, string> = {
  Pending: "En attente",
  Confirmed: "Confirmée",
  Preparing: "En préparation",
  Delivered: "Livrée",
  Cancelled: "Annulée",
};

const adminRoleLabels: Record<AdminRole, string> = {
  Owner: "Propriétaire",
  Manager: "Responsable",
  Sales: "Ventes",
  Stock: "Stock",
};

const formatAdminPrice = (price: number) =>
  new Intl.NumberFormat("fr-TN", {
    style: "currency",
    currency: "TND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(price);

const formatAdminDate = (date: string) => {
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? date
    : new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(parsed);
};

const formatAdminActivity = (activity: string) => {
  if (activity === "Now") return "Maintenant";
  if (activity === "Yesterday") return "Hier";
  if (activity === "Invite sent") return "Invitation envoyée";
  const minutes = activity.match(/^(\d+) min ago$/);
  return minutes ? `Il y a ${minutes[1]} min` : activity;
};

/* ───────────────────────── INITIAL DATA ───────────────────────── */

const initialAdminOrders: AdminOrder[] = [
  {
    id: "CMD-1048",
    customer: "Leila Ben Ali",
    phone: "+216 22 418 900",
    address: "Rue Hedi Nouira, Ariana",
    date: "2026-08-09",
    items: "Oud Al-Mamlaka x1, Majlis Discovery Set x1",
    total: 425,
    status: "Preparing",
    gift: true,
  },
  {
    id: "CMD-1047",
    customer: "Youssef Mansour",
    phone: "+216 98 771 204",
    address: "Lac 2, Tunis",
    date: "2026-08-08",
    items: "Musk El-Sahara x2",
    total: 390,
    status: "Confirmed",
    gift: false,
  },
  {
    id: "CMD-1046",
    customer: "Nadia Kacem",
    phone: "+216 54 320 118",
    address: "Menzah 6, Tunis",
    date: "2026-08-08",
    items: "Jardin Medina x1, Noir Souk x1",
    total: 430,
    status: "Pending",
    gift: false,
  },
  {
    id: "CMD-1045",
    customer: "Karim Trabelsi",
    phone: "+216 20 664 802",
    address: "Centre Ville, Ariana",
    date: "2026-08-07",
    items: "Amber Al-Noor x1",
    total: 220,
    status: "Delivered",
    gift: true,
  },
];

const initialAdminCategories: AdminCategory[] = [
  { id: "cat-oud", name: "Oud", products: 2, active: true, margin: 42 },
  { id: "cat-musk", name: "Musk", products: 3, active: true, margin: 38 },
  { id: "cat-amber", name: "Amber", products: 2, active: true, margin: 40 },
  { id: "cat-gift", name: "Gift", products: 1, active: true, margin: 35 },
];

const initialAdminUsers: AdminUser[] = [
  {
    id: "adm-1",
    name: "Amina Souissi",
    email: "amina@serreloud.tn",
    role: "Owner",
    status: "Active",
    lastSeen: "Now",
  },
  {
    id: "adm-2",
    name: "Hatem Dridi",
    email: "hatem@serreloud.tn",
    role: "Manager",
    status: "Active",
    lastSeen: "12 min ago",
  },
  {
    id: "adm-3",
    name: "Sarra Mejri",
    email: "sarra@serreloud.tn",
    role: "Sales",
    status: "Paused",
    lastSeen: "Yesterday",
  },
];

/* ───────────────────────── HELPERS ───────────────────────── */

function createNextOrderId() {
  return `CMD-${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
}

function normalizeStock(stock: number) {
  if (!Number.isFinite(stock)) return 0;
  return Math.max(0, Math.min(Math.round(stock), 99));
}

function normalizePrice(price: number) {
  if (!Number.isFinite(price)) return 1;
  return Math.max(1, Math.min(Math.round(price), 9999));
}

function normalizeRating(rating: number) {
  if (!Number.isFinite(rating)) return 0;
  return Math.max(0, Math.min(Math.round(rating * 10) / 10, 5));
}

function normalizeNotes(
  notes: string[] | string | null | undefined,
  fallback: string[] = []
) {
  const rawNotes = Array.isArray(notes)
    ? notes
    : typeof notes === "string"
      ? notes.split(",")
      : fallback;
  const cleanNotes = rawNotes.map((note) => note.trim()).filter(Boolean);
  return cleanNotes.length > 0 ? cleanNotes : ["oud"];
}

function productImageSrc(product: StoreProduct) {
  return product.imageUrl?.trim() || "/hero.jpg";
}

function handleProductImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = "/hero.jpg";
}

function createProductSlug(name: string, existingIds: string[]) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "produit";
  let nextId = base;
  let count = 2;
  while (existingIds.includes(nextId)) {
    nextId = `${base}-${count}`;
    count += 1;
  }
  return nextId;
}

function productFromSupabaseRow(
  row: SupabaseProductRow,
  fallback?: StoreProduct
): StoreProduct {
  const name = row.name?.trim() || fallback?.name || "Produit sans nom";
  const category = row.category?.trim() || fallback?.category || "Oud";
  return {
    id: row.id,
    name,
    line: row.line?.trim() || fallback?.line || "Signature maison",
    category,
    price: normalizePrice(Number(row.price ?? fallback?.price ?? 1)),
    volume: row.volume?.trim() || fallback?.volume || "50 ml",
    concentration: row.concentration?.trim() || fallback?.concentration || "Parfum",
    rating: normalizeRating(Number(row.rating ?? fallback?.rating ?? 4.5)),
    stock: normalizeStock(Number(row.stock ?? fallback?.stock ?? 0)),
    mood:
      row.mood?.trim() ||
      fallback?.mood ||
      "Signature orientale, elegante, facile a porter",
    notes: normalizeNotes(row.notes, fallback?.notes ?? [category]),
    description:
      row.description?.trim() ||
      fallback?.description ||
      `${name} rejoint le catalogue Serr El Oud avec une composition orientale soignee.`,
    tag: row.tag?.trim() || fallback?.tag,
    swatch: row.swatch?.trim() || fallback?.swatch || "#8f5a2f",
    imagePosition:
      row.image_position?.trim() ||
      row.imagePosition?.trim() ||
      fallback?.imagePosition ||
      "50% 50%",
    imageUrl: row.image_url?.trim() || row.imageUrl?.trim() || fallback?.imageUrl || "",
  };
}

function productToSupabaseRow(product: StoreProduct) {
  return {
    id: product.id,
    name: product.name,
    line: product.line,
    category: product.category,
    price: product.price,
    volume: product.volume,
    concentration: product.concentration,
    rating: product.rating,
    stock: product.stock,
    mood: product.mood,
    notes: product.notes,
    description: product.description,
    tag: product.tag ?? null,
    swatch: product.swatch,
    image_position: product.imagePosition,
    image_url: product.imageUrl ?? "",
  };
}

function productToMinimalSupabaseRow(product: StoreProduct) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock,
  };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone: string) {
  return phone.replace(/\D/g, "").length >= 8;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function validateContactOrder({
  address,
  cartItems,
  message,
  name,
  phone,
}: {
  address: string;
  cartItems: Array<{ product: StoreProduct; quantity: number }>;
  message: string;
  name: string;
  phone: string;
}) {
  if (name.trim().length < 2) return "Name must contain at least 2 characters.";
  if (!isValidPhone(phone)) return "Phone must contain at least 8 digits.";
  if (address.trim().length < 8)
    return "Address must contain at least 8 characters.";
  if (cartItems.length === 0 && message.trim().length < 10) {
    return "Add products to the cart or write a request of at least 10 characters.";
  }
  return "";
}

function getStatusStep(status: OrderStatus) {
  const stepByStatus: Record<OrderStatus, number> = {
    Pending: 0,
    Confirmed: 1,
    Preparing: 2,
    Delivered: 3,
    Cancelled: -1,
  };
  return stepByStatus[status];
}

/* ═══════════════════════════════════════════════════════════
   APP COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [inventoryProducts, setInventoryProducts] =
    useState<StoreProduct[]>(catalogProducts);
  const [selectedProductId, setSelectedProductId] = useState(catalogProducts[0].id);
  const [cart, setCart] = useState<Cart>({});
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>(initialAdminOrders);
  const [adminCategories, setAdminCategories] =
    useState<AdminCategory[]>(initialAdminCategories);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState(320);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactMessage, setContactMessage] = useState(
    "I would like a fragrance recommendation."
  );
  const [submitted, setSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState("");
  const [giftOrder, setGiftOrder] = useState(false);
  const [contactError, setContactError] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  const activeCategoryNames = adminCategories
    .filter((item) => item.active)
    .map((item) => item.name);

  const catalogueCategoryOptions = ["All", ...activeCategoryNames];

  const priceCeiling = Math.max(
    320,
    ...inventoryProducts.map((product) => product.price)
  );

  /* ---------- Supabase fetch ---------- */

  useEffect(() => {
    if (!supabase) return;
    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchOrders() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Erreur chargement commandes:", error);
      return;
    }
    setAdminOrders((data ?? []) as AdminOrder[]);
  }

  async function fetchProducts() {
    if (!supabase) return;
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Erreur chargement produits:", error);
      return;
    }
    const rows = (data ?? []) as SupabaseProductRow[];
    setInventoryProducts((current) => {
      const rowsById = new Map(rows.map((row) => [row.id, row]));
      const currentById = new Map(current.map((product) => [product.id, product]));
      const catalogById = new Map(
        catalogProducts.map((product) => [product.id, product as StoreProduct])
      );

      const merged = current.map((product) => {
        const row = rowsById.get(product.id);
        return row ? productFromSupabaseRow(row, product) : product;
      });

      rows.forEach((row) => {
        if (currentById.has(row.id)) return;
        merged.push(productFromSupabaseRow(row, catalogById.get(row.id)));
      });

      return merged;
    });
  }

  async function fetchCategories() {
    if (!supabase) return;
    const { data, error } = await supabase.from("categories").select("*");
    if (error) {
      console.error("Erreur chargement categories:", error);
      return;
    }
    const rows = (data ?? []) as SupabaseCategoryRow[];
    setAdminCategories(
      rows.map((cat) => ({
        id: cat.id,
        name: cat.name,
        active: cat.active,
        margin: cat.margin,
        products: 0,
      }))
    );
  }

  /* ---------- Computed ---------- */

  const selectedProduct =
    inventoryProducts.find((p) => p.id === selectedProductId) ??
    inventoryProducts[0];

  const filteredProducts = useMemo(() => {
    const nq = query.trim().toLowerCase();
    const result = inventoryProducts.filter((product) => {
      const matchCat = activeCategoryNames.includes(product.category);
      const matchSel = category === "All" || product.category === category;
      const matchPrice = product.price <= maxPrice;
      const matchStock = !inStockOnly || product.stock > 0;
      const searchable = [
        product.name,
        product.line,
        product.category,
        product.mood,
        product.description,
        ...product.notes,
      ]
        .join(" ")
        .toLowerCase();

      return matchCat && matchSel && matchPrice && matchStock && searchable.includes(nq);
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return (
        inventoryProducts.findIndex((i) => i.id === a.id) -
        inventoryProducts.findIndex((i) => i.id === b.id)
      );
    });
  }, [activeCategoryNames, category, inStockOnly, inventoryProducts, maxPrice, query, sort]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const product = inventoryProducts.find((i) => i.id === id);
          return product ? { product, quantity: qty } : null;
        })
        .filter(Boolean) as Array<{ product: StoreProduct; quantity: number }>,
    [cart, inventoryProducts]
  );

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const contactReady =
    validateContactOrder({
      address: contactAddress,
      cartItems,
      message: contactMessage,
      name: contactName,
      phone: contactPhone,
    }) === "";

  /* ---------- Navigation ---------- */

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Cart ---------- */

  function addToCart(productId: string) {
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product || product.stock <= 0) return;
    setSubmitted(false);
    setSubmittedOrderId("");
    setContactError("");
    setCart((c) => ({
      ...c,
      [productId]: Math.min((c[productId] ?? 0) + 1, product.stock, 9),
    }));
    setCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) return;
    setCart((c) => {
      const next = (c[productId] ?? 0) + delta;
      if (next <= 0) {
        const n = { ...c };
        delete n[productId];
        return n;
      }
      return { ...c, [productId]: Math.min(next, product.stock, 9) };
    });
  }

  function removeFromCart(productId: string) {
    setCart((c) => {
      const n = { ...c };
      delete n[productId];
      return n;
    });
  }

  function syncCartQuantityWithStock(productId: string, nextStock: number) {
    setCart((c) => {
      if (c[productId] === undefined) return c;
      const n = { ...c };
      if (nextStock <= 0) {
        delete n[productId];
      } else {
        n[productId] = Math.min(n[productId], nextStock, 9);
      }
      return n;
    });
  }

  async function saveProductToSupabase(product: StoreProduct) {
    if (!supabase) return true;

    const { error } = await supabase
      .from("products")
      .upsert(productToSupabaseRow(product), { onConflict: "id" });

    if (!error) return true;

    console.error("Erreur sauvegarde produit complet:", error);

    const { error: fallbackError } = await supabase
      .from("products")
      .upsert(productToMinimalSupabaseRow(product), { onConflict: "id" });

    if (fallbackError) {
      console.error("Erreur sauvegarde produit:", fallbackError);
      return false;
    }

    console.warn(
      "Produit sauvegarde avec les champs basiques seulement. Ajoutez les colonnes image_url et rating dans Supabase pour garder l'image et la note apres rechargement."
    );
    return true;
  }

  async function updateProduct(productId: string, patch: Partial<StoreProduct>) {
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) {
      console.error(`Produit introuvable: ${productId}`);
      return false;
    }

    const nextProduct: StoreProduct = {
      ...product,
      ...patch,
      price:
        patch.price === undefined
          ? product.price
          : normalizePrice(Number(patch.price)),
      stock:
        patch.stock === undefined
          ? product.stock
          : normalizeStock(Number(patch.stock)),
      rating:
        patch.rating === undefined
          ? product.rating
          : normalizeRating(Number(patch.rating)),
      imageUrl:
        patch.imageUrl === undefined ? product.imageUrl : patch.imageUrl.trim(),
      notes: patch.notes === undefined ? product.notes : normalizeNotes(patch.notes),
    };

    const saved = await saveProductToSupabase(nextProduct);
    if (!saved) return false;

    setInventoryProducts((current) =>
      current.map((item) => (item.id === productId ? nextProduct : item))
    );

    if (patch.stock !== undefined) {
      syncCartQuantityWithStock(productId, nextProduct.stock);
    }
    if (patch.price !== undefined) {
      setMaxPrice((current) => Math.max(current, nextProduct.price));
    }
    if (patch.category && !activeCategoryNames.includes(patch.category)) {
      setCategory("All");
    }

    return true;
  }

  async function addProduct(input: NewProductInput) {
    const product: StoreProduct = {
      id: createProductSlug(input.name, inventoryProducts.map((item) => item.id)),
      name: input.name.trim(),
      line: input.line.trim() || "Signature maison",
      category: input.category,
      price: normalizePrice(input.price),
      volume: "50 ml",
      concentration: "Parfum",
      rating: normalizeRating(input.rating),
      stock: normalizeStock(input.stock),
      mood: normalizeNotes(input.notes, [input.category]).join(", "),
      notes: normalizeNotes(input.notes, [input.category]),
      description: `${input.name.trim()} rejoint le catalogue Serr El Oud avec une composition orientale soignee.`,
      swatch: "#8f5a2f",
      imagePosition: "50% 50%",
      imageUrl: input.imageUrl.trim(),
    };

    const saved = await saveProductToSupabase(product);
    if (!saved) return false;

    setInventoryProducts((current) => [...current, product]);
    setSelectedProductId(product.id);
    setMaxPrice((current) => Math.max(current, product.price));
    return true;
  }

  /* ---------- Submit contact ---------- */

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const msg = validateContactOrder({
      address: contactAddress,
      cartItems,
      message: contactMessage,
      name: contactName,
      phone: contactPhone,
    });

    if (msg) {
      setContactError(msg);
      return;
    }

    const orderId = createNextOrderId();
    const orderItems =
      cartItems.length > 0
        ? cartItems.map(({ product, quantity }) => `${product.name} x${quantity}`).join(", ")
        : contactMessage.trim() || "Custom fragrance request";

    const newOrder: AdminOrder = {
      id: orderId,
      customer: contactName.trim(),
      phone: contactPhone.trim(),
      address: contactAddress.trim(),
      date: new Date().toISOString().slice(0, 10),
      items: orderItems,
      total: cartTotal,
      status: "Pending",
      gift: giftOrder,
    };

    if (supabase) {
      const { error } = await supabase.from("orders").insert([newOrder]);
      if (error) {
        console.error("Erreur insertion commande:", error);
        setContactError("Erreur lors de l'enregistrement de la commande.");
        return;
      }

      if (cartItems.length > 0) {
        for (const { product, quantity } of cartItems) {
          const nextStock = normalizeStock(product.stock - quantity);
          await supabase.from("products").upsert(
            {
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.price,
              stock: nextStock,
            },
            { onConflict: "id" }
          );
        }
      }

      await fetchOrders();
      await fetchProducts();
    } else {
      setAdminOrders((current) => [newOrder, ...current]);
      setInventoryProducts((current) =>
        current.map((product) => {
          const cartItem = cartItems.find((item) => item.product.id === product.id);
          return cartItem
            ? { ...product, stock: normalizeStock(product.stock - cartItem.quantity) }
            : product;
        })
      );
    }

    setSubmittedOrderId(orderId);
    setSubmitted(true);
    setContactError("");
    setGiftOrder(false);
    setCart({});
    setCartOpen(false);
  }

  /* ---------- Order status ---------- */

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    if (!supabase) {
      setAdminOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
      return;
    }

    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error("Erreur mise à jour statut:", error);
      return;
    }
    await fetchOrders();
  }

  /* ---------- Product stock ---------- */

  async function updateProductStock(productId: string, stock: number) {
    const nextStock = normalizeStock(stock);
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) {
      console.error(`Produit introuvable: ${productId}`);
      return;
    }

    if (!supabase) {
      setInventoryProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, stock: nextStock } : item
        )
      );
      syncCartQuantityWithStock(productId, nextStock);
      return;
    }

    const { error } = await supabase.from("products").upsert(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: nextStock,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Erreur mise à jour stock:", error);
      return;
    }

    console.log("✅ Stock mis à jour:", productId, nextStock);
    await fetchProducts();
    syncCartQuantityWithStock(productId, nextStock);
  }

  /* ---------- Product price ---------- */

  async function updateProductPrice(productId: string, price: number) {
    const nextPrice = normalizePrice(price);
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) {
      console.error(`Produit introuvable: ${productId}`);
      return;
    }

    if (!supabase) {
      setInventoryProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, price: nextPrice } : item
        )
      );
      setMaxPrice((c) => Math.max(c, nextPrice));
      return;
    }

    const { error } = await supabase.from("products").upsert(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: nextPrice,
        stock: product.stock,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Erreur mise à jour prix:", error);
      return;
    }

    console.log("✅ Prix mis à jour:", productId, nextPrice);
    await fetchProducts();
    setMaxPrice((c) => Math.max(c, nextPrice));
  }

  /* ---------- Product category ---------- */

  async function updateProductCategory(productId: string, nextCategory: string) {
    if (!adminCategories.some((i) => i.name === nextCategory)) return;
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) {
      console.error(`Produit introuvable: ${productId}`);
      return;
    }

    if (!supabase) {
      setInventoryProducts((current) =>
        current.map((item) =>
          item.id === productId ? { ...item, category: nextCategory } : item
        )
      );
      if (!activeCategoryNames.includes(nextCategory)) setCategory("All");
      return;
    }

    const { error } = await supabase.from("products").upsert(
      {
        id: product.id,
        name: product.name,
        category: nextCategory,
        price: product.price,
        stock: product.stock,
      },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Erreur mise à jour categorie:", error);
      return;
    }

    console.log("✅ Catégorie mise à jour:", productId, nextCategory);
    await fetchProducts();
  }

  async function updateProductRating(productId: string, rating: number) {
    await updateProduct(productId, { rating: normalizeRating(rating) });
  }

  async function updateProductImage(productId: string, imageUrl: string) {
    await updateProduct(productId, { imageUrl });
  }

  /* ---------- Admin categories ---------- */

  async function addAdminCategory(name: string) {
    const newCat = { id: `cat-${Date.now()}`, name, active: true, margin: 35 };
    if (!supabase) {
      setAdminCategories((current) => [...current, { ...newCat, products: 0 }]);
      return;
    }

    const { error } = await supabase.from("categories").insert([newCat]);
    if (error) {
      console.error("Erreur ajout categorie:", error);
      return;
    }
    await fetchCategories();
  }

  async function toggleAdminCategory(categoryId: string) {
    const cat = adminCategories.find((i) => i.id === categoryId);
    if (!cat) return;
    const nextActive = !cat.active;

    if (!supabase) {
      setAdminCategories((current) =>
        current.map((item) =>
          item.id === categoryId ? { ...item, active: nextActive } : item
        )
      );
      if (cat.active && category === cat.name) setCategory("All");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({ active: nextActive })
      .eq("id", categoryId);
    if (error) {
      console.error("Erreur toggle categorie:", error);
      return;
    }
    if (cat.active && category === cat.name) setCategory("All");
    await fetchCategories();
  }

  /* ---------- Render ---------- */

  return (
    <div className="min-h-screen bg-ivory text-ink">
      {page !== "admin" && (
        <Header
          cartCount={cartCount}
          currentPage={page}
          mobileOpen={mobileOpen}
          onCart={() => setCartOpen(true)}
          onMenu={() => setMobileOpen((o) => !o)}
          onNavigate={navigate}
        />
      )}

      <main>
        {page === "home" && (
          <HomePage
            products={inventoryProducts}
            onAddToCart={addToCart}
            onNavigate={navigate}
            onSelectProduct={setSelectedProductId}
          />
        )}
        {page === "catalogue" && (
          <CataloguePage
            category={category}
            categoryOptions={catalogueCategoryOptions}
            filteredProducts={filteredProducts}
            inStockOnly={inStockOnly}
            maxPrice={maxPrice}
            priceCeiling={priceCeiling}
            query={query}
            selectedProduct={selectedProduct}
            sort={sort}
            onAddToCart={addToCart}
            onCategory={setCategory}
            onInStockOnly={setInStockOnly}
            onMaxPrice={setMaxPrice}
            onQuery={setQuery}
            onSelectProduct={setSelectedProductId}
            onSort={setSort}
          />
        )}
        {page === "story" && <StoryPage onNavigate={navigate} />}
        {page === "services" && <ServicesPage onNavigate={navigate} />}
        {page === "contact" && (
          <ContactPage
            cartItems={cartItems}
            cartTotal={cartTotal}
            contactAddress={contactAddress}
            contactError={contactError}
            contactMessage={contactMessage}
            contactName={contactName}
            contactPhone={contactPhone}
            contactReady={contactReady}
            giftOrder={giftOrder}
            submitted={submitted}
            submittedOrderId={submittedOrderId}
            onContactMessage={(v) => {
              setContactMessage(v);
              setSubmitted(false);
              setSubmittedOrderId("");
              setContactError("");
            }}
            onContactName={(v) => {
              setContactName(v);
              setSubmitted(false);
              setSubmittedOrderId("");
              setContactError("");
            }}
            onContactPhone={(v) => {
              setContactPhone(v);
              setSubmitted(false);
              setSubmittedOrderId("");
              setContactError("");
            }}
            onContactAddress={(v) => {
              setContactAddress(v);
              setSubmitted(false);
              setSubmittedOrderId("");
              setContactError("");
            }}
            onGiftOrder={(v) => {
              setGiftOrder(v);
              setSubmitted(false);
              setSubmittedOrderId("");
              setContactError("");
            }}
            onNavigate={navigate}
            onSubmit={submitContact}
          />
        )}
        {page === "tracking" && (
          <OrderStatusPage
            initialPhone={contactPhone}
            initialReference={submittedOrderId}
            orders={adminOrders}
          />
        )}
        {page === "admin" && (
          <AdminPage
            authenticated={adminAuthenticated}
            categories={adminCategories}
            orders={adminOrders}
            products={inventoryProducts}
            onAddCategory={addAdminCategory}
            onAddProduct={addProduct}
            onGoToStore={() => navigate("home")}
            onLogin={() => setAdminAuthenticated(true)}
            onLogout={() => setAdminAuthenticated(false)}
            onProductCategory={updateProductCategory}
            onProductImage={updateProductImage}
            onProductPrice={updateProductPrice}
            onProductRating={updateProductRating}
            onOrderStatus={updateOrderStatus}
            onStockChange={updateProductStock}
            onToggleCategory={toggleAdminCategory}
            onRefresh={async () => {
              await Promise.all([fetchOrders(), fetchProducts(), fetchCategories()]);
            }}
          />
        )}
      </main>

      {page !== "admin" && <Footer onNavigate={navigate} />}

      <CartDrawer
        cartItems={cartItems}
        cartOpen={cartOpen}
        cartTotal={cartTotal}
        onClose={() => setCartOpen(false)}
        onNavigate={navigate}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════════════════════ */

function Header({
  cartCount,
  currentPage,
  mobileOpen,
  onCart,
  onMenu,
  onNavigate,
}: {
  cartCount: number;
  currentPage: Page;
  mobileOpen: boolean;
  onCart: () => void;
  onMenu: () => void;
  onNavigate: (p: Page) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-brass/15 bg-ivory/95 shadow-[0_8px_28px_rgba(37,31,23,0.055)] backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <button
          className="group flex shrink-0 items-center gap-3 rounded-xl text-left focus-visible:outline-brass"
          onClick={() => onNavigate("home")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-brass/35 bg-white/65 text-brass shadow-sm transition group-hover:border-brass/65 group-hover:bg-white">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold tracking-wide text-ink transition group-hover:text-sage">
              Serr El Oud
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-stone">
              Parfumerie orientale
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-0.5 rounded-xl border border-stone/10 bg-white/55 p-1 shadow-[0_3px_14px_rgba(37,31,23,0.04)] lg:flex">
          {navigation.filter((item) => item.id !== "admin").map((item) => (
            <button
              className={`relative h-10 rounded-lg px-3.5 text-[13px] font-semibold transition-all duration-200 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-full after:bg-brass after:transition-all ${
                currentPage === item.id
                  ? "bg-ink text-white shadow-sm after:w-5"
                  : "text-stone after:w-0 hover:bg-porcelain/80 hover:text-ink hover:after:w-3"
              }`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            aria-label="Login"
            className="hidden h-10 w-10 items-center justify-center gap-2 rounded-xl border border-brass/50 bg-ink px-0 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(23,21,18,0.14)] transition-all hover:-translate-y-px hover:border-brass hover:bg-sage hover:shadow-[0_7px_18px_rgba(23,21,18,0.18)] focus-visible:outline-brass min-[420px]:inline-flex xl:w-auto xl:px-4"
            onClick={() => onNavigate("admin")}
            type="button"
          >
            <UserCog size={17} />
            <span className="hidden xl:inline">Login</span>
          </button>
          <button
            aria-label="Open cart"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-stone/15 bg-white/80 text-ink shadow-sm transition-all hover:-translate-y-px hover:border-brass/60 hover:bg-white hover:text-sage focus-visible:outline-brass"
            onClick={onCart}
            type="button"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-sage px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-stone/15 bg-white/80 text-ink shadow-sm transition hover:border-brass/60 hover:bg-white hover:text-sage focus-visible:outline-brass lg:hidden"
            onClick={onMenu}
            type="button"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-brass/15 bg-ivory/98 px-4 py-4 shadow-[inset_0_8px_18px_rgba(37,31,23,0.025)] sm:px-6 lg:hidden">
          <button
            className="mb-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-brass/50 bg-ink px-4 text-sm font-semibold text-white shadow-sm transition hover:border-brass hover:bg-sage focus-visible:outline-brass min-[420px]:hidden"
            onClick={() => onNavigate("admin")}
            type="button"
          >
            <UserCog size={16} />
            Login
          </button>
          <div className="mx-auto grid max-w-7xl gap-1.5">
            {navigation.filter((item) => item.id !== "admin").map((item) => (
              <button
                className={`relative rounded-xl border px-4 py-3 text-left text-sm font-semibold transition after:absolute after:bottom-2 after:left-4 after:h-0.5 after:rounded-full after:bg-brass ${
                  currentPage === item.id
                    ? "border-ink bg-ink text-white shadow-sm after:w-5"
                    : "border-stone/10 bg-white/75 text-stone after:w-0 hover:border-brass/30 hover:bg-white hover:text-ink"
                }`}
                key={item.id}
                onClick={() => onNavigate(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════════════════════ */

function HomePage({
  products,
  onAddToCart,
  onNavigate,
  onSelectProduct,
}: {
  products: StoreProduct[];
  onAddToCart: (id: string) => void;
  onNavigate: (p: Page) => void;
  onSelectProduct: (id: string) => void;
}) {
  const featured = products.slice(0, 4);
  return (
    <>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-ink text-white">
        <img
          alt="Serr El Oud boutique shelves"
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,12,0.86),rgba(18,15,12,0.44)_48%,rgba(18,15,12,0.1))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl content-center px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass-light backdrop-blur-md">
              <BadgeCheck size={15} />
              Boutique fragrance house in Tunis
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Serr El Oud
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
              A refined oriental perfume shop with oud, musk, amber, incense oils,
              and curated gift sets. Built for quick discovery, clear orders, and a
              premium first impression.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brass px-5 text-sm font-bold text-ink shadow-lg shadow-black/25 transition hover:-translate-y-0.5 hover:bg-brass-light hover:shadow-xl"
                onClick={() => onNavigate("catalogue")}
                type="button"
              >
                Shop catalogue
                <ChevronRight size={18} />
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/18"
                onClick={() => onNavigate("services")}
                type="button"
              >
                Private blending
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
          <div className="mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
            {storeStats.map((s) => (
              <div
                className="rounded-2xl border border-white/15 bg-white/8 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/12"
                key={s.label}
              >
                <p className="font-display text-3xl font-semibold text-brass-light">
                  {s.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/62">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ivory px-5 py-20 sm:px-8">
        <SectionIntro
          eyebrow="Signature selection"
          title="Four scents to start with"
          copy="Quick picks from the house catalogue. Choose a product, open the detail view, or add it straight to your order bag."
        />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onSelect={() => {
                onSelectProduct(p.id);
                onNavigate("catalogue");
              }}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-stone/10 bg-porcelain px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
              Built like a modern store
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
              Fast browsing, warm brand, real purchase intent.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Search size={21} />,
                title: "Filtered catalogue",
                copy: "Search by note, category, price, rating, and availability.",
              },
              {
                icon: <ShoppingBag size={21} />,
                title: "Order bag",
                copy: "Add items, update quantities, and see totals instantly.",
              },
              {
                icon: <Send size={21} />,
                title: "Contact flow",
                copy: "Validated request form with WhatsApp-ready messaging.",
              },
            ].map((item) => (
              <div
                className="rounded-2xl border border-stone/10 bg-white p-5 shadow-md shadow-stone/5 transition hover:-translate-y-0.5 hover:shadow-lg"
                key={item.title}
              >
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-sage/10 text-sage">
                  {item.icon}
                </div>
                <h3 className="font-display text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   CATALOGUE PAGE
   ═══════════════════════════════════════════════════════════ */

function CataloguePage({
  category,
  categoryOptions,
  filteredProducts,
  inStockOnly,
  maxPrice,
  priceCeiling,
  query,
  selectedProduct,
  sort,
  onAddToCart,
  onCategory,
  onInStockOnly,
  onMaxPrice,
  onQuery,
  onSelectProduct,
  onSort,
}: {
  category: string;
  categoryOptions: string[];
  filteredProducts: StoreProduct[];
  inStockOnly: boolean;
  maxPrice: number;
  priceCeiling: number;
  query: string;
  selectedProduct: StoreProduct;
  sort: SortKey;
  onAddToCart: (id: string) => void;
  onCategory: (c: string) => void;
  onInStockOnly: (v: boolean) => void;
  onMaxPrice: (p: number) => void;
  onQuery: (q: string) => void;
  onSelectProduct: (id: string) => void;
  onSort: (s: SortKey) => void;
}) {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="catalogue" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="self-start rounded-2xl border border-stone/10 bg-white p-5 shadow-md shadow-stone/5 lg:sticky lg:top-24">

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-sage" size={19} />
              <h2 className="font-display text-2xl font-semibold">Controls</h2>
            </div>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Search
              </span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-stone/15 bg-porcelain px-3 transition focus-within:border-sage">
                <Search size={18} className="text-stone" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-stone/60"
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder="oud, musk, amber..."
                  value={query}
                />
              </span>
            </label>
            <div className="mt-5">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Category
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categoryOptions.map((item) => (
                  <button
                    className={`h-10 rounded-xl border px-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                      category === item
                        ? "border-sage bg-sage text-white"
                        : "border-stone/10 bg-porcelain text-ink hover:border-sage/50"
                    }`}
                    key={item}
                    onClick={() => onCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-5 block">
              <span className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Max price
                <span className="text-ink">{formatPrice(maxPrice)}</span>
              </span>
              <input
                className="mt-3 w-full accent-sage"
                max={priceCeiling}
                min="140"
                onChange={(e) => onMaxPrice(Number(e.target.value))}
                step="5"
                type="range"
                value={maxPrice}
              />
            </label>
            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Sort
              </span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none transition focus:border-sage"
                onChange={(e) => onSort(e.target.value as SortKey)}
                value={sort}
              >
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <option key={k} value={k}>
                    {sortLabels[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl border border-stone/10 bg-porcelain px-4 py-3">
              <span className="text-sm font-semibold">In stock only</span>
              <input
                checked={inStockOnly}
                className="h-5 w-5 accent-sage"
                onChange={(e) => onInStockOnly(e.target.checked)}
                type="checkbox"
              />
            </label>
          </aside>

          <div className="grid gap-6">
            <ProductDetail product={selectedProduct} onAddToCart={onAddToCart} />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-stone">
                  {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found
                </p>
                <h2 className="font-display text-3xl font-semibold text-ink">
                  Browse collection
                </h2>
              </div>
              <button
                className="hidden h-11 rounded-xl border border-stone/15 bg-white px-4 text-sm font-semibold text-stone transition hover:-translate-y-0.5 hover:border-sage hover:text-ink sm:inline-flex sm:items-center"
                onClick={() => {
                  onQuery("");
                  onCategory("All");
                  onMaxPrice(priceCeiling);
                  onInStockOnly(false);
                  onSort("featured");
                }}
                type="button"
              >
                Reset controls
              </button>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    selected={selectedProduct.id === p.id}
                    onAddToCart={onAddToCart}
                    onSelect={() => onSelectProduct(p.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-stone/10 bg-white p-8 text-center shadow-md shadow-stone/5">
                <p className="font-display text-3xl font-semibold">No matches</p>
                <p className="mt-2 text-sm text-stone">
                  Try a wider price range, another category, or a simpler note.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRODUCT DETAIL + CARD
   ═══════════════════════════════════════════════════════════ */

function ProductDetail({
  product,
  onAddToCart,
}: {
  product: StoreProduct;
  onAddToCart: (id: string) => void;
}) {
  return (
    <article className="grid overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-md shadow-stone/5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-72 bg-ink">
        <img
          alt={`${product.name} perfume display`}
          className="absolute inset-0 h-full w-full object-cover"
          onError={handleProductImageError}
          src={productImageSrc(product)}
          style={{ objectPosition: product.imagePosition }}
        />
        <div
          className="absolute inset-0 opacity-75"
          style={{
            background: `linear-gradient(135deg, ${product.swatch}CC, rgba(18,15,12,.25))`,
          }}
        />
        <div className="absolute bottom-5 left-5 right-5">
          <p className="mb-2 inline-flex rounded-full bg-white/92 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink">
  {product.category}
</p>
          <h2 className="font-display text-4xl font-semibold text-white">
            {product.name}
          </h2>
        </div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Rating rating={product.rating} />
          <span className="rounded-full bg-sage/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-sage">
  {product.stock} available
</span>
        </div>
        <p className="mt-4 font-display text-2xl font-semibold text-ink">
          {product.line}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">
          {product.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {product.notes.map((n) => (
            <span
  className="rounded-lg border border-stone/10 bg-porcelain px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone"
  key={n}
>
              {n}
            </span>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-stone/10 pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
              Price
            </p>
            <p className="font-display text-4xl font-semibold text-ink">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            className={`inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold transition hover:-translate-y-0.5 ${
  product.stock > 0
    ? "bg-ink text-white hover:bg-sage"
    : "cursor-not-allowed bg-stone/15 text-stone"
}`}
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product.id)}
            type="button"
          >
            <ShoppingBag size={18} />
            {product.stock > 0 ? "Add to order" : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductCard({
  product,
  selected = false,
  onAddToCart,
  onSelect,
}: {
  product: StoreProduct;
  selected?: boolean;
  onAddToCart: (id: string) => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-2xl border bg-white shadow-md shadow-stone/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        selected ? "border-sage" : "border-stone/10"
      }`}
    >
      <button
        className="relative block h-48 w-full overflow-hidden bg-ink text-left"
        onClick={onSelect}
        type="button"
      >
        <img
          alt={`${product.name} fragrance`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={handleProductImageError}
          src={productImageSrc(product)}
          style={{ objectPosition: product.imagePosition }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,.08), ${product.swatch}B3)`,
          }}
        />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ink">
            {product.tag}
          </span>
        )}
        <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow">
          <ArrowUpRight size={18} />
        </span>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold leading-tight text-ink">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-stone">{product.line}</p>
          </div>
          <button
            aria-label={`Save ${product.name}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-stone/10 text-stone transition hover:border-sage hover:text-sage"
            type="button"
          >
            <Heart size={17} />
          </button>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone">{product.mood}</p>
        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="font-display text-3xl font-semibold text-ink">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-stone">
              {product.volume}
            </p>
          </div>
          <button
            aria-label={`Add ${product.name} to order`}
            className={`grid h-11 w-11 place-items-center rounded transition ${
              product.stock > 0
                ? "bg-ink text-white hover:bg-sage"
                : "cursor-not-allowed bg-stone/15 text-stone"
            }`}
            disabled={product.stock <= 0}
            onClick={() => onAddToCart(product.id)}
            type="button"
          >
            <Plus size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════
   STORY + SERVICES
   ═══════════════════════════════════════════════════════════ */

function StoryPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="story" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-md shadow-stone/5">
            <img
              alt="Perfume bottles displayed inside Serr El Oud"
              className="h-80 w-full object-cover sm:h-[500px]"
              src="/hero.jpg"
            />
          </div>
          <div className="grid gap-5">
            {[
              {
                title: "Founded in the medina spirit",
                copy: "Serr El Oud was shaped around the intimacy of perfume buying: testing slowly, listening carefully, and leaving with a scent that feels personal.",
              },
              {
                title: "Ingredients with character",
                copy: "The catalogue balances Cambodian-style oud, white musk oils, warm amber resins, incense smoke, florals, saffron, and woods.",
              },
              {
                title: "Modern service, traditional soul",
                copy: "The shop experience is built for clear browsing, gifting support, private recommendations, and direct WhatsApp ordering.",
              },
            ].map((item) => (
              <div
                className="rounded-2x1 border border-stone/10 bg-white p-6 shadow-md shadow-stone/5 transition hover:-translate-y-0.5 hover:shadow-lg"
                key={item.title}
              >
                <h2 className="font-display text-3xl font-semibold text-ink">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone">{item.copy}</p>
              </div>
            ))}
            <button
              className="inline-flex h-12 w-fit items-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-sage"
              onClick={() => onNavigate("catalogue")}
              type="button"
            >
              Explore products
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const services = [
    {
      icon: <Sparkles size={24} />,
      title: "Personal scent consultation",
      copy: "A guided session to match notes, strength, and occasion to the person wearing the fragrance.",
    },
    {
      icon: <Gift size={24} />,
      title: "Gift preparation",
      copy: "Discovery sets, ribboned boxes, message cards, and elegant options for weddings or business gifts.",
    },
    {
      icon: <Leaf size={24} />,
      title: "Oil layering",
      copy: "Build a softer or stronger signature by pairing musk, oud, amber, and floral oils.",
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "Refill and care",
      copy: "Refill guidance, storage advice, and bottle care so the scent keeps its original character.",
    },
  ];

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="services" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div
              className="rounded-2x1 border border-stone/10 bg-white p-6 shadow-md shadow-stone/5 transition hover:-translate-y-0.5 hover:shadow-lg"
              key={s.title}
            >
              <div className="grid h-12 w-12 place-items-center rounded-1x bg-clay/12 text-clay">
                {s.icon}
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">
                {s.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone">{s.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 rounded-2xl border border-stone/10 bg-ink p-6 text-white shadow-md shadow-stone/10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brass-light">
              Bespoke request
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold">
              Need a custom gift or private recommendation?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Send the occasion, budget, and scent preference. The contact page
              handles basic validation before the request is sent.
            </p>
          </div>
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brass px-5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-brass-light"
            onClick={() => onNavigate("contact")}
            type="button"
          >
            Start request
            <Send size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════════════ */

function ContactPage({
  cartItems,
  cartTotal,
  contactAddress,
  contactError,
  contactMessage,
  contactName,
  contactPhone,
  contactReady,
  giftOrder,
  submitted,
  submittedOrderId,
  onContactMessage,
  onContactName,
  onContactPhone,
  onContactAddress,
  onGiftOrder,
  onNavigate,
  onSubmit,
}: {
  cartItems: Array<{ product: StoreProduct; quantity: number }>;
  cartTotal: number;
  contactAddress: string;
  contactError: string;
  contactMessage: string;
  contactName: string;
  contactPhone: string;
  contactReady: boolean;
  giftOrder: boolean;
  submitted: boolean;
  submittedOrderId: string;
  onContactMessage: (v: string) => void;
  onContactName: (v: string) => void;
  onContactPhone: (v: string) => void;
  onContactAddress: (v: string) => void;
  onGiftOrder: (v: boolean) => void;
  onNavigate: (p: Page) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const submitReady = contactReady && !submitted;
  const cartSummary =
    cartItems.length > 0
      ? cartItems.map(({ product, quantity }) => `${product.name} x${quantity}`).join(", ")
      : "Custom fragrance request";
  const whatsappMessage = encodeURIComponent(
    `Hello Serr El Oud, my name is ${contactName || "[name]"}. Address: ${
      contactAddress || "[address]"
    }. Order: ${cartSummary}. Gift: ${giftOrder ? "yes" : "no"}. ${contactMessage}`
  );

  return (
    <section className="relative overflow-hidden px-5 py-12 sm:px-8 lg:py-16">
      {/* ambient color washes for the glass effect to catch */}
      <div className="pointer-events-none absolute -left-32 -top-20 h-80 w-80 rounded-full bg-sage/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-brass/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-clay/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <PageHeading page="contact" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="grid gap-4">
            {[
              { icon: <MapPin size={21} />, title: "Boutique", copy: "V579+M43, Ariana, Tunis" },
              { icon: <Clock size={21} />, title: "Hours", copy: "Monday to Saturday, 9:00 to 20:00" },
              { icon: <Phone size={21} />, title: "Phone", copy: "+216 20 200 888" },
              { icon: <Mail size={21} />, title: "Orders", copy: "Fast requests by WhatsApp or the form." },
            ].map((item) => (
              <div
                className="flex gap-4 rounded-2xl border border-white/60 bg-white/40 p-5 shadow-lg shadow-stone/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/55"
                key={item.title}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/50 bg-sage/15 text-sage backdrop-blur-sm">
                  {item.icon}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">{item.title}</h2>
                  <p className="mt-1 text-sm text-stone">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="rounded-3xl border border-white/60 bg-white/40 p-6 shadow-xl shadow-stone/10 backdrop-blur-2xl sm:p-8"
            onSubmit={onSubmit}
          >
            <h2 className="font-display text-4xl font-semibold text-ink">Order request</h2>
            <p className="mt-2 text-sm leading-7 text-stone">
              The order is sent to the admin commandes list when the form is
              submitted.
            </p>

            <div className="mt-5 rounded-2xl border border-white/50 bg-white/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                  Order summary
                </p>
                <p className="font-display text-2xl font-semibold text-ink">
                  {formatPrice(cartTotal)}
                </p>
              </div>
              {cartItems.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {cartItems.map(({ product, quantity }) => (
                    <div
                      className="flex items-center justify-between gap-3 text-sm"
                      key={product.id}
                    >
                      <span className="font-semibold text-ink">{product.name}</span>
                      <span className="text-stone">x{quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm leading-6 text-stone">
                  No cart item selected. The message will be saved as a custom
                  request.
                </p>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/50 bg-white/50 px-4 py-3 backdrop-blur-sm">
              <span className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/50 bg-brass/15 text-brass">
                  <Gift size={18} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">Gift option</span>
                  <span className="block text-xs text-stone">
                    Mark this commande as a gift.
                  </span>
                </span>
              </span>
              <input
                checked={giftOrder}
                className="h-5 w-5 accent-sage"
                onChange={(e) => onGiftOrder(e.target.checked)}
                type="checkbox"
              />
            </label>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                  Name
                </span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-white/50 bg-white/50 px-4 text-sm text-ink outline-none backdrop-blur-sm transition placeholder:text-stone/60 focus:border-sage focus:bg-white/70"
                  onChange={(e) => onContactName(e.target.value)}
                  placeholder="Your name"
                  required
                  value={contactName}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                  Phone
                </span>
                <input
                  className="mt-2 h-12 w-full rounded-xl border border-white/50 bg-white/50 px-4 text-sm text-ink outline-none backdrop-blur-sm transition placeholder:text-stone/60 focus:border-sage focus:bg-white/70"
                  onChange={(e) => onContactPhone(e.target.value)}
                  placeholder="+216 ..."
                  required
                  value={contactPhone}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Address
              </span>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-white/50 bg-white/50 px-4 text-sm text-ink outline-none backdrop-blur-sm transition placeholder:text-stone/60 focus:border-sage focus:bg-white/70"
                onChange={(e) => onContactAddress(e.target.value)}
                placeholder="Delivery address"
                required
                value={contactAddress}
              />
            </label>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Message
              </span>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded-xl border border-white/50 bg-white/50 p-4 text-sm leading-6 text-ink outline-none backdrop-blur-sm transition placeholder:text-stone/60 focus:border-sage focus:bg-white/70"
                onChange={(e) => onContactMessage(e.target.value)}
                value={contactMessage}
              />
            </label>

            {contactError && (
              <p className="mt-4 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay backdrop-blur-sm">
                {contactError}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className={`inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold transition ${
                  submitReady
                    ? "bg-ink text-white hover:bg-sage"
                    : "cursor-not-allowed bg-stone/15 text-stone"
                }`}
                disabled={!submitReady}
                type="submit"
              >
                <Send size={18} />
                Confirmer commande
              </button>
              <a
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-sage/30 bg-sage/10 px-5 text-sm font-bold text-sage backdrop-blur-sm transition hover:border-sage"
                href={`https://wa.me/21620200888?text=${whatsappMessage}`}
              >
                <Phone size={18} />
                WhatsApp
              </a>
            </div>

            {submitted && (
              <div className="mt-5 rounded-xl border border-sage/25 bg-sage/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-sm font-semibold text-sage">
                  Commande accepted. Reference: {submittedOrderId}.
                </p>
                <button
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-sage px-4 text-sm font-bold text-white transition hover:bg-ink"
                  onClick={() => onNavigate("tracking")}
                  type="button"
                >
                  <ClipboardList size={17} />
                  Track status
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORDER STATUS PAGE
   ═══════════════════════════════════════════════════════════ */

function OrderStatusPage({
  initialPhone,
  initialReference,
  orders,
}: {
  initialPhone: string;
  initialReference: string;
  orders: AdminOrder[];
}) {
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState(initialPhone);
  const [searched, setSearched] = useState(Boolean(initialReference));
  const [trackingError, setTrackingError] = useState("");

  const normalizedReference = reference.trim().toUpperCase();
  const normalizedPhone = normalizePhone(phone);

  const matchedOrder =
    searched && !trackingError
      ? orders.find((o) => {
          const op = normalizePhone(o.phone);
          return (
            o.id.toUpperCase() === normalizedReference &&
            (op === normalizedPhone ||
              op.endsWith(normalizedPhone) ||
              normalizedPhone.endsWith(op))
          );
        })
      : undefined;

  const currentStep = matchedOrder ? getStatusStep(matchedOrder.status) : -1;

  const progressSteps: Array<{
    status: Exclude<OrderStatus, "Cancelled">;
    title: string;
    copy: string;
    icon: ReactNode;
  }> = [
    {
      status: "Pending",
      title: "Commande recue",
      copy: "Votre demande est dans la liste admin.",
      icon: <Clock size={18} />,
    },
    {
      status: "Confirmed",
      title: "Commande confirmee",
      copy: "La boutique a valide la commande.",
      icon: <ShieldCheck size={18} />,
    },
    {
      status: "Preparing",
      title: "Preparation",
      copy: "Les produits sont en preparation.",
      icon: <Package size={18} />,
    },
    {
      status: "Delivered",
      title: "Livree",
      copy: "La commande est terminee.",
      icon: <Truck size={18} />,
    },
  ];

  function submitTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^CMD-\d{4,}$/i.test(reference.trim())) {
      setTrackingError("Reference invalide. Exemple: CMD-1048.");
      setSearched(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setTrackingError("Phone must contain at least 8 digits.");
      setSearched(false);
      return;
    }
    const exists = orders.some((o) => {
      const op = normalizePhone(o.phone);
      return (
        o.id.toUpperCase() === normalizedReference &&
        (op === normalizedPhone ||
          op.endsWith(normalizedPhone) ||
          normalizedPhone.endsWith(op))
      );
    });
    if (!exists) {
      setTrackingError("No commande found with this reference and phone.");
      setSearched(false);
      return;
    }
    setTrackingError("");
    setSearched(true);
  }

  return (
    <section className="bg-porcelain px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="tracking" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            className="self-start rounded border border-stone/10 bg-white p-6 shadow-sm lg:sticky lg:top-24"
            onSubmit={submitTracking}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded bg-sage/10 text-sage">
                <ClipboardList size={20} />
              </span>
              <h2 className="font-display text-3xl font-semibold text-ink">
                Recherche
              </h2>
            </div>
            <label className="mt-6 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Reference
              </span>
              <input
                className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm font-bold uppercase outline-none transition focus:border-sage"
                onChange={(e) => {
                  setReference(e.target.value.toUpperCase());
                  setTrackingError("");
                }}
                pattern="CMD-[0-9]{4,}"
                placeholder="CMD-1048"
                required
                value={reference}
              />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Phone
              </span>
              <input
                className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage"
                onChange={(e) => {
                  setPhone(e.target.value);
                  setTrackingError("");
                }}
                placeholder="+216 ..."
                required
                value={phone}
              />
            </label>
            {trackingError && (
              <p className="mt-4 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">
                {trackingError}
              </p>
            )}
            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage"
              type="submit"
            >
              <Search size={18} />
              Voir statut
            </button>
          </form>

          <div className="rounded border border-stone/10 bg-white p-6 shadow-sm sm:p-8">
            {matchedOrder ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone/10 pb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">
                      Reference
                    </p>
                    <h2 className="mt-1 font-display text-4xl font-semibold text-ink">
                      {matchedOrder.id}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-stone">
                      {matchedOrder.customer} - {matchedOrder.date}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={matchedOrder.status} />
                    <span
                      className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-bold uppercase tracking-[0.1em] ${
                        matchedOrder.gift
                          ? "bg-brass/15 text-brass"
                          : "bg-porcelain text-stone"
                      }`}
                    >
                      {matchedOrder.gift && <Gift size={14} />}
                      {matchedOrder.gift ? "Gift" : "Standard"}
                    </span>
                  </div>
                </div>

                {matchedOrder.status === "Cancelled" ? (
                  <div className="mt-6 rounded border border-clay/20 bg-clay/10 p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded bg-white text-clay">
                        <Ban size={18} />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl font-semibold text-ink">
                          Commande annulee
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-clay">
                          Contactez la boutique avec la reference pour plus de
                          details.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-4">
                    {progressSteps.map((step, index) => {
                      const active = currentStep >= index;
                      return (
                        <div
                          className={`grid gap-3 rounded border p-4 sm:grid-cols-[44px_1fr] ${
                            active
                              ? "border-sage/25 bg-sage/10"
                              : "border-stone/10 bg-porcelain"
                          }`}
                          key={step.status}
                        >
                          <span
                            className={`grid h-11 w-11 place-items-center rounded ${
                              active ? "bg-sage text-white" : "bg-white text-stone"
                            }`}
                          >
                            {step.icon}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-2xl font-semibold text-ink">
                                {step.title}
                              </h3>
                              {matchedOrder.status === step.status && (
                                <span className="rounded bg-white px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-sage">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm leading-6 text-stone">
                              {step.copy}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 grid gap-4 rounded border border-stone/10 bg-porcelain p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                      Articles
                    </p>
                    <p className="mt-1 text-sm leading-6 text-ink">
                      {matchedOrder.items}
                    </p>
                  </div>
                  <p className="font-display text-3xl font-semibold text-ink">
                    {formatPrice(matchedOrder.total)}
                  </p>
                </div>
              </>
            ) : (
              <div className="grid min-h-96 place-items-center rounded border border-dashed border-stone/20 bg-porcelain p-8 text-center">
                <div>
                  <ClipboardList className="mx-auto text-stone" size={36} />
                  <h2 className="mt-4 font-display text-3xl font-semibold text-ink">
                    Enter your reference
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-7 text-stone">
                    Use the reference shown after confirmation, for example
                    CMD-1048, with the same phone number used for the commande.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN PAGE
   ═══════════════════════════════════════════════════════════ */

function AdminPage({
  authenticated,
  categories,
  orders,
  products,
  onAddCategory,
  onAddProduct,
  onGoToStore,
  onLogin,
  onLogout,
  onProductCategory,
  onProductImage,
  onProductPrice,
  onProductRating,
  onOrderStatus,
  onStockChange,
  onToggleCategory,
  onRefresh,
}: {
  authenticated: boolean;
  categories: AdminCategory[];
  orders: AdminOrder[];
  products: StoreProduct[];
  onAddCategory: (n: string) => void;
  onAddProduct: (product: NewProductInput) => Promise<boolean> | boolean;
  onGoToStore: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onProductCategory: (id: string, c: string) => void;
  onProductImage: (id: string, imageUrl: string) => void;
  onProductPrice: (id: string, p: number) => void;
  onProductRating: (id: string, r: number) => void;
  onOrderStatus: (id: string, s: OrderStatus) => void;
  onStockChange: (id: string, s: number) => void;
  onToggleCategory: (id: string) => void;
  onRefresh: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("Sales");
  const [adminFormError, setAdminFormError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | "All">("All");
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [ratingDrafts, setRatingDrafts] = useState<Record<string, string>>({});
  const [imageDrafts, setImageDrafts] = useState<Record<string, string>>({});
  const [productForm, setProductForm] = useState({
    name: "",
    line: "",
    category: "",
    price: "",
    stock: "",
    rating: "4.5",
    imageUrl: "",
    notes: "",
  });
  const [productFormError, setProductFormError] = useState("");
  const [productSaving, setProductSaving] = useState(false);

  useEffect(() => {
    setPriceDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.price)])));
    setStockDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.stock)])));
    setRatingDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.rating)])));
    setImageDrafts(Object.fromEntries(products.map((p) => [p.id, p.imageUrl ?? ""])));
  }, [products]);

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const ordersInProgress = orders.filter((o) =>
    ["Pending", "Confirmed", "Preparing"].includes(o.status)
  );
  const revenue = activeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= 8);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const uniqueCustomers = new Set(
    orders.map((o) => normalizePhone(o.phone) || o.customer.trim().toLowerCase())
  ).size;
  const averageBasket = activeOrders.length > 0 ? revenue / activeOrders.length : 0;
  const visibleOrders =
    orderStatusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  const dashboardCards = [
    {
      label: "Chiffre d'affaires",
      value: formatAdminPrice(revenue),
      detail: "Commandes non annulées",
      icon: Archive,
      accent: "bg-brass/15 text-[#8c6827]",
    },
    {
      label: "Commandes",
      value: orders.length.toString(),
      detail: `${ordersInProgress.length} en cours`,
      icon: ClipboardList,
      accent: "bg-sage/10 text-sage",
    },
    {
      label: "Panier moyen",
      value: formatAdminPrice(averageBasket),
      detail: "Hors commandes annulées",
      icon: ShoppingBag,
      accent: "bg-ink/8 text-ink",
    },
    {
      label: "Clients",
      value: uniqueCustomers.toString(),
      detail: "D’après les commandes",
      icon: Users,
      accent: "bg-sage/10 text-sage",
    },
    {
      label: "Produits en rupture",
      value: outOfStockProducts.length.toString(),
      detail: `${lowStockProducts.length} stocks à surveiller`,
      icon: Boxes,
      accent: "bg-clay/12 text-clay",
    },
    {
      label: "Commandes en attente",
      value: pendingOrders.length.toString(),
      detail: "À traiter rapidement",
      icon: Clock,
      accent: "bg-[#fff2dc] text-[#a96416]",
    },
  ];

  const salesEvolution = Object.entries(
    activeOrders.reduce<Record<string, number>>((acc, order) => {
      acc[order.date] = (acc[order.date] ?? 0) + (Number(order.total) || 0);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, total]) => ({ date, total }))
    .filter((item) => !Number.isNaN(new Date(`${item.date}T12:00:00`).getTime()));
  const salesPeak = Math.max(1, ...salesEvolution.map((item) => item.total));

  const ordersByStatus = orderStatuses.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
  const currentTab = adminTabs.find((item) => item.id === tab) ?? adminTabs[0];
  const currentDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const inputCls =
    "h-11 w-full rounded-xl border border-stone/15 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-stone/55 focus:border-sage focus:ring-4 focus:ring-sage/8";
  const inputCenterCls =
    "h-11 w-full rounded-xl border border-stone/15 bg-white px-3 text-center text-sm font-bold outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/8";
  const selectCls =
    "h-11 w-full rounded-xl border border-stone/15 bg-white px-3 text-sm font-semibold outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/8";
  const labelCls = "text-[11px] font-bold uppercase tracking-[0.14em] text-stone";
  const btnPrimary =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sage disabled:cursor-not-allowed disabled:bg-stone/25";
  const tableHeadCls =
    "px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.13em] text-stone";
  const tableCellCls = "px-5 py-4";
  const rowCls = "border-b border-stone/10 last:border-0 transition hover:bg-sage/[0.035]";

  function commitPrice(productId: string) {
    const raw = priceDrafts[productId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || Number.isNaN(val)) {
      setPriceDrafts((c) => {
        const p = products.find((i) => i.id === productId);
        return { ...c, [productId]: p ? String(p.price) : "1" };
      });
      return;
    }
    onProductPrice(productId, val);
  }

  function commitStock(productId: string) {
    const raw = stockDrafts[productId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || Number.isNaN(val)) {
      setStockDrafts((c) => {
        const p = products.find((i) => i.id === productId);
        return { ...c, [productId]: p ? String(p.stock) : "0" };
      });
      return;
    }
    onStockChange(productId, val);
  }

  function commitRating(productId: string) {
    const raw = ratingDrafts[productId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || Number.isNaN(val)) {
      setRatingDrafts((c) => {
        const p = products.find((i) => i.id === productId);
        return { ...c, [productId]: p ? String(p.rating) : "0" };
      });
      return;
    }
    onProductRating(productId, val);
  }

  function commitImage(productId: string) {
    onProductImage(productId, (imageDrafts[productId] ?? "").trim());
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = productForm.name.trim();
    const category =
      productForm.category ||
      categories.find((c) => c.active)?.name ||
      categories[0]?.name ||
      "Oud";
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);
    const rating = Number(productForm.rating);
    const notes = normalizeNotes(productForm.notes, [category]);

    if (name.length < 2) {
      setProductFormError("Le nom du produit doit contenir au moins 2 caractères.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setProductFormError("Prix invalide.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      setProductFormError("Stock invalide.");
      return;
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      setProductFormError("La note doit etre entre 0 et 5.");
      return;
    }

    setProductSaving(true);
    const saved = await onAddProduct({
      name,
      line: productForm.line,
      category,
      price,
      stock,
      rating,
      imageUrl: productForm.imageUrl,
      notes,
    });
    setProductSaving(false);

    if (!saved) {
      setProductFormError(
        "Produit non sauvegardé. Vérifiez la table products dans Supabase."
      );
      return;
    }

    setProductForm({
      name: "",
      line: "",
      category,
      price: "",
      stock: "",
      rating: "4.5",
      imageUrl: "",
      notes: "",
    });
    setProductFormError("");
  }

  function submitAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Email and password are required.");
      return;
    }
    if (
      loginEmail.trim().toLowerCase() === adminCredentials.email &&
      loginPassword === adminCredentials.password
    ) {
      setLoginError("");
      setLoginPassword("");
      onLogin();
      return;
    }
    setLoginError("Email ou mot de passe incorrect.");
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (name.length < 2) {
      setCategoryError("Le nom de la catégorie doit contenir au moins 2 caractères.");
      return;
    }
    if (name.toLowerCase() === "all") {
      setCategoryError("Ce nom de catégorie est réservé.");
      return;
    }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setCategoryError("Cette catégorie existe déjà.");
      return;
    }
    onAddCategory(name);
    setCategoryName("");
    setCategoryError("");
  }

  function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newAdminName.trim();
    const email = newAdminEmail.trim();
    if (name.length < 2) {
      setAdminFormError("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (!isValidEmail(email)) {
      setAdminFormError("Saisissez une adresse e-mail valide.");
      return;
    }
    if (adminUsers.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
      setAdminFormError("Cette adresse e-mail administrateur existe déjà.");
      return;
    }
    setAdminUsers((c) => [
      ...c,
      {
        id: `adm-${Date.now()}`,
        name,
        email,
        role: newAdminRole,
        status: "Active",
        lastSeen: "Invite sent",
      },
    ]);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminRole("Sales");
    setAdminFormError("");
  }

  function updateAdminRole(adminId: string, role: AdminRole) {
    setAdminUsers((c) => c.map((a) => (a.id === adminId ? { ...a, role } : a)));
  }

  function toggleAdminStatus(adminId: string) {
    setAdminUsers((c) =>
      c.map((a) =>
        a.id === adminId
          ? {
              ...a,
              status: a.status === "Active" ? ("Paused" as AdminStatus) : ("Active" as AdminStatus),
            }
          : a
      )
    );
  }

  async function refreshAdminData() {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  if (!authenticated) {
    return (
      <section className="min-h-screen bg-[#f3efe7] p-3 sm:p-5">
        <div className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1500px] overflow-hidden rounded-[28px] border border-stone/10 bg-white shadow-[0_24px_80px_rgba(37,32,24,0.12)] sm:min-h-[calc(100vh-40px)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden bg-ink lg:block">
            <img
              alt="Flacons de parfumerie Serr El Oud"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              src="/hero.jpg"
            />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(17,20,17,0.28),rgba(17,20,17,0.92))]" />
            <div className="relative flex h-full flex-col justify-between p-12 text-white xl:p-16">
              <button
                className="flex w-fit items-center gap-3 text-left"
                onClick={onGoToStore}
                type="button"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full border border-brass/50 font-display text-xl text-brass-light">
                  S
                </span>
                <span>
                  <span className="block font-display text-xl font-semibold">Serr El Oud</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55">
                    Maison de parfumerie
                  </span>
                </span>
              </button>

              <div className="max-w-lg">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brass-light">
                  Espace de gestion
                </p>
                <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.08] xl:text-6xl">
                  L’exigence de la maison, jusque dans les détails.
                </h1>
                <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                  Pilotez les commandes, le catalogue et les stocks depuis un espace pensé
                  pour votre équipe.
                </p>
              </div>

              <p className="text-xs text-white/40">Administration sécurisée · Serr El Oud</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20">
          <form
            className="w-full max-w-md"
            onSubmit={submitAdminLogin}
          >
            <button
              className="mb-12 flex items-center gap-3 text-left lg:hidden"
              onClick={onGoToStore}
              type="button"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-ink font-display text-lg text-brass-light">
                S
              </span>
              <span>
                <span className="block font-display text-lg font-semibold">Serr El Oud</span>
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-stone">
                  Maison de parfumerie
                </span>
              </span>
            </button>

            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-sage/10 text-sage">
                  <ShieldCheck size={22} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
                    Accès administrateur
                  </p>
                </div>
              </div>
              <h1 className="mt-7 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
                Heureux de vous revoir.
              </h1>
              <p className="mt-3 text-sm leading-6 text-stone">
                Connectez-vous pour accéder au tableau de bord de la maison.
              </p>
            </div>

            <div className="mt-9">
              <label className="block">
                <span className={labelCls}>Adresse e-mail</span>
                <input
                  className={`mt-2 ${inputCls}`}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="admin@serreloud.tn"
                  required
                  type="email"
                  value={loginEmail}
                  autoComplete="username"
                />
              </label>

              <label className="mt-4 block">
                <span className={labelCls}>Mot de passe</span>
                <input
                  className={`mt-2 ${inputCls}`}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError("");
                  }}
                  placeholder="Votre mot de passe"
                  required
                  type="password"
                  value={loginPassword}
                  autoComplete="current-password"
                />
              </label>

              {loginError && (
                <p className="mt-4 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">
                  {loginError === "Email and password are required."
                    ? "L’e-mail et le mot de passe sont requis."
                    : loginError}
                </p>
              )}

              <button className={`mt-6 w-full ${btnPrimary}`} type="submit">
                <ShieldCheck size={18} />
                Se connecter
              </button>

              <button
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-stone transition hover:bg-porcelain hover:text-ink"
                onClick={onGoToStore}
                type="button"
              >
                <ArrowUpRight size={17} />
                Retour à la boutique
              </button>
            </div>
          </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f1e9]">
      <div className="min-h-screen lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
        {adminMenuOpen && (
          <button
            aria-label="Fermer le menu administrateur"
            className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm lg:hidden"
            onClick={() => setAdminMenuOpen(false)}
            type="button"
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-[#121a16] text-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 lg:shadow-none ${
            adminMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-white/8 px-6">
            <button className="flex items-center gap-3 text-left" onClick={onGoToStore} type="button">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-brass/55 font-display text-lg text-brass-light">
                S
              </span>
              <span>
                <span className="block font-display text-lg font-semibold leading-none">Serr El Oud</span>
                <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">
                  Administration
                </span>
              </span>
            </button>
            <button
              aria-label="Fermer le menu"
              className="grid h-9 w-9 place-items-center rounded-lg text-white/60 transition hover:bg-white/8 hover:text-white lg:hidden"
              onClick={() => setAdminMenuOpen(false)}
              type="button"
            >
              <X size={19} />
            </button>
          </div>

          <nav aria-label="Navigation administrateur" className="flex-1 overflow-y-auto px-4 py-7">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              Espace de gestion
            </p>
            <div className="mt-4 grid gap-1.5">
              {adminTabs.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.id;
                return (
                  <button
                    className={`group flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-white text-ink shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
                        : "text-white/58 hover:bg-white/7 hover:text-white"
                    }`}
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      setAdminMenuOpen(false);
                    }}
                    type="button"
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                        isActive ? "bg-sage/10 text-sage" : "bg-white/5 text-brass-light/65"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    {item.label}
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brass" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border-t border-white/8 pt-6">
              <button
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-white/50 transition hover:bg-white/7 hover:text-white"
                onClick={onGoToStore}
                type="button"
              >
                <ShoppingBag size={17} />
                Voir la boutique
                <ArrowUpRight className="ml-auto" size={15} />
              </button>
            </div>
          </nav>

          <div className="border-t border-white/8 p-4">
            <div className="rounded-2xl bg-white/[0.055] p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass/15 font-display text-sm font-bold text-brass-light">
                  AS
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{adminUsers[0]?.name ?? "Administrateur"}</p>
                  <p className="truncate text-xs text-white/38">
                    {adminRoleLabels[adminUsers[0]?.role ?? "Owner"]}
                  </p>
                </div>
                <button
                  aria-label="Se déconnecter"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/45 transition hover:bg-clay/20 hover:text-[#f3a48f]"
                  onClick={() => {
                    setTab("overview");
                    onLogout();
                  }}
                  title="Se déconnecter"
                  type="button"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </div>
          </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-stone/10 bg-[#f5f1e9]/92 backdrop-blur-xl">
            <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
              <button
                aria-label="Ouvrir le menu administrateur"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone/12 bg-white text-ink shadow-sm lg:hidden"
                onClick={() => setAdminMenuOpen(true)}
                type="button"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-2xl font-semibold text-ink sm:text-3xl">
                  {currentTab.label}
                </h1>
                <p className="mt-0.5 hidden text-xs text-stone sm:block">
                  {tab === "overview" ? currentDate : adminTabDescriptions[tab]}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Actualiser les données"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-stone/12 bg-white px-3 text-sm font-bold text-stone shadow-sm transition hover:border-sage/35 hover:text-sage disabled:cursor-wait disabled:opacity-60"
                  disabled={refreshing}
                  onClick={refreshAdminData}
                  title="Actualiser les données"
                  type="button"
                >
                  <RefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
                  <span className="hidden xl:inline">Actualiser</span>
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-sage sm:px-4"
                  onClick={() => setTab("inventory")}
                  type="button"
                >
                  <Plus size={17} />
                  <span className="hidden sm:inline">Ajouter un produit</span>
                  <span className="sm:hidden">Ajouter</span>
                </button>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="grid gap-5 lg:gap-6">
            {/* OVERVIEW */}
            {tab === "overview" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {dashboardCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div
                        className="group rounded-2xl border border-stone/10 bg-white p-5 shadow-[0_8px_30px_rgba(45,39,31,0.045)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(45,39,31,0.075)] sm:p-6"
                        key={card.label}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-stone">
                            {card.label}
                          </p>
                          <span
                            className={`grid h-10 w-10 place-items-center rounded-xl transition group-hover:scale-105 ${card.accent}`}
                          >
                            <Icon size={18} />
                          </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-[34px]">
                          {card.value}
                        </p>
                        <p className="mt-1.5 text-xs text-stone">{card.detail}</p>
                      </div>
                    );
                  })}
                </div>

                {(salesEvolution.length > 0 || orders.length > 0) && (
                  <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                    {salesEvolution.length > 0 && (
                      <AdminPanel title="Évolution des ventes" icon={<Archive size={19} />}>
                        <div className="flex h-56 items-end gap-2 sm:gap-4">
                          {salesEvolution.map((item) => (
                            <div className="group flex min-w-0 flex-1 flex-col items-center justify-end" key={item.date}>
                              <span className="mb-2 hidden text-[10px] font-bold text-stone sm:block">
                                {formatAdminPrice(item.total)}
                              </span>
                              <div className="flex h-36 w-full items-end rounded-xl bg-porcelain/80 p-1.5">
                                <div
                                  className="w-full rounded-lg bg-[linear-gradient(180deg,#c8a157,#98712d)] transition-all duration-500 group-hover:brightness-105"
                                  style={{ height: `${Math.max(8, (item.total / salesPeak) * 100)}%` }}
                                />
                              </div>
                              <span className="mt-2 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-stone">
                                {new Intl.DateTimeFormat("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                }).format(new Date(`${item.date}T12:00:00`))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </AdminPanel>
                    )}

                    {orders.length > 0 && (
                      <AdminPanel title="Commandes par statut" icon={<ClipboardList size={19} />}>
                        <div className="grid gap-4">
                          {ordersByStatus.map((item) => (
                            <div key={item.status}>
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="text-xs font-semibold text-stone">
                                  {orderStatusLabels[item.status]}
                                </span>
                                <span className="text-xs font-bold text-ink">{item.count}</span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-porcelain">
                                <div
                                  className={`h-full rounded-full ${
                                    item.status === "Delivered"
                                      ? "bg-sage"
                                      : item.status === "Cancelled"
                                        ? "bg-clay"
                                        : item.status === "Pending"
                                          ? "bg-[#d68a2d]"
                                          : "bg-brass"
                                  }`}
                                  style={{ width: `${orders.length ? (item.count / orders.length) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </AdminPanel>
                    )}
                  </div>
                )}

                <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                  <AdminPanel title="Dernières commandes" icon={<ClipboardList size={19} />}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-stone">Les trois commandes les plus récentes</p>
                      {orders.length > 0 && (
                        <button
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-sage transition hover:text-ink"
                          onClick={() => setTab("orders")}
                          type="button"
                        >
                          Voir tout <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                    {orders.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-stone/20 bg-porcelain/55 px-4 py-8 text-center text-sm font-semibold text-stone">
                        Aucune commande trouvée.
                      </p>
                    ) : (
                      <div className="divide-y divide-stone/10">
                        {orders.slice(0, 3).map((order) => (
                          <div className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center" key={order.id}>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-ink">{order.id}</p>
                                <StatusBadge status={order.status} />
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold text-stone">{order.customer}</p>
                              <p className="mt-0.5 truncate text-xs text-stone/75">{order.items}</p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-base font-bold text-ink">{formatAdminPrice(order.total)}</p>
                              <p className="mt-1 text-xs text-stone">{formatAdminDate(order.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </AdminPanel>

                  <AdminPanel title="Alertes de stock" icon={<Package size={19} />}>
                    {lowStockProducts.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-sage/25 bg-sage/5 px-4 py-8 text-center text-sm font-semibold text-sage">
                        Tous les produits sont suffisamment approvisionnés.
                      </p>
                    ) : (
                      <div className="divide-y divide-stone/10">
                        {lowStockProducts.slice(0, 5).map((product) => (
                          <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" key={product.id}>
                            <img
                              alt=""
                              className="h-10 w-10 rounded-xl border border-stone/10 object-cover"
                              onError={handleProductImageError}
                              src={productImageSrc(product)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-ink">{product.name}</p>
                              <p className="text-xs text-stone">{product.category}</p>
                            </div>
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                                product.stock === 0
                                  ? "bg-clay/12 text-clay"
                                  : "bg-[#fff2dc] text-[#a96416]"
                              }`}
                            >
                              {product.stock === 0 ? "Rupture" : `${product.stock} unités`}
                            </span>
                          </div>
                        ))}
                        <button
                          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-stone/12 text-xs font-bold text-stone transition hover:border-sage/30 hover:text-sage"
                          onClick={() => setTab("inventory")}
                          type="button"
                        >
                          Gérer le stock <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </AdminPanel>
                </div>
              </>
            )}

            {/* ORDERS */}
            {tab === "orders" && (
              <AdminPanel title="Toutes les commandes" icon={<ClipboardList size={20} />}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-stone/10 pb-5">
                  <div>
                    <p className={labelCls}>Filtrer par statut</p>
                    <select
                      className={`mt-2 min-w-52 ${selectCls}`}
                      onChange={(e) =>
                        setOrderStatusFilter(e.target.value as OrderStatus | "All")
                      }
                      value={orderStatusFilter}
                    >
                      <option value="All">Tous les statuts</option>
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>
                          {orderStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm font-semibold text-stone">
                    {visibleOrders.length} commande{visibleOrders.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone/10 bg-white">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone/10 bg-porcelain/50">
                        <th className={tableHeadCls}>Commande</th>
                        <th className={tableHeadCls}>Client</th>
                        <th className={tableHeadCls}>Adresse</th>
                        <th className={tableHeadCls}>Articles</th>
                        <th className={tableHeadCls}>Type</th>
                        <th className={tableHeadCls}>Total</th>
                        <th className={tableHeadCls}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((o) => (
                        <tr className={rowCls} key={o.id}>
                          <td className={`${tableCellCls} align-top`}>
                            <p className="font-bold text-ink">{o.id}</p>
                            <p className="text-sm text-stone">{formatAdminDate(o.date)}</p>
                          </td>
                          <td className={`${tableCellCls} align-top`}>
                            <p className="font-semibold text-ink">{o.customer}</p>
                            <p className="text-sm text-stone">{o.phone}</p>
                          </td>
                          <td
                            className={`max-w-56 ${tableCellCls} align-top text-sm leading-6 text-stone`}
                          >
                            <span className="inline-flex gap-2">
                              <MapPin className="mt-0.5 shrink-0 text-sage" size={16} />
                              {o.address}
                            </span>
                          </td>
                          <td
                            className={`max-w-xs ${tableCellCls} text-sm leading-6 text-stone`}
                          >
                            {o.items}
                          </td>
                          <td className={tableCellCls}>
                            <span
                              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${
                                o.gift
                                  ? "bg-brass/15 text-brass"
                                  : "bg-porcelain text-stone"
                              }`}
                            >
                              {o.gift && <Gift size={14} />}
                              {o.gift ? "Cadeau" : "Standard"}
                            </span>
                          </td>
                          <td className={`${tableCellCls} whitespace-nowrap text-base font-bold`}>
                            {formatAdminPrice(o.total)}
                          </td>
                          <td className={tableCellCls}>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={o.status} />
                              <select
                                aria-label={`Modifier le statut de ${o.id}`}
                                className="h-10 rounded-xl border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage"
                                onChange={(e) =>
                                  onOrderStatus(o.id, e.target.value as OrderStatus)
                                }
                                value={o.status}
                              >
                                {orderStatuses.map((s) => (
                                  <option key={s} value={s}>
                                    {orderStatusLabels[s]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {visibleOrders.length === 0 && (
                  <p className="mt-6 rounded-xl border border-dashed border-stone/20 bg-porcelain px-4 py-6 text-center text-sm font-semibold text-stone">
                    Aucune commande trouvée pour ce statut.
                  </p>
                )}
              </AdminPanel>
            )}

            {/* CATEGORIES */}
            {tab === "categories" && (
              <AdminPanel title="Catégories du catalogue" icon={<Tags size={20} />}>
                <form
                  className="mb-6 grid gap-4 border-b border-stone/10 pb-6 sm:grid-cols-[1fr_160px]"
                  onSubmit={addCategory}
                >
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Nouvelle catégorie</span>
                    <input
                      className={inputCls}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        setCategoryError("");
                      }}
                      placeholder="Ex. : Encens"
                      required
                      value={categoryName}
                    />
                  </label>
                  <button className={`mt-auto ${btnPrimary}`} type="submit">
                    <Plus size={17} />
                    Ajouter
                  </button>
                </form>

                {categoryError && (
                  <p className="mb-6 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">
                    {categoryError}
                  </p>
                )}

                <div className="overflow-x-auto rounded-xl border border-stone/10">
                  <table className="w-full min-w-[640px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone/10 bg-porcelain/50">
                        <th className={tableHeadCls}>Catégorie</th>
                        <th className={tableHeadCls}>Produits</th>
                        <th className={tableHeadCls}>Marge</th>
                        <th className={tableHeadCls}>État</th>
                        <th className={tableHeadCls}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr className={rowCls} key={c.id}>
                          <td className={tableCellCls}>
                            <div className="flex items-center gap-3">
                              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/15 text-brass">
                                <Tags size={18} />
                              </span>
                              <p className="font-bold text-ink">{c.name}</p>
                            </div>
                          </td>
                          <td className={`${tableCellCls} text-sm font-semibold text-stone`}>
                            {products.filter((p) => p.category === c.name).length}
                          </td>
                          <td className={`${tableCellCls} text-sm font-semibold text-stone`}>
                            {c.margin}%
                          </td>
                          <td className={tableCellCls}>
                            <span
                              className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${
                                c.active ? "bg-sage/10 text-sage" : "bg-stone/10 text-stone"
                              }`}
                            >
                              {c.active ? "Active" : "Masquée"}
                            </span>
                          </td>
                          <td className={tableCellCls}>
                            <button
                              className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone/15 bg-white px-4 text-sm font-bold text-stone transition hover:border-sage hover:text-ink"
                              onClick={() => onToggleCategory(c.id)}
                              type="button"
                            >
                              {c.active ? <Ban size={16} /> : <Save size={16} />}
                              {c.active ? "Masquer" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminPanel>
            )}

            {/* ADMINS */}
            {tab === "admins" && (
              <AdminPanel title="Équipe administratrice" icon={<UserCog size={20} />}>
                <form
                  className="mb-6 grid gap-4 border-b border-stone/10 pb-6 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr_160px_140px]"
                  onSubmit={inviteAdmin}
                >
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Nom</span>
                    <input
                      className={inputCls}
                      onChange={(e) => {
                        setNewAdminName(e.target.value);
                        setAdminFormError("");
                      }}
                      placeholder="Nom admin"
                      required
                      value={newAdminName}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Email</span>
                    <input
                      className={inputCls}
                      onChange={(e) => {
                        setNewAdminEmail(e.target.value);
                        setAdminFormError("");
                      }}
                      placeholder="admin@serreloud.tn"
                      required
                      type="email"
                      value={newAdminEmail}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Rôle</span>
                    <select
                      className={selectCls}
                      onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                      value={newAdminRole}
                    >
                      {adminRoles.map((r) => (
                        <option key={r} value={r}>
                          {adminRoleLabels[r]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className={`mt-auto ${btnPrimary}`} type="submit">
                    <UserCog size={17} />
                    Inviter
                  </button>
                </form>

                {adminFormError && (
                  <p className="mb-6 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">
                    {adminFormError}
                  </p>
                )}

                <div className="overflow-x-auto rounded-xl border border-stone/10">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone/10 bg-porcelain/50">
                        <th className={tableHeadCls}>Admin</th>
                        <th className={tableHeadCls}>Rôle</th>
                        <th className={tableHeadCls}>Statut</th>
                        <th className={tableHeadCls}>Dernière activité</th>
                        <th className={tableHeadCls}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map((a) => (
                        <tr className={rowCls} key={a.id}>
                          <td className={tableCellCls}>
                            <p className="font-bold text-ink">{a.name}</p>
                            <p className="text-sm text-stone">{a.email}</p>
                          </td>
                          <td className={tableCellCls}>
                            <select
                              aria-label={`Modifier le rôle de ${a.name}`}
                              className="h-10 rounded-xl border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage"
                              onChange={(e) => updateAdminRole(a.id, e.target.value as AdminRole)}
                              value={a.role}
                            >
                              {adminRoles.map((r) => (
                                <option key={r} value={r}>
                                  {adminRoleLabels[r]}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className={tableCellCls}>
                            <span
                              className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${
                                a.status === "Active"
                                  ? "bg-sage/10 text-sage"
                                  : "bg-stone/10 text-stone"
                              }`}
                            >
                              {a.status === "Active" ? "Actif" : "Suspendu"}
                            </span>
                          </td>
                          <td className={`${tableCellCls} text-sm font-semibold text-stone`}>
                            {formatAdminActivity(a.lastSeen)}
                          </td>
                          <td className={tableCellCls}>
                            <button
                              className="inline-flex h-10 items-center gap-2 rounded-xl border border-stone/15 bg-white px-4 text-sm font-bold text-stone transition hover:border-sage hover:text-ink"
                              onClick={() => toggleAdminStatus(a.id)}
                              type="button"
                            >
                              {a.status === "Active" ? <Ban size={16} /> : <Save size={16} />}
                              {a.status === "Active" ? "Suspendre" : "Activer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminPanel>
            )}

            {/* INVENTORY */}
            {tab === "inventory" && (
              <AdminPanel title="Produits et stock" icon={<Boxes size={20} />}>
                <form
                  className="mb-6 grid gap-4 border-b border-stone/10 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.2fr_1fr_150px_120px_120px_auto]"
                  onSubmit={submitProduct}
                >
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Produit</span>
                    <input
                      className={inputCls}
                      onChange={(e) => {
                        setProductForm((c) => ({ ...c, name: e.target.value }));
                        setProductFormError("");
                      }}
                      placeholder="Nom du produit"
                      required
                      value={productForm.name}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Catégorie</span>
                    <select
                      className={selectCls}
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, category: e.target.value }))
                      }
                      value={
                        productForm.category ||
                        categories.find((c) => c.active)?.name ||
                        categories[0]?.name ||
                        ""
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Prix</span>
                    <input
                      className={inputCenterCls}
                      max="9999"
                      min="1"
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, price: e.target.value }))
                      }
                      required
                      type="number"
                      value={productForm.price}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Stock</span>
                    <input
                      className={inputCenterCls}
                      max="99"
                      min="0"
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, stock: e.target.value }))
                      }
                      required
                      type="number"
                      value={productForm.stock}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Note</span>
                    <input
                      className={inputCenterCls}
                      max="5"
                      min="0"
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, rating: e.target.value }))
                      }
                      step="0.1"
                      type="number"
                      value={productForm.rating}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-3">
                    <span className={labelCls}>Image produit</span>
                    <input
                      className={inputCls}
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, imageUrl: e.target.value }))
                      }
                      placeholder="https://.../image.jpg"
                      type="url"
                      value={productForm.imageUrl}
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-2 xl:col-span-2">
                    <span className={labelCls}>Notes du parfum</span>
                    <input
                      className={inputCls}
                      onChange={(e) =>
                        setProductForm((c) => ({ ...c, notes: e.target.value }))
                      }
                      placeholder="oud, musc, ambre"
                      value={productForm.notes}
                    />
                  </label>

                  <button
                    className={`mt-auto ${btnPrimary}`}
                    disabled={productSaving}
                    type="submit"
                  >
                    <Plus size={17} />
                    {productSaving ? "Ajout…" : "Ajouter"}
                  </button>
                </form>

                {productFormError && (
                  <p className="mb-6 rounded-xl border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">
                    {productFormError}
                  </p>
                )}

                <div className="overflow-x-auto rounded-xl border border-stone/10">
                  <table className="w-full min-w-[1200px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-stone/10 bg-porcelain/50">
                        <th className={tableHeadCls}>Produit</th>
                        <th className={tableHeadCls}>Catégorie</th>
                        <th className={tableHeadCls}>Prix</th>
                        <th className={tableHeadCls}>Stock</th>
                        <th className={tableHeadCls}>Note</th>
                        <th className={tableHeadCls}>État</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr className={rowCls} key={product.id}>
                          <td className={tableCellCls}>
                            <div className="grid min-w-[340px] gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  alt={`Aperçu de ${product.name}`}
                                  className="h-14 w-14 rounded-xl border border-stone/10 object-cover shadow-sm"
                                  onError={handleProductImageError}
                                  src={productImageSrc(product)}
                                  style={{ objectPosition: product.imagePosition }}
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-bold text-ink">{product.name}</p>
                                  <p className="truncate text-sm text-stone">{product.line}</p>
                                </div>
                              </div>
                              <input
                                aria-label={`Adresse de l’image pour ${product.name}`}
                                className="h-10 w-full rounded-xl border border-stone/15 bg-porcelain px-3 text-sm outline-none focus:border-sage"
                                onBlur={() => commitImage(product.id)}
                                onChange={(e) =>
                                  setImageDrafts((c) => ({
                                    ...c,
                                    [product.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    commitImage(product.id);
                                    e.currentTarget.blur();
                                  }
                                }}
                                placeholder="Adresse de l’image"
                                type="url"
                                value={imageDrafts[product.id] ?? product.imageUrl ?? ""}
                              />
                            </div>
                          </td>

                          <td className={tableCellCls}>
                            <select
                              aria-label={`Changer la catégorie de ${product.name}`}
                              className="h-10 rounded-xl border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage"
                              onChange={(e) => onProductCategory(product.id, e.target.value)}
                              value={product.category}
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className={tableCellCls}>
                            <label className="inline-flex h-10 items-center overflow-hidden rounded-xl border border-stone/15 bg-white shadow-sm">
                              <input
                                aria-label={`Prix de ${product.name}`}
                                className="h-full w-24 bg-transparent px-3 text-center text-sm font-bold text-ink outline-none focus:text-sage"
                                max="9999"
                                min="1"
                                onBlur={() => commitPrice(product.id)}
                                onChange={(e) =>
                                  setPriceDrafts((c) => ({
                                    ...c,
                                    [product.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    commitPrice(product.id);
                                    e.currentTarget.blur();
                                  }
                                }}
                                required
                                type="number"
                                value={priceDrafts[product.id] ?? String(product.price)}
                              />
                              <span className="border-l border-stone/15 bg-porcelain/50 px-3 text-xs font-bold uppercase tracking-[0.1em] text-stone">
                                DT
                              </span>
                            </label>
                          </td>

                          <td className={tableCellCls}>
                            <div className="inline-flex items-center overflow-hidden rounded-xl border border-stone/15 bg-porcelain shadow-sm">
                              <button
                                aria-label={`Diminuer le stock de ${product.name}`}
                                className="grid h-10 w-10 place-items-center text-stone transition hover:bg-stone/10 hover:text-ink disabled:cursor-not-allowed disabled:text-stone/35"
                                disabled={product.stock <= 0}
                                onClick={() => {
                                  const v = product.stock - 1;
                                  setStockDrafts((c) => ({
                                    ...c,
                                    [product.id]: String(v),
                                  }));
                                  onStockChange(product.id, v);
                                }}
                                type="button"
                              >
                                <Minus size={16} />
                              </button>

                              <input
                                aria-label={`Quantité en stock pour ${product.name}`}
                                className={`h-10 w-16 border-x border-stone/15 bg-white text-center text-sm font-bold outline-none focus:border-sage ${
                                  product.stock <= 8 ? "text-clay" : "text-sage"
                                }`}
                                max="99"
                                min="0"
                                onBlur={() => commitStock(product.id)}
                                onChange={(e) =>
                                  setStockDrafts((c) => ({
                                    ...c,
                                    [product.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    commitStock(product.id);
                                    e.currentTarget.blur();
                                  }
                                }}
                                type="number"
                                value={stockDrafts[product.id] ?? String(product.stock)}
                              />

                              <button
                                aria-label={`Augmenter le stock de ${product.name}`}
                                className="grid h-10 w-10 place-items-center text-stone transition hover:bg-stone/10 hover:text-ink"
                                onClick={() => {
                                  const v = product.stock + 1;
                                  setStockDrafts((c) => ({
                                    ...c,
                                    [product.id]: String(v),
                                  }));
                                  onStockChange(product.id, v);
                                }}
                                type="button"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </td>

                          <td className={tableCellCls}>
                            <input
                              aria-label={`Note de ${product.name}`}
                              className="h-10 w-20 rounded-xl border border-stone/15 bg-white px-3 text-center text-sm font-bold text-brass shadow-sm outline-none focus:border-sage"
                              max="5"
                              min="0"
                              onBlur={() => commitRating(product.id)}
                              onChange={(e) =>
                                setRatingDrafts((c) => ({
                                  ...c,
                                  [product.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  commitRating(product.id);
                                  e.currentTarget.blur();
                                }
                              }}
                              step="0.1"
                              type="number"
                              value={ratingDrafts[product.id] ?? String(product.rating)}
                            />
                          </td>

                          <td className={tableCellCls}>
                            <span
                              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold ${
                                product.stock === 0
                                  ? "border border-clay/20 bg-clay/10 text-clay"
                                  : product.stock <= 8
                                    ? "border border-[#d68a2d]/20 bg-[#fff2dc] text-[#a96416]"
                                    : "border border-sage/20 bg-sage/10 text-sage"
                              }`}
                            >
                              <Edit3 size={14} />
                              {product.stock === 0
                                ? "Rupture de stock"
                                : product.stock <= 8
                                  ? "Stock faible"
                                  : "Stock suffisant"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AdminPanel>
            )}
          </div>
          </main>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function AdminPanel({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-stone/10 bg-white shadow-[0_8px_30px_rgba(45,39,31,0.045)]">
      <div className="flex items-center gap-3 border-b border-stone/10 px-5 py-4 sm:px-6">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage/10 text-sage">
          {icon}
        </span>
        <h2 className="font-display text-xl font-semibold leading-tight text-ink">
          {title}
        </h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cls: Record<OrderStatus, string> = {
    Pending: "border border-[#d68a2d]/20 bg-[#fff2dc] text-[#9a5b12]",
    Confirmed: "border border-sage/20 bg-sage/10 text-sage",
    Preparing: "border border-[#d68a2d]/20 bg-[#fff2dc] text-[#9a5b12]",
    Delivered: "border border-sage/20 bg-sage/10 text-sage",
    Cancelled: "border border-clay/20 bg-clay/10 text-clay",
  };
  const ico: Record<OrderStatus, ReactNode> = {
    Pending: <Clock size={14} />,
    Confirmed: <ShieldCheck size={14} />,
    Preparing: <Package size={14} />,
    Delivered: <Truck size={14} />,
    Cancelled: <Ban size={14} />,
  };
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-bold uppercase tracking-[0.1em] ${cls[status]}`}
    >
      {ico[status]}
      {orderStatusLabels[status]}
    </span>
  );
}

function CartDrawer({
  cartItems,
  cartOpen,
  cartTotal,
  onClose,
  onNavigate,
  onRemove,
  onUpdateQuantity,
}: {
  cartItems: Array<{ product: StoreProduct; quantity: number }>;
  cartOpen: boolean;
  cartTotal: number;
  onClose: () => void;
  onNavigate: (p: Page) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, d: number) => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 transition ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/40 transition ${cartOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
        type="button"
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone/10 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">
              Order bag
            </p>
            <h2 className="font-display text-3xl font-semibold">Your selection</h2>
          </div>
          <button
            aria-label="Close cart"
            className="grid h-10 w-10 place-items-center rounded border border-stone/15 text-stone hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {cartItems.length === 0 ? (
            <div className="grid min-h-80 place-items-center rounded border border-dashed border-stone/20 bg-porcelain p-8 text-center">
              <div>
                <ShoppingBag className="mx-auto text-stone" size={34} />
                <p className="mt-4 font-display text-3xl font-semibold">Empty bag</p>
                <p className="mt-2 text-sm text-stone">
                  Add perfumes from the catalogue to build an order.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {cartItems.map(({ product, quantity }) => (
                <div
                  className="grid grid-cols-[70px_1fr] gap-4 rounded border border-stone/10 bg-porcelain p-3"
                  key={product.id}
                >
                  <div className="h-20 rounded" style={{ background: product.swatch }} />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold">{product.name}</h3>
                        <p className="text-sm text-stone">{formatPrice(product.price)} each</p>
                      </div>
                      <button
                        aria-label={`Remove ${product.name}`}
                        className="grid h-8 w-8 place-items-center rounded text-stone hover:bg-white hover:text-clay"
                        onClick={() => onRemove(product.id)}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="inline-flex items-center rounded border border-stone/15 bg-white">
                        <button
                          aria-label={`Decrease ${product.name}`}
                          className="grid h-9 w-9 place-items-center text-stone hover:text-ink"
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          type="button"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="grid h-9 min-w-9 place-items-center text-sm font-bold">
                          {quantity}
                        </span>
                        <button
                          aria-label={`Increase ${product.name}`}
                          className="grid h-9 w-9 place-items-center text-stone hover:text-ink"
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          type="button"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="font-display text-2xl font-semibold">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone/10 p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-[0.14em] text-stone">
              Total
            </span>
            <span className="font-display text-4xl font-semibold">
              {formatPrice(cartTotal)}
            </span>
          </div>
          <button
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:bg-stone/20 disabled:text-stone"
            disabled={cartItems.length === 0}
            onClick={() => {
              onClose();
              onNavigate("contact");
            }}
            type="button"
          >
            Continue to request
            <ChevronRight size={18} />
          </button>
        </div>
      </aside>
    </div>
  );
}

function PageHeading({ page }: { page: Page }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
        {page === "catalogue" && "Shop with controls"}
        {page === "story" && "Brand foundation"}
        {page === "services" && "Client experience"}
        {page === "contact" && "Direct ordering"}
        {page === "tracking" && "Order tracking"}
        {page === "admin" && "Administration"}
        {page === "home" && "Welcome"}
      </p>
      <h1 className="mt-2 font-display text-5xl font-semibold leading-none text-ink sm:text-6xl">
        {pageTitles[page]}
      </h1>
    </div>
  );
}

function SectionIntro({
  copy,
  eyebrow,
  title,
}: {
  copy: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-stone sm:text-base">{copy}</p>
    </div>
  );
}

function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-brass" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          fill={i + 1 <= Math.round(rating) ? "currentColor" : "none"}
          key={i}
          size={16}
        />
      ))}
      <span className="ml-2 text-sm font-bold text-ink">{rating.toFixed(1)}</span>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      <rect height="18" rx="5" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" fill="currentColor" r="1" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M13.5 21v-8.1h2.7l.4-3.15h-3.1V7.77c0-.91.25-1.53 1.56-1.53h1.66V3.42C15.9 3.34 15 3.27 13.94 3.27c-2.4 0-4.04 1.47-4.04 4.16v2.32H7.2v3.15h2.7V21h3.6Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M16.6 5.82c-.9-.78-1.46-1.9-1.6-3.12h-3.03v13.44a2.7 2.7 0 1 1-2.28-2.67v-3.08a5.75 5.75 0 1 0 5.31 5.73V9.4a7.6 7.6 0 0 0 4.4 1.4V7.77c-1.03 0-2.02-.35-2.8-.97a5.8 5.8 0 0 1 0 0Z" />
    </svg>
  );
}

function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink px-5 py-16 text-white sm:px-8">
      {/* soft brass glow accents */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brass/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sage/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* Brand + socials */}
          <div>
            <p className="font-display text-3xl font-semibold">Serr El Oud</p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/60">
              Oriental perfume catalogue, private fragrance guidance, and
              direct order flow for Ariana, Tunis.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/75 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-brass hover:bg-brass/10 hover:text-brass-light"
                  href={s.href}
                  key={s.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass-light">
              Explore
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {navigation.map((item) => (
                <button
                  className="w-fit text-sm font-medium text-white/70 transition hover:text-brass-light"
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass-light">
              What clients say
            </p>
            <div className="mt-4 flex flex-col gap-5">
              {reviews.slice(0, 2).map((r) => (
                <div className="border-l border-brass/40 pl-4" key={r.author}>
                  <p className="text-sm leading-6 text-white/70">{r.text}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-brass-light">
                    {r.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {year} Serr El Oud. All rights reserved.</p>
          <p>Ariana, Tunis · Crafted with care</p>
        </div>
      </div>
    </footer>
  );
}
