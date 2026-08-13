import { supabase } from "./utils/supabase";
import {
  type FormEvent,
  type ReactNode,
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
  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Phone,
  Plus,
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
  name: string;
  category: string;
  price: number;
  stock: number;
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
  { id: "admin", label: "Admin" },
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
  admin: "Espace Admin",
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
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: ClipboardList },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "admins", label: "Admins", icon: UserCog },
  { id: "inventory", label: "Stock", icon: Boxes },
];

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
  const [selectedProductId, setSelectedProductId] = useState(
    catalogProducts[0].id
  );
  const [cart, setCart] = useState<Cart>({});
  const [adminOrders, setAdminOrders] =
    useState<AdminOrder[]>(initialAdminOrders);
  const [adminCategories, setAdminCategories] = useState<AdminCategory[]>(
    initialAdminCategories
  );
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
    fetchOrders();
    fetchProducts();
    fetchCategories();
  }, []);

  async function fetchOrders() {
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
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Erreur chargement produits:", error);
      return;
    }
    const rows = (data ?? []) as SupabaseProductRow[];
    setInventoryProducts((current) =>
      current.map((product) => {
        const sp = rows.find((p) => p.id === product.id);
        if (sp) {
          return {
            ...product,
            price: sp.price,
            stock: sp.stock,
            category: sp.category,
          };
        }
        return product;
      })
    );
  }

  async function fetchCategories() {
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
          { id: product.id, name: product.name, category: product.category, price: product.price, stock: nextStock },
          { onConflict: "id" }
        );
      }
    }

    await fetchOrders();
    await fetchProducts();

    setSubmittedOrderId(orderId);
    setSubmitted(true);
    setContactError("");
    setGiftOrder(false);
    setCart({});
    setCartOpen(false);
  }

  /* ---------- Order status ---------- */

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
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

    const { error } = await supabase.from("products").upsert(
      { id: product.id, name: product.name, category: product.category, price: product.price, stock: nextStock },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Erreur mise à jour stock:", error);
      return;
    }

    console.log("✅ Stock mis à jour:", productId, nextStock);
    await fetchProducts();

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

  /* ---------- Product price ---------- */

  async function updateProductPrice(productId: string, price: number) {
    const nextPrice = normalizePrice(price);
    const product = inventoryProducts.find((i) => i.id === productId);
    if (!product) {
      console.error(`Produit introuvable: ${productId}`);
      return;
    }

    const { error } = await supabase.from("products").upsert(
      { id: product.id, name: product.name, category: product.category, price: nextPrice, stock: product.stock },
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

    const { error } = await supabase.from("products").upsert(
      { id: product.id, name: product.name, category: nextCategory, price: product.price, stock: product.stock },
      { onConflict: "id" }
    );
    if (error) {
      console.error("Erreur mise à jour categorie:", error);
      return;
    }

    console.log("✅ Catégorie mise à jour:", productId, nextCategory);
    await fetchProducts();
  }

  /* ---------- Admin categories ---------- */

  async function addAdminCategory(name: string) {
    const newCat = { id: `cat-${Date.now()}`, name, active: true, margin: 35 };
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
    const { error } = await supabase.from("categories").update({ active: nextActive }).eq("id", categoryId);
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
      <Header
        cartCount={cartCount}
        currentPage={page}
        mobileOpen={mobileOpen}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMobileOpen((o) => !o)}
        onNavigate={navigate}
      />

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
            onContactMessage={(v) => { setContactMessage(v); setSubmitted(false); setSubmittedOrderId(""); setContactError(""); }}
            onContactName={(v) => { setContactName(v); setSubmitted(false); setSubmittedOrderId(""); setContactError(""); }}
            onContactPhone={(v) => { setContactPhone(v); setSubmitted(false); setSubmittedOrderId(""); setContactError(""); }}
            onContactAddress={(v) => { setContactAddress(v); setSubmitted(false); setSubmittedOrderId(""); setContactError(""); }}
            onGiftOrder={(v) => { setGiftOrder(v); setSubmitted(false); setSubmittedOrderId(""); setContactError(""); }}
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
            onLogin={() => setAdminAuthenticated(true)}
            onLogout={() => setAdminAuthenticated(false)}
            onProductCategory={updateProductCategory}
            onProductPrice={updateProductPrice}
            onOrderStatus={updateOrderStatus}
            onStockChange={updateProductStock}
            onToggleCategory={toggleAdminCategory}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />

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

function Header({ cartCount, currentPage, mobileOpen, onCart, onMenu, onNavigate }: {
  cartCount: number; currentPage: Page; mobileOpen: boolean;
  onCart: () => void; onMenu: () => void; onNavigate: (p: Page) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone/10 bg-ivory/92 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button className="group flex items-center gap-3 text-left" onClick={() => onNavigate("home")} type="button">
          <span className="grid h-10 w-10 place-items-center rounded border border-brass/35 bg-porcelain text-brass shadow-sm"><Sparkles size={18} /></span>
          <span>
            <span className="block font-display text-xl font-semibold tracking-wide text-ink">Serr El Oud</span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-stone">Parfumerie orientale</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded border border-stone/10 bg-white/70 p-1 shadow-sm md:flex">
          {navigation.map((item) => (
            <button className={`h-10 rounded px-4 text-sm font-medium transition ${currentPage === item.id ? "bg-ink text-white" : "text-stone hover:bg-porcelain hover:text-ink"}`} key={item.id} onClick={() => onNavigate(item.id)} type="button">{item.label}</button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button aria-label="Open cart" className="relative grid h-11 w-11 place-items-center rounded border border-stone/15 bg-white text-ink shadow-sm transition hover:border-brass/60" onClick={onCart} type="button">
            <ShoppingBag size={19} />
            {cartCount > 0 && (<span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-sage px-1 text-xs font-bold text-white">{cartCount}</span>)}
          </button>
          <button aria-label="Open menu" className="grid h-11 w-11 place-items-center rounded border border-stone/15 bg-white text-ink shadow-sm md:hidden" onClick={onMenu} type="button">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone/10 bg-ivory px-5 py-4 md:hidden">
          <div className="grid gap-2">
            {navigation.map((item) => (
              <button className={`rounded px-4 py-3 text-left text-sm font-medium ${currentPage === item.id ? "bg-ink text-white" : "bg-white text-stone"}`} key={item.id} onClick={() => onNavigate(item.id)} type="button">{item.label}</button>
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

function HomePage({ products, onAddToCart, onNavigate, onSelectProduct }: {
  products: StoreProduct[]; onAddToCart: (id: string) => void; onNavigate: (p: Page) => void; onSelectProduct: (id: string) => void;
}) {
  const featured = products.slice(0, 4);
  return (
    <>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-ink text-white">
        <img alt="Serr El Oud boutique shelves" className="absolute inset-0 h-full w-full object-cover" src="/hero.jpg" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,12,0.86),rgba(18,15,12,0.44)_48%,rgba(18,15,12,0.1))]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl content-center px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass-light backdrop-blur"><BadgeCheck size={15} />Boutique fragrance house in Tunis</div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">Serr El Oud</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">A refined oriental perfume shop with oud, musk, amber, incense oils, and curated gift sets. Built for quick discovery, clear orders, and a premium first impression.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button className="inline-flex h-12 items-center gap-2 rounded bg-brass px-5 text-sm font-bold text-ink shadow-xl shadow-black/20 transition hover:bg-brass-light" onClick={() => onNavigate("catalogue")} type="button">Shop catalogue<ChevronRight size={18} /></button>
              <button className="inline-flex h-12 items-center gap-2 rounded border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18" onClick={() => onNavigate("services")} type="button">Private blending<ArrowUpRight size={18} /></button>
            </div>
          </div>
          <div className="mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
            {storeStats.map((s) => (<div className="border-l border-white/20 bg-black/20 px-4 py-3 backdrop-blur" key={s.label}><p className="font-display text-3xl font-semibold text-brass-light">{s.value}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/62">{s.label}</p></div>))}
          </div>
        </div>
      </section>

      <section className="bg-ivory px-5 py-20 sm:px-8">
        <SectionIntro eyebrow="Signature selection" title="Four scents to start with" copy="Quick picks from the house catalogue. Choose a product, open the detail view, or add it straight to your order bag." />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (<ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onSelect={() => { onSelectProduct(p.id); onNavigate("catalogue"); }} />))}
        </div>
      </section>

      <section className="border-y border-stone/10 bg-porcelain px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">Built like a modern store</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">Fast browsing, warm brand, real purchase intent.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[{ icon: <Search size={21} />, title: "Filtered catalogue", copy: "Search by note, category, price, rating, and availability." }, { icon: <ShoppingBag size={21} />, title: "Order bag", copy: "Add items, update quantities, and see totals instantly." }, { icon: <Send size={21} />, title: "Contact flow", copy: "Validated request form with WhatsApp-ready messaging." }].map((item) => (
              <div className="rounded border border-stone/10 bg-white p-5 shadow-sm" key={item.title}><div className="mb-4 grid h-10 w-10 place-items-center rounded bg-sage/10 text-sage">{item.icon}</div><h3 className="font-display text-2xl font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-stone">{item.copy}</p></div>
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

function CataloguePage({ category, categoryOptions, filteredProducts, inStockOnly, maxPrice, priceCeiling, query, selectedProduct, sort, onAddToCart, onCategory, onInStockOnly, onMaxPrice, onQuery, onSelectProduct, onSort }: {
  category: string; categoryOptions: string[]; filteredProducts: StoreProduct[]; inStockOnly: boolean; maxPrice: number; priceCeiling: number; query: string; selectedProduct: StoreProduct; sort: SortKey;
  onAddToCart: (id: string) => void; onCategory: (c: string) => void; onInStockOnly: (v: boolean) => void; onMaxPrice: (p: number) => void; onQuery: (q: string) => void; onSelectProduct: (id: string) => void; onSort: (s: SortKey) => void;
}) {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="catalogue" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="self-start rounded border border-stone/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-2"><SlidersHorizontal className="text-sage" size={19} /><h2 className="font-display text-2xl font-semibold">Controls</h2></div>
            <label className="mt-5 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Search</span><span className="mt-2 flex h-11 items-center gap-2 rounded border border-stone/15 bg-porcelain px-3 focus-within:border-sage"><Search size={18} className="text-stone" /><input className="w-full bg-transparent text-sm outline-none placeholder:text-stone/60" onChange={(e) => onQuery(e.target.value)} placeholder="oud, musk, amber..." value={query} /></span></label>
            <div className="mt-5"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Category</span><div className="mt-2 grid grid-cols-2 gap-2">{categoryOptions.map((item) => (<button className={`h-10 rounded border px-3 text-sm font-semibold transition ${category === item ? "border-sage bg-sage text-white" : "border-stone/10 bg-porcelain text-ink hover:border-sage/50"}`} key={item} onClick={() => onCategory(item)} type="button">{item}</button>))}</div></div>
            <label className="mt-5 block"><span className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-stone">Max price<span className="text-ink">{formatPrice(maxPrice)}</span></span><input className="mt-3 w-full accent-sage" max={priceCeiling} min="140" onChange={(e) => onMaxPrice(Number(e.target.value))} step="5" type="range" value={maxPrice} /></label>
            <label className="mt-5 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Sort</span><select className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => onSort(e.target.value as SortKey)} value={sort}>{(Object.keys(sortLabels) as SortKey[]).map((k) => (<option key={k} value={k}>{sortLabels[k]}</option>))}</select></label>
            <label className="mt-5 flex cursor-pointer items-center justify-between rounded border border-stone/10 bg-porcelain px-4 py-3"><span className="text-sm font-semibold">In stock only</span><input checked={inStockOnly} className="h-5 w-5 accent-sage" onChange={(e) => onInStockOnly(e.target.checked)} type="checkbox" /></label>
          </aside>
          <div className="grid gap-6">
            <ProductDetail product={selectedProduct} onAddToCart={onAddToCart} />
            <div className="flex items-end justify-between gap-4">
              <div><p className="text-sm font-semibold text-stone">{filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} found</p><h2 className="font-display text-3xl font-semibold text-ink">Browse collection</h2></div>
              <button className="hidden h-11 rounded border border-stone/15 bg-white px-4 text-sm font-semibold text-stone transition hover:border-sage hover:text-ink sm:inline-flex sm:items-center" onClick={() => { onQuery(""); onCategory("All"); onMaxPrice(priceCeiling); onInStockOnly(false); onSort("featured"); }} type="button">Reset controls</button>
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((p) => (<ProductCard key={p.id} product={p} selected={selectedProduct.id === p.id} onAddToCart={onAddToCart} onSelect={() => onSelectProduct(p.id)} />))}</div>
            ) : (
              <div className="rounded border border-stone/10 bg-white p-8 text-center shadow-sm"><p className="font-display text-3xl font-semibold">No matches</p><p className="mt-2 text-sm text-stone">Try a wider price range, another category, or a simpler note.</p></div>
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

function ProductDetail({ product, onAddToCart }: { product: StoreProduct; onAddToCart: (id: string) => void }) {
  return (
    <article className="grid overflow-hidden rounded border border-stone/10 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-72 bg-ink">
        <img alt={`${product.name} perfume display`} className="absolute inset-0 h-full w-full object-cover" src="/hero.jpg" style={{ objectPosition: product.imagePosition }} />
        <div className="absolute inset-0 opacity-75" style={{ background: `linear-gradient(135deg, ${product.swatch}CC, rgba(18,15,12,.25))` }} />
        <div className="absolute bottom-5 left-5 right-5"><p className="mb-2 inline-flex rounded bg-white/92 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink">{product.category}</p><h2 className="font-display text-4xl font-semibold text-white">{product.name}</h2></div>
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3"><Rating rating={product.rating} /><span className="rounded bg-sage/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-sage">{product.stock} available</span></div>
        <p className="mt-4 font-display text-2xl font-semibold text-ink">{product.line}</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-stone">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">{product.notes.map((n) => (<span className="rounded border border-stone/10 bg-porcelain px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone" key={n}>{n}</span>))}</div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-stone/10 pt-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Price</p><p className="font-display text-4xl font-semibold text-ink">{formatPrice(product.price)}</p></div>
          <button className={`inline-flex h-12 items-center gap-2 rounded px-5 text-sm font-bold transition ${product.stock > 0 ? "bg-ink text-white hover:bg-sage" : "cursor-not-allowed bg-stone/15 text-stone"}`} disabled={product.stock <= 0} onClick={() => onAddToCart(product.id)} type="button"><ShoppingBag size={18} />{product.stock > 0 ? "Add to order" : "Out of stock"}</button>
        </div>
      </div>
    </article>
  );
}

function ProductCard({ product, selected = false, onAddToCart, onSelect }: { product: StoreProduct; selected?: boolean; onAddToCart: (id: string) => void; onSelect: () => void }) {
  return (
    <article className={`group overflow-hidden rounded border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${selected ? "border-sage" : "border-stone/10"}`}>
      <button className="relative block h-48 w-full overflow-hidden bg-ink text-left" onClick={onSelect} type="button">
        <img alt={`${product.name} fragrance`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src="/hero.jpg" style={{ objectPosition: product.imagePosition }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(0,0,0,.08), ${product.swatch}B3)` }} />
        {product.tag && (<span className="absolute left-3 top-3 rounded bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-ink">{product.tag}</span>)}
        <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-ink shadow"><ArrowUpRight size={18} /></span>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="font-display text-2xl font-semibold leading-tight text-ink">{product.name}</h3><p className="mt-1 text-sm text-stone">{product.line}</p></div>
          <button aria-label={`Save ${product.name}`} className="grid h-9 w-9 shrink-0 place-items-center rounded border border-stone/10 text-stone transition hover:border-sage hover:text-sage" type="button"><Heart size={17} /></button>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone">{product.mood}</p>
        <div className="mt-5 flex items-center justify-between">
          <div><p className="font-display text-3xl font-semibold text-ink">{formatPrice(product.price)}</p><p className="text-xs uppercase tracking-[0.12em] text-stone">{product.volume}</p></div>
          <button aria-label={`Add ${product.name} to order`} className={`grid h-11 w-11 place-items-center rounded transition ${product.stock > 0 ? "bg-ink text-white hover:bg-sage" : "cursor-not-allowed bg-stone/15 text-stone"}`} disabled={product.stock <= 0} onClick={() => onAddToCart(product.id)} type="button"><Plus size={19} /></button>
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
    <section className="px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><PageHeading page="story" /><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start"><div className="overflow-hidden rounded border border-stone/10 bg-white shadow-sm"><img alt="Perfume bottles displayed inside Serr El Oud" className="h-80 w-full object-cover sm:h-[500px]" src="/hero.jpg" /></div><div className="grid gap-5">{[{ title: "Founded in the medina spirit", copy: "Serr El Oud was shaped around the intimacy of perfume buying: testing slowly, listening carefully, and leaving with a scent that feels personal." }, { title: "Ingredients with character", copy: "The catalogue balances Cambodian-style oud, white musk oils, warm amber resins, incense smoke, florals, saffron, and woods." }, { title: "Modern service, traditional soul", copy: "The shop experience is built for clear browsing, gifting support, private recommendations, and direct WhatsApp ordering." }].map((item) => (<div className="rounded border border-stone/10 bg-white p-6 shadow-sm" key={item.title}><h2 className="font-display text-3xl font-semibold text-ink">{item.title}</h2><p className="mt-3 text-sm leading-7 text-stone">{item.copy}</p></div>))}<button className="inline-flex h-12 w-fit items-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage" onClick={() => onNavigate("catalogue")} type="button">Explore products<ChevronRight size={18} /></button></div></div></div></section>
  );
}

function ServicesPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const services = [{ icon: <Sparkles size={24} />, title: "Personal scent consultation", copy: "A guided session to match notes, strength, and occasion to the person wearing the fragrance." }, { icon: <Gift size={24} />, title: "Gift preparation", copy: "Discovery sets, ribboned boxes, message cards, and elegant options for weddings or business gifts." }, { icon: <Leaf size={24} />, title: "Oil layering", copy: "Build a softer or stronger signature by pairing musk, oud, amber, and floral oils." }, { icon: <ShieldCheck size={24} />, title: "Refill and care", copy: "Refill guidance, storage advice, and bottle care so the scent keeps its original character." }];
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><PageHeading page="services" /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.map((s) => (<div className="rounded border border-stone/10 bg-white p-6 shadow-sm" key={s.title}><div className="grid h-12 w-12 place-items-center rounded bg-clay/12 text-clay">{s.icon}</div><h2 className="mt-5 font-display text-3xl font-semibold leading-tight">{s.title}</h2><p className="mt-3 text-sm leading-7 text-stone">{s.copy}</p></div>))}</div><div className="mt-8 grid gap-6 rounded border border-stone/10 bg-ink p-6 text-white shadow-sm lg:grid-cols-[1fr_auto] lg:items-center lg:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brass-light">Bespoke request</p><h2 className="mt-2 font-display text-4xl font-semibold">Need a custom gift or private recommendation?</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">Send the occasion, budget, and scent preference. The contact page handles basic validation before the request is sent.</p></div><button className="inline-flex h-12 items-center justify-center gap-2 rounded bg-brass px-5 text-sm font-bold text-ink transition hover:bg-brass-light" onClick={() => onNavigate("contact")} type="button">Start request<Send size={18} /></button></div></div></section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════════════════ */

function ContactPage({ cartItems, cartTotal, contactAddress, contactError, contactMessage, contactName, contactPhone, contactReady, giftOrder, submitted, submittedOrderId, onContactMessage, onContactName, onContactPhone, onContactAddress, onGiftOrder, onNavigate, onSubmit }: {
  cartItems: Array<{ product: StoreProduct; quantity: number }>; cartTotal: number; contactAddress: string; contactError: string; contactMessage: string; contactName: string; contactPhone: string; contactReady: boolean; giftOrder: boolean; submitted: boolean; submittedOrderId: string;
  onContactMessage: (v: string) => void; onContactName: (v: string) => void; onContactPhone: (v: string) => void; onContactAddress: (v: string) => void; onGiftOrder: (v: boolean) => void; onNavigate: (p: Page) => void; onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const submitReady = contactReady && !submitted;
  const cartSummary = cartItems.length > 0 ? cartItems.map(({ product, quantity }) => `${product.name} x${quantity}`).join(", ") : "Custom fragrance request";
  const whatsappMessage = encodeURIComponent(`Hello Serr El Oud, my name is ${contactName || "[name]"}. Address: ${contactAddress || "[address]"}. Order: ${cartSummary}. Gift: ${giftOrder ? "yes" : "no"}. ${contactMessage}`);

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><PageHeading page="contact" /><div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid gap-4">{[{ icon: <MapPin size={21} />, title: "Boutique", copy: "V579+M43, Ariana, Tunis" }, { icon: <Clock size={21} />, title: "Hours", copy: "Monday to Saturday, 9:00 to 20:00" }, { icon: <Phone size={21} />, title: "Phone", copy: "+216 20 200 888" }, { icon: <Mail size={21} />, title: "Orders", copy: "Fast requests by WhatsApp or the form." }].map((item) => (<div className="flex gap-4 rounded border border-stone/10 bg-white p-5 shadow-sm" key={item.title}><div className="grid h-11 w-11 shrink-0 place-items-center rounded bg-sage/10 text-sage">{item.icon}</div><div><h2 className="font-display text-2xl font-semibold">{item.title}</h2><p className="mt-1 text-sm text-stone">{item.copy}</p></div></div>))}</div>
      <form className="rounded border border-stone/10 bg-white p-6 shadow-sm sm:p-8" onSubmit={onSubmit}>
        <h2 className="font-display text-4xl font-semibold text-ink">Order request</h2><p className="mt-2 text-sm leading-7 text-stone">The order is sent to the admin commandes list when the form is submitted.</p>
        <div className="mt-5 rounded border border-stone/10 bg-porcelain p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Order summary</p><p className="font-display text-2xl font-semibold text-ink">{formatPrice(cartTotal)}</p></div>{cartItems.length > 0 ? (<div className="mt-3 grid gap-2">{cartItems.map(({ product, quantity }) => (<div className="flex items-center justify-between gap-3 text-sm" key={product.id}><span className="font-semibold text-ink">{product.name}</span><span className="text-stone">x{quantity}</span></div>))}</div>) : (<p className="mt-3 text-sm leading-6 text-stone">No cart item selected. The message will be saved as a custom request.</p>)}</div>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded border border-stone/10 bg-porcelain px-4 py-3"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded bg-brass/15 text-brass"><Gift size={18} /></span><span><span className="block text-sm font-bold text-ink">Gift option</span><span className="block text-xs text-stone">Mark this commande as a gift.</span></span></span><input checked={giftOrder} className="h-5 w-5 accent-sage" onChange={(e) => onGiftOrder(e.target.checked)} type="checkbox" /></label>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Name</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => onContactName(e.target.value)} placeholder="Your name" required value={contactName} /></label><label className="block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Phone</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => onContactPhone(e.target.value)} placeholder="+216 ..." required value={contactPhone} /></label></div>
        <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Address</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => onContactAddress(e.target.value)} placeholder="Delivery address" required value={contactAddress} /></label>
        <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Message</span><textarea className="mt-2 min-h-36 w-full resize-y rounded border border-stone/15 bg-porcelain p-4 text-sm leading-6 outline-none transition focus:border-sage" onChange={(e) => onContactMessage(e.target.value)} value={contactMessage} /></label>
        {contactError && (<p className="mt-4 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{contactError}</p>)}
        <div className="mt-6 flex flex-wrap gap-3"><button className={`inline-flex h-12 items-center gap-2 rounded px-5 text-sm font-bold transition ${submitReady ? "bg-ink text-white hover:bg-sage" : "cursor-not-allowed bg-stone/15 text-stone"}`} disabled={!submitReady} type="submit"><Send size={18} />Confirmer commande</button><a className="inline-flex h-12 items-center gap-2 rounded border border-sage/30 bg-sage/10 px-5 text-sm font-bold text-sage transition hover:border-sage" href={`https://wa.me/21620200888?text=${whatsappMessage}`}><Phone size={18} />WhatsApp</a></div>
        {submitted && (<div className="mt-5 rounded border border-sage/25 bg-sage/10 px-4 py-3"><p className="text-sm font-semibold text-sage">Commande accepted. Reference: {submittedOrderId}.</p><button className="mt-3 inline-flex h-10 items-center gap-2 rounded bg-sage px-4 text-sm font-bold text-white transition hover:bg-ink" onClick={() => onNavigate("tracking")} type="button"><ClipboardList size={17} />Track status</button></div>)}
      </form>
    </div></div></section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ORDER STATUS PAGE
   ═══════════════════════════════════════════════════════════ */

function OrderStatusPage({ initialPhone, initialReference, orders }: { initialPhone: string; initialReference: string; orders: AdminOrder[] }) {
  const [reference, setReference] = useState(initialReference);
  const [phone, setPhone] = useState(initialPhone);
  const [searched, setSearched] = useState(Boolean(initialReference));
  const [trackingError, setTrackingError] = useState("");

  const normalizedReference = reference.trim().toUpperCase();
  const normalizedPhone = normalizePhone(phone);
  const matchedOrder = searched && !trackingError ? orders.find((o) => { const op = normalizePhone(o.phone); return o.id.toUpperCase() === normalizedReference && (op === normalizedPhone || op.endsWith(normalizedPhone) || normalizedPhone.endsWith(op)); }) : undefined;
  const currentStep = matchedOrder ? getStatusStep(matchedOrder.status) : -1;
  const progressSteps: Array<{ status: Exclude<OrderStatus, "Cancelled">; title: string; copy: string; icon: ReactNode }> = [
    { status: "Pending", title: "Commande recue", copy: "Votre demande est dans la liste admin.", icon: <Clock size={18} /> },
    { status: "Confirmed", title: "Commande confirmee", copy: "La boutique a valide la commande.", icon: <ShieldCheck size={18} /> },
    { status: "Preparing", title: "Preparation", copy: "Les produits sont en preparation.", icon: <Package size={18} /> },
    { status: "Delivered", title: "Livree", copy: "La commande est terminee.", icon: <Truck size={18} /> },
  ];

  function submitTracking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^CMD-\d{4,}$/i.test(reference.trim())) { setTrackingError("Reference invalide. Exemple: CMD-1048."); setSearched(false); return; }
    if (!isValidPhone(phone)) { setTrackingError("Phone must contain at least 8 digits."); setSearched(false); return; }
    const exists = orders.some((o) => { const op = normalizePhone(o.phone); return o.id.toUpperCase() === normalizedReference && (op === normalizedPhone || op.endsWith(normalizedPhone) || normalizedPhone.endsWith(op)); });
    if (!exists) { setTrackingError("No commande found with this reference and phone."); setSearched(false); return; }
    setTrackingError(""); setSearched(true);
  }

  return (
    <section className="bg-porcelain px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl"><PageHeading page="tracking" /><div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
      <form className="self-start rounded border border-stone/10 bg-white p-6 shadow-sm lg:sticky lg:top-24" onSubmit={submitTracking}>
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded bg-sage/10 text-sage"><ClipboardList size={20} /></span><h2 className="font-display text-3xl font-semibold text-ink">Recherche</h2></div>
        <label className="mt-6 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Reference</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm font-bold uppercase outline-none transition focus:border-sage" onChange={(e) => { setReference(e.target.value.toUpperCase()); setTrackingError(""); }} pattern="CMD-[0-9]{4,}" placeholder="CMD-1048" required value={reference} /></label>
        <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Phone</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => { setPhone(e.target.value); setTrackingError(""); }} placeholder="+216 ..." required value={phone} /></label>
        {trackingError && (<p className="mt-4 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{trackingError}</p>)}
        <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage" type="submit"><Search size={18} />Voir statut</button>
      </form>
      <div className="rounded border border-stone/10 bg-white p-6 shadow-sm sm:p-8">
        {matchedOrder ? (<>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone/10 pb-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Reference</p><h2 className="mt-1 font-display text-4xl font-semibold text-ink">{matchedOrder.id}</h2><p className="mt-2 text-sm font-semibold text-stone">{matchedOrder.customer} - {matchedOrder.date}</p></div><div className="flex flex-wrap gap-2"><StatusBadge status={matchedOrder.status} /><span className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-bold uppercase tracking-[0.1em] ${matchedOrder.gift ? "bg-brass/15 text-brass" : "bg-porcelain text-stone"}`}>{matchedOrder.gift && <Gift size={14} />}{matchedOrder.gift ? "Gift" : "Standard"}</span></div></div>
          {matchedOrder.status === "Cancelled" ? (<div className="mt-6 rounded border border-clay/20 bg-clay/10 p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded bg-white text-clay"><Ban size={18} /></span><div><h3 className="font-display text-2xl font-semibold text-ink">Commande annulee</h3><p className="mt-1 text-sm leading-6 text-clay">Contactez la boutique avec la reference pour plus de details.</p></div></div></div>) : (<div className="mt-6 grid gap-4">{progressSteps.map((step, index) => { const active = currentStep >= index; return (<div className={`grid gap-3 rounded border p-4 sm:grid-cols-[44px_1fr] ${active ? "border-sage/25 bg-sage/10" : "border-stone/10 bg-porcelain"}`} key={step.status}><span className={`grid h-11 w-11 place-items-center rounded ${active ? "bg-sage text-white" : "bg-white text-stone"}`}>{step.icon}</span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-2xl font-semibold text-ink">{step.title}</h3>{matchedOrder.status === step.status && (<span className="rounded bg-white px-2 py-1 text-xs font-bold uppercase tracking-[0.1em] text-sage">Current</span>)}</div><p className="mt-1 text-sm leading-6 text-stone">{step.copy}</p></div></div>); })}</div>)}
          <div className="mt-6 grid gap-4 rounded border border-stone/10 bg-porcelain p-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Articles</p><p className="mt-1 text-sm leading-6 text-ink">{matchedOrder.items}</p></div><p className="font-display text-3xl font-semibold text-ink">{formatPrice(matchedOrder.total)}</p></div>
        </>) : (<div className="grid min-h-96 place-items-center rounded border border-dashed border-stone/20 bg-porcelain p-8 text-center"><div><ClipboardList className="mx-auto text-stone" size={36} /><h2 className="mt-4 font-display text-3xl font-semibold text-ink">Enter your reference</h2><p className="mt-2 max-w-md text-sm leading-7 text-stone">Use the reference shown after confirmation, for example CMD-1048, with the same phone number used for the commande.</p></div></div>)}
      </div>
    </div></div></section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN PAGE
   ═══════════════════════════════════════════════════════════ */

function AdminPage({ authenticated, categories, orders, products, onAddCategory, onLogin, onLogout, onProductCategory, onProductPrice, onOrderStatus, onStockChange, onToggleCategory }: {
  authenticated: boolean; categories: AdminCategory[]; orders: AdminOrder[]; products: StoreProduct[];
  onAddCategory: (n: string) => void; onLogin: () => void; onLogout: () => void;
  onProductCategory: (id: string, c: string) => void; onProductPrice: (id: string, p: number) => void;
  onOrderStatus: (id: string, s: OrderStatus) => void; onStockChange: (id: string, s: number) => void; onToggleCategory: (id: string) => void;
}) {
  const [tab, setTab] = useState<AdminTab>("overview");
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

  useEffect(() => {
    setPriceDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.price)])));
    setStockDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.stock)])));
  }, [products]);

  const activeOrders = orders.filter((o) => o.status !== "Cancelled");
  const ordersInProgress = orders.filter((o) => ["Pending", "Confirmed", "Preparing"].includes(o.status));
  const revenue = activeOrders.reduce((s, o) => s + o.total, 0);
  const activeAdmins = adminUsers.filter((a) => a.status === "Active");
  const lowStockProducts = products.filter((p) => p.stock <= 8);
  const visibleOrders = orderStatusFilter === "All" ? orders : orders.filter((o) => o.status === orderStatusFilter);

  const dashboardCards = [
    { label: "Commandes ouvertes", value: ordersInProgress.length.toString(), detail: `${orders.filter((o) => o.status === "Pending").length} pending`, icon: ClipboardList },
    { label: "Chiffre d'affaires", value: formatPrice(revenue), detail: "Commandes non annulees", icon: Archive },
    { label: "Categories actives", value: categories.filter((c) => c.active).length.toString(), detail: `${categories.length} categories total`, icon: Tags },
    { label: "Admins actifs", value: activeAdmins.length.toString(), detail: `${adminUsers.length} comptes admin`, icon: Users },
  ];

  function commitPrice(productId: string) {
    const raw = priceDrafts[productId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || Number.isNaN(val)) { setPriceDrafts((c) => { const p = products.find((i) => i.id === productId); return { ...c, [productId]: p ? String(p.price) : "1" }; }); return; }
    onProductPrice(productId, val);
  }

  function commitStock(productId: string) {
    const raw = stockDrafts[productId] ?? "";
    const val = Number(raw);
    if (!raw.trim() || Number.isNaN(val)) { setStockDrafts((c) => { const p = products.find((i) => i.id === productId); return { ...c, [productId]: p ? String(p.stock) : "0" }; }); return; }
    onStockChange(productId, val);
  }

  function submitAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword) { setLoginError("Email and password are required."); return; }
    if (loginEmail.trim().toLowerCase() === adminCredentials.email && loginPassword === adminCredentials.password) { setLoginError(""); setLoginPassword(""); onLogin(); return; }
    setLoginError("Email ou mot de passe incorrect.");
  }

  function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (name.length < 2) { setCategoryError("Category name must contain at least 2 characters."); return; }
    if (name.toLowerCase() === "all") { setCategoryError("This category name is reserved."); return; }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) { setCategoryError("This category already exists."); return; }
    onAddCategory(name); setCategoryName(""); setCategoryError("");
  }

  function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newAdminName.trim(); const email = newAdminEmail.trim();
    if (name.length < 2) { setAdminFormError("Admin name must contain at least 2 characters."); return; }
    if (!isValidEmail(email)) { setAdminFormError("Enter a valid admin email."); return; }
    if (adminUsers.some((a) => a.email.toLowerCase() === email.toLowerCase())) { setAdminFormError("This admin email already exists."); return; }
    setAdminUsers((c) => [...c, { id: `adm-${Date.now()}`, name, email, role: newAdminRole, status: "Active", lastSeen: "Invite sent" }]);
    setNewAdminName(""); setNewAdminEmail(""); setNewAdminRole("Sales"); setAdminFormError("");
  }

  function updateAdminRole(adminId: string, role: AdminRole) { setAdminUsers((c) => c.map((a) => (a.id === adminId ? { ...a, role } : a))); }
  function toggleAdminStatus(adminId: string) { setAdminUsers((c) => c.map((a) => (a.id === adminId ? { ...a, status: a.status === "Active" ? "Paused" as AdminStatus : "Active" as AdminStatus } : a))); }

  if (!authenticated) {
    return (
      <section className="bg-porcelain px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto grid min-h-[calc(100vh-220px)] max-w-7xl place-items-center">
        <form className="w-full max-w-md rounded border border-stone/10 bg-white p-6 shadow-sm sm:p-8" onSubmit={submitAdminLogin}>
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded bg-sage/10 text-sage"><ShieldCheck size={22} /></span><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">Acces admin</p><h1 className="font-display text-4xl font-semibold leading-tight text-ink">Connexion</h1></div></div>
          <label className="mt-7 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Email</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => { setLoginEmail(e.target.value); setLoginError(""); }} placeholder="admin@serreloud.tn" required type="email" value={loginEmail} /></label>
          <label className="mt-4 block"><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Mot de passe</span><input className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage" onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }} placeholder="Password" required type="password" value={loginPassword} /></label>
          {loginError && (<p className="mt-4 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{loginError}</p>)}
          <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage" type="submit"><ShieldCheck size={18} />Se connecter</button>
        </form>
      </div></section>
    );
  }

  return (
    <section className="bg-porcelain px-5 py-12 sm:px-8 lg:py-16"><div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading page="admin" />
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex h-10 items-center gap-2 rounded border border-sage/25 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-sage shadow-sm"><ShieldCheck size={16} />Back office</span>
          <span className="inline-flex h-10 items-center gap-2 rounded border border-stone/10 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-stone shadow-sm"><Clock size={16} />Today</span>
          <button className="inline-flex h-10 items-center gap-2 rounded border border-stone/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-stone shadow-sm transition hover:border-clay hover:text-clay" onClick={() => { setTab("overview"); onLogout(); }} type="button"><X size={16} />Logout</button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="self-start rounded border border-stone/10 bg-white p-3 shadow-sm lg:sticky lg:top-24"><div className="grid gap-1">{adminTabs.map((item) => { const Icon = item.icon; return (<button className={`flex h-11 items-center gap-3 rounded px-3 text-left text-sm font-bold transition ${tab === item.id ? "bg-ink text-white" : "text-stone hover:bg-porcelain hover:text-ink"}`} key={item.id} onClick={() => setTab(item.id)} type="button"><Icon size={18} />{item.label}</button>); })}</div></aside>

        <div className="grid gap-6">
          {/* OVERVIEW */}
          {tab === "overview" && (<>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{dashboardCards.map((card) => { const Icon = card.icon; return (<div className="rounded border border-stone/10 bg-white p-5 shadow-sm" key={card.label}><div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">{card.label}</p><span className="grid h-10 w-10 place-items-center rounded bg-sage/10 text-sage"><Icon size={19} /></span></div><p className="mt-5 font-display text-4xl font-semibold text-ink">{card.value}</p><p className="mt-1 text-sm text-stone">{card.detail}</p></div>); })}</div>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <AdminPanel title="Dernieres commandes" icon={<ClipboardList size={20} />}><div className="grid gap-3">{orders.slice(0, 3).map((o) => (<div className="grid gap-3 rounded border border-stone/10 bg-porcelain p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={o.id}><div><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-ink">{o.id}</p><StatusBadge status={o.status} /></div><p className="mt-1 text-sm text-stone">{o.customer} - {o.items}</p></div><p className="font-display text-2xl font-semibold">{formatPrice(o.total)}</p></div>))}</div></AdminPanel>
              <AdminPanel title="Alertes stock" icon={<Package size={20} />}><div className="grid gap-3">{lowStockProducts.map((p) => (<div className="flex items-center justify-between gap-3 rounded border border-stone/10 bg-porcelain p-4" key={p.id}><div className="min-w-0"><p className="truncate font-bold text-ink">{p.name}</p><p className="text-sm text-stone">{p.category}</p></div><span className="rounded bg-clay/12 px-3 py-1 text-sm font-bold text-clay">{p.stock}</span></div>))}</div></AdminPanel>
            </div>
          </>)}

          {/* ORDERS */}
          {tab === "orders" && (
            <AdminPanel title="Gestion des commandes" icon={<ClipboardList size={20} />}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-stone/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Tri par statut</p><select className="mt-2 h-11 rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | "All")} value={orderStatusFilter}><option value="All">Tous les statuts</option>{orderStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div><p className="text-sm font-semibold text-stone">{visibleOrders.length} commande{visibleOrders.length === 1 ? "" : "s"}</p></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left"><thead><tr className="border-b border-stone/10 text-xs font-bold uppercase tracking-[0.14em] text-stone"><th className="py-3 pr-4">Commande</th><th className="py-3 pr-4">Client</th><th className="py-3 pr-4">Adresse</th><th className="py-3 pr-4">Articles</th><th className="py-3 pr-4">Gift</th><th className="py-3 pr-4">Total</th><th className="py-3 pr-4">Statut</th></tr></thead><tbody>{visibleOrders.map((o) => (<tr className="border-b border-stone/10 last:border-0" key={o.id}><td className="py-4 pr-4 align-top"><p className="font-bold text-ink">{o.id}</p><p className="text-sm text-stone">{o.date}</p></td><td className="py-4 pr-4 align-top"><p className="font-semibold text-ink">{o.customer}</p><p className="text-sm text-stone">{o.phone}</p></td><td className="max-w-56 py-4 pr-4 align-top text-sm leading-6 text-stone"><span className="inline-flex gap-2"><MapPin className="mt-0.5 shrink-0 text-sage" size={16} />{o.address}</span></td><td className="max-w-xs py-4 pr-4 text-sm leading-6 text-stone">{o.items}</td><td className="py-4 pr-4"><span className={`inline-flex items-center gap-1 rounded px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${o.gift ? "bg-brass/15 text-brass" : "bg-porcelain text-stone"}`}>{o.gift && <Gift size={14} />}{o.gift ? "Gift" : "Standard"}</span></td><td className="py-4 pr-4 font-display text-2xl font-semibold">{formatPrice(o.total)}</td><td className="py-4 pr-4"><div className="flex items-center gap-2"><StatusBadge status={o.status} /><select aria-label={`Update status for ${o.id}`} className="h-10 rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => onOrderStatus(o.id, e.target.value as OrderStatus)} value={o.status}>{orderStatuses.map((s) => (<option key={s} value={s}>{s}</option>))}</select></div></td></tr>))}</tbody></table></div>
              {visibleOrders.length === 0 && (<p className="mt-5 rounded border border-dashed border-stone/20 bg-porcelain px-4 py-6 text-center text-sm font-semibold text-stone">No commandes found for this status.</p>)}
            </AdminPanel>
          )}

          {/* CATEGORIES */}
          {tab === "categories" && (
            <AdminPanel title="Gestion des categories" icon={<Tags size={20} />}>
              <form className="mb-5 grid gap-3 border-b border-stone/10 pb-5 sm:grid-cols-[1fr_150px]" onSubmit={addCategory}><label><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Nouvelle categorie</span><input className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none focus:border-sage" onChange={(e) => { setCategoryName(e.target.value); setCategoryError(""); }} placeholder="Ex: Incense" required value={categoryName} /></label><button className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-bold text-white transition hover:bg-sage" type="submit"><Plus size={17} />Ajouter</button></form>
              {categoryError && (<p className="mb-5 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{categoryError}</p>)}
              <div className="overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-left"><thead><tr className="border-b border-stone/10 text-xs font-bold uppercase tracking-[0.14em] text-stone"><th className="py-3 pr-4">Categorie</th><th className="py-3 pr-4">Produits</th><th className="py-3 pr-4">Marge</th><th className="py-3 pr-4">Etat</th><th className="py-3 pr-4">Action</th></tr></thead><tbody>{categories.map((c) => (<tr className="border-b border-stone/10 last:border-0" key={c.id}><td className="py-4 pr-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded bg-brass/15 text-brass"><Tags size={18} /></span><p className="font-bold text-ink">{c.name}</p></div></td><td className="py-4 pr-4 text-sm font-semibold text-stone">{products.filter((p) => p.category === c.name).length}</td><td className="py-4 pr-4 text-sm font-semibold text-stone">{c.margin}%</td><td className="py-4 pr-4"><span className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${c.active ? "bg-sage/10 text-sage" : "bg-stone/10 text-stone"}`}>{c.active ? "Active" : "Masquee"}</span></td><td className="py-4 pr-4"><button className="inline-flex h-10 items-center gap-2 rounded border border-stone/15 bg-white px-3 text-sm font-bold text-stone transition hover:border-sage hover:text-ink" onClick={() => onToggleCategory(c.id)} type="button">{c.active ? <Ban size={16} /> : <Save size={16} />}{c.active ? "Masquer" : "Activer"}</button></td></tr>))}</tbody></table></div>
            </AdminPanel>
          )}

          {/* ADMINS */}
          {tab === "admins" && (
            <AdminPanel title="Gestion des admins" icon={<UserCog size={20} />}>
              <form className="mb-5 grid gap-3 border-b border-stone/10 pb-5 lg:grid-cols-[1fr_1.2fr_160px_140px]" onSubmit={inviteAdmin}><label><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Nom</span><input className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none focus:border-sage" onChange={(e) => { setNewAdminName(e.target.value); setAdminFormError(""); }} placeholder="Nom admin" required value={newAdminName} /></label><label><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Email</span><input className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none focus:border-sage" onChange={(e) => { setNewAdminEmail(e.target.value); setAdminFormError(""); }} placeholder="admin@serreloud.tn" required type="email" value={newAdminEmail} /></label><label><span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">Role</span><select className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => setNewAdminRole(e.target.value as AdminRole)} value={newAdminRole}>{adminRoles.map((r) => (<option key={r} value={r}>{r}</option>))}</select></label><button className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded bg-ink px-4 text-sm font-bold text-white transition hover:bg-sage" type="submit"><UserCog size={17} />Inviter</button></form>
              {adminFormError && (<p className="mb-5 rounded border border-clay/20 bg-clay/10 px-4 py-3 text-sm font-semibold text-clay">{adminFormError}</p>)}
              <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-left"><thead><tr className="border-b border-stone/10 text-xs font-bold uppercase tracking-[0.14em] text-stone"><th className="py-3 pr-4">Admin</th><th className="py-3 pr-4">Role</th><th className="py-3 pr-4">Statut</th><th className="py-3 pr-4">Derniere activite</th><th className="py-3 pr-4">Action</th></tr></thead><tbody>{adminUsers.map((a) => (<tr className="border-b border-stone/10 last:border-0" key={a.id}><td className="py-4 pr-4"><p className="font-bold text-ink">{a.name}</p><p className="text-sm text-stone">{a.email}</p></td><td className="py-4 pr-4"><select aria-label={`Update role for ${a.name}`} className="h-10 rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => updateAdminRole(a.id, e.target.value as AdminRole)} value={a.role}>{adminRoles.map((r) => (<option key={r} value={r}>{r}</option>))}</select></td><td className="py-4 pr-4"><span className={`rounded px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${a.status === "Active" ? "bg-sage/10 text-sage" : "bg-stone/10 text-stone"}`}>{a.status}</span></td><td className="py-4 pr-4 text-sm font-semibold text-stone">{a.lastSeen}</td><td className="py-4 pr-4"><button className="inline-flex h-10 items-center gap-2 rounded border border-stone/15 bg-white px-3 text-sm font-bold text-stone transition hover:border-sage hover:text-ink" onClick={() => toggleAdminStatus(a.id)} type="button">{a.status === "Active" ? <Ban size={16} /> : <Save size={16} />}{a.status === "Active" ? "Pause" : "Activer"}</button></td></tr>))}</tbody></table></div>
            </AdminPanel>
          )}

          {/* INVENTORY */}
          {tab === "inventory" && (
            <AdminPanel title="Gestion stock catalogue" icon={<Boxes size={20} />}>
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left"><thead><tr className="border-b border-stone/10 text-xs font-bold uppercase tracking-[0.14em] text-stone"><th className="py-3 pr-4">Produit</th><th className="py-3 pr-4">Categorie</th><th className="py-3 pr-4">Prix</th><th className="py-3 pr-4">Stock</th><th className="py-3 pr-4">Note</th><th className="py-3 pr-4">Action</th></tr></thead><tbody>{products.map((product) => (
                <tr className="border-b border-stone/10 last:border-0" key={product.id}>
                  <td className="py-4 pr-4"><div className="flex items-center gap-3"><span className="h-10 w-10 rounded border border-stone/10" style={{ background: product.swatch }} /><div><p className="font-bold text-ink">{product.name}</p><p className="text-sm text-stone">{product.line}</p></div></div></td>
                  <td className="py-4 pr-4"><select aria-label={`Change category for ${product.name}`} className="h-10 rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage" onChange={(e) => onProductCategory(product.id, e.target.value)} value={product.category}>{categories.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}</select></td>
                  <td className="py-4 pr-4"><label className="inline-flex h-10 items-center rounded border border-stone/15 bg-white"><input aria-label={`Price for ${product.name}`} className="h-full w-24 bg-transparent px-3 text-center text-sm font-bold text-ink outline-none focus:text-sage" max="9999" min="1" onBlur={() => commitPrice(product.id)} onChange={(e) => setPriceDrafts((c) => ({ ...c, [product.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitPrice(product.id); e.currentTarget.blur(); } }} required type="number" value={priceDrafts[product.id] ?? String(product.price)} /><span className="border-l border-stone/15 px-3 text-xs font-bold uppercase tracking-[0.1em] text-stone">DT</span></label></td>
                  <td className="py-4 pr-4"><div className="inline-flex items-center rounded border border-stone/15 bg-porcelain">
                    <button aria-label={`Decrease stock for ${product.name}`} className="grid h-10 w-10 place-items-center text-stone transition hover:text-ink disabled:cursor-not-allowed disabled:text-stone/35" disabled={product.stock <= 0} onClick={() => { const v = product.stock - 1; setStockDrafts((c) => ({ ...c, [product.id]: String(v) })); onStockChange(product.id, v); }} type="button"><Minus size={16} /></button>
                    <input aria-label={`Stock amount for ${product.name}`} className={`h-10 w-16 border-x border-stone/15 bg-white text-center text-sm font-bold outline-none focus:border-sage ${product.stock <= 8 ? "text-clay" : "text-sage"}`} max="99" min="0" onBlur={() => commitStock(product.id)} onChange={(e) => setStockDrafts((c) => ({ ...c, [product.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitStock(product.id); e.currentTarget.blur(); } }} type="number" value={stockDrafts[product.id] ?? String(product.stock)} />
                    <button aria-label={`Increase stock for ${product.name}`} className="grid h-10 w-10 place-items-center text-stone transition hover:text-ink" onClick={() => { const v = product.stock + 1; setStockDrafts((c) => ({ ...c, [product.id]: String(v) })); onStockChange(product.id, v); }} type="button"><Plus size={16} /></button>
                  </div></td>
                  <td className="py-4 pr-4 text-sm font-semibold text-stone">{product.rating.toFixed(1)}</td>
                  <td className="py-4 pr-4"><span className="inline-flex h-10 items-center gap-2 rounded border border-sage/20 bg-sage/10 px-3 text-sm font-bold text-sage"><Edit3 size={16} />Auto saved</span></td>
                </tr>
              ))}</tbody></table></div>
            </AdminPanel>
          )}
        </div>
      </div>
    </div></section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function AdminPanel({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (<section className="rounded border border-stone/10 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5 flex items-center gap-3 border-b border-stone/10 pb-4"><span className="grid h-10 w-10 place-items-center rounded bg-sage/10 text-sage">{icon}</span><h2 className="font-display text-3xl font-semibold leading-tight text-ink">{title}</h2></div>{children}</section>);
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cls: Record<OrderStatus, string> = { Pending: "bg-brass/15 text-brass", Confirmed: "bg-sage/10 text-sage", Preparing: "bg-clay/12 text-clay", Delivered: "bg-ink/10 text-ink", Cancelled: "bg-stone/10 text-stone" };
  const ico: Record<OrderStatus, ReactNode> = { Pending: <Clock size={14} />, Confirmed: <ShieldCheck size={14} />, Preparing: <Package size={14} />, Delivered: <Truck size={14} />, Cancelled: <Ban size={14} /> };
  return (<span className={`inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-bold uppercase tracking-[0.1em] ${cls[status]}`}>{ico[status]}{status}</span>);
}

function CartDrawer({ cartItems, cartOpen, cartTotal, onClose, onNavigate, onRemove, onUpdateQuantity }: {
  cartItems: Array<{ product: StoreProduct; quantity: number }>; cartOpen: boolean; cartTotal: number;
  onClose: () => void; onNavigate: (p: Page) => void; onRemove: (id: string) => void; onUpdateQuantity: (id: string, d: number) => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 transition ${cartOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button aria-label="Close cart" className={`absolute inset-0 bg-black/40 transition ${cartOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose} type="button" />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-stone/10 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Order bag</p><h2 className="font-display text-3xl font-semibold">Your selection</h2></div><button aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded border border-stone/15 text-stone hover:text-ink" onClick={onClose} type="button"><X size={18} /></button></div>
        <div className="flex-1 overflow-auto px-5 py-4">
          {cartItems.length === 0 ? (<div className="grid min-h-80 place-items-center rounded border border-dashed border-stone/20 bg-porcelain p-8 text-center"><div><ShoppingBag className="mx-auto text-stone" size={34} /><p className="mt-4 font-display text-3xl font-semibold">Empty bag</p><p className="mt-2 text-sm text-stone">Add perfumes from the catalogue to build an order.</p></div></div>) : (
            <div className="grid gap-4">{cartItems.map(({ product, quantity }) => (<div className="grid grid-cols-[70px_1fr] gap-4 rounded border border-stone/10 bg-porcelain p-3" key={product.id}><div className="h-20 rounded" style={{ background: product.swatch }} /><div><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-xl font-semibold">{product.name}</h3><p className="text-sm text-stone">{formatPrice(product.price)} each</p></div><button aria-label={`Remove ${product.name}`} className="grid h-8 w-8 place-items-center rounded text-stone hover:bg-white hover:text-clay" onClick={() => onRemove(product.id)} type="button"><Trash2 size={16} /></button></div><div className="mt-4 flex items-center justify-between"><div className="inline-flex items-center rounded border border-stone/15 bg-white"><button aria-label={`Decrease ${product.name}`} className="grid h-9 w-9 place-items-center text-stone hover:text-ink" onClick={() => onUpdateQuantity(product.id, -1)} type="button"><Minus size={16} /></button><span className="grid h-9 min-w-9 place-items-center text-sm font-bold">{quantity}</span><button aria-label={`Increase ${product.name}`} className="grid h-9 w-9 place-items-center text-stone hover:text-ink" onClick={() => onUpdateQuantity(product.id, 1)} type="button"><Plus size={16} /></button></div><p className="font-display text-2xl font-semibold">{formatPrice(product.price * quantity)}</p></div></div></div>))}</div>
          )}
        </div>
        <div className="border-t border-stone/10 p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm font-bold uppercase tracking-[0.14em] text-stone">Total</span><span className="font-display text-4xl font-semibold">{formatPrice(cartTotal)}</span></div><button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage disabled:cursor-not-allowed disabled:bg-stone/20 disabled:text-stone" disabled={cartItems.length === 0} onClick={() => { onClose(); onNavigate("contact"); }} type="button">Continue to request<ChevronRight size={18} /></button></div>
      </aside>
    </div>
  );
}

function PageHeading({ page }: { page: Page }) {
  return (<div><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">{page === "catalogue" && "Shop with controls"}{page === "story" && "Brand foundation"}{page === "services" && "Client experience"}{page === "contact" && "Direct ordering"}{page === "tracking" && "Order tracking"}{page === "admin" && "Administration"}{page === "home" && "Welcome"}</p><h1 className="mt-2 font-display text-5xl font-semibold leading-none text-ink sm:text-6xl">{pageTitles[page]}</h1></div>);
}

function SectionIntro({ copy, eyebrow, title }: { copy: string; eyebrow: string; title: string }) {
  return (<div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">{eyebrow}</p><h2 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">{title}</h2><p className="mt-4 text-sm leading-7 text-stone sm:text-base">{copy}</p></div>);
}

function Rating({ rating }: { rating: number }) {
  return (<div className="flex items-center gap-1 text-brass" aria-label={`${rating} stars`}>{Array.from({ length: 5 }).map((_, i) => (<Star fill={i + 1 <= Math.round(rating) ? "currentColor" : "none"} key={i} size={16} />))}<span className="ml-2 text-sm font-bold text-ink">{rating.toFixed(1)}</span></div>);
}

function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (<footer className="border-t border-stone/10 bg-ink px-5 py-12 text-white sm:px-8"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]"><div><p className="font-display text-3xl font-semibold">Serr El Oud</p><p className="mt-2 max-w-xl text-sm leading-7 text-white/65">Oriental perfume catalogue, private fragrance guidance, and direct order flow for Ariana, Tunis.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{reviews.map((r) => (<div className="border-l border-brass/40 pl-4" key={r.author}><p className="text-sm leading-6 text-white/75">{r.text}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-brass-light">{r.author}</p></div>))}</div></div><div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">{navigation.map((item) => (<button className="h-10 rounded border border-white/12 px-4 text-sm font-semibold text-white/75 transition hover:border-brass hover:text-brass-light" key={item.id} onClick={() => onNavigate(item.id)} type="button">{item.label}</button>))}</div></div></footer>);
}