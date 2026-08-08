import { FormEvent, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Clock,
  Gift,
  Heart,
  Leaf,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Product,
  ProductCategory,
  productCategories,
  products,
  reviews,
  storeStats,
} from "./data/catalog";

type Page = "home" | "catalogue" | "story" | "services" | "contact";
type SortKey = "featured" | "price-low" | "price-high" | "rating";
type Cart = Record<string, number>;

const navigation: Array<{ id: Page; label: string }> = [
  { id: "home", label: "Home" },
  { id: "catalogue", label: "Catalogue" },
  { id: "story", label: "Story" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
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
};

const formatPrice = (price: number) => `${price} DT`;

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [cart, setCart] = useState<Cart>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [maxPrice, setMaxPrice] = useState(320);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState(
    "I would like a fragrance recommendation."
  );
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? products[0];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice = product.price <= maxPrice;
      const matchesStock = !inStockOnly || product.stock > 0;
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

      return (
        matchesCategory &&
        matchesPrice &&
        matchesStock &&
        searchable.includes(normalizedQuery)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return products.findIndex((item) => item.id === a.id) -
        products.findIndex((item) => item.id === b.id);
    });
  }, [category, inStockOnly, maxPrice, query, sort]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => {
          const product = products.find((item) => item.id === id);
          return product ? { product, quantity } : null;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number }>,
    [cart]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const contactReady = contactName.trim().length > 1 && contactPhone.trim().length > 5;

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(productId: string) {
    setCart((current) => ({
      ...current,
      [productId]: Math.min((current[productId] ?? 0) + 1, 9),
    }));
    setCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) + delta;
      if (nextQuantity <= 0) {
        const next = { ...current };
        delete next[productId];
        return next;
      }

      return { ...current, [productId]: Math.min(nextQuantity, 9) };
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <Header
        cartCount={cartCount}
        currentPage={page}
        mobileOpen={mobileOpen}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMobileOpen((open) => !open)}
        onNavigate={navigate}
      />

      <main>
        {page === "home" && (
          <HomePage
            onAddToCart={addToCart}
            onNavigate={navigate}
            onSelectProduct={setSelectedProductId}
          />
        )}
        {page === "catalogue" && (
          <CataloguePage
            category={category}
            filteredProducts={filteredProducts}
            inStockOnly={inStockOnly}
            maxPrice={maxPrice}
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
            contactMessage={contactMessage}
            contactName={contactName}
            contactPhone={contactPhone}
            contactReady={contactReady}
            submitted={submitted}
            onContactMessage={setContactMessage}
            onContactName={setContactName}
            onContactPhone={setContactPhone}
            onSubmit={submitContact}
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
  onNavigate: (page: Page) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone/10 bg-ivory/92 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <button
          className="group flex items-center gap-3 text-left"
          onClick={() => onNavigate("home")}
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded border border-brass/35 bg-porcelain text-brass shadow-sm">
            <Sparkles size={18} />
          </span>
          <span>
            <span className="block font-display text-xl font-semibold tracking-wide text-ink">
              Serr El Oud
            </span>
            <span className="block text-[11px] uppercase tracking-[0.18em] text-stone">
              Parfumerie orientale
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded border border-stone/10 bg-white/70 p-1 shadow-sm md:flex">
          {navigation.map((item) => (
            <button
              className={`h-10 rounded px-4 text-sm font-medium transition ${
                currentPage === item.id
                  ? "bg-ink text-white"
                  : "text-stone hover:bg-porcelain hover:text-ink"
              }`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Open cart"
            className="relative grid h-11 w-11 place-items-center rounded border border-stone/15 bg-white text-ink shadow-sm transition hover:border-brass/60"
            onClick={onCart}
            type="button"
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-sage px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded border border-stone/15 bg-white text-ink shadow-sm md:hidden"
            onClick={onMenu}
            type="button"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone/10 bg-ivory px-5 py-4 md:hidden">
          <div className="grid gap-2">
            {navigation.map((item) => (
              <button
                className={`rounded px-4 py-3 text-left text-sm font-medium ${
                  currentPage === item.id
                    ? "bg-ink text-white"
                    : "bg-white text-stone"
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

function HomePage({
  onAddToCart,
  onNavigate,
  onSelectProduct,
}: {
  onAddToCart: (productId: string) => void;
  onNavigate: (page: Page) => void;
  onSelectProduct: (productId: string) => void;
}) {
  const featuredProducts = products.slice(0, 4);

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
            <div className="mb-6 inline-flex items-center gap-2 rounded border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-brass-light backdrop-blur">
              <BadgeCheck size={15} />
              Boutique fragrance house in Tunis
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[0.95] text-white sm:text-7xl lg:text-8xl">
              Serr El Oud
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/78 sm:text-lg">
              A refined oriental perfume shop with oud, musk, amber, incense
              oils, and curated gift sets. Built for quick discovery, clear
              orders, and a premium first impression.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button
                className="inline-flex h-12 items-center gap-2 rounded bg-brass px-5 text-sm font-bold text-ink shadow-xl shadow-black/20 transition hover:bg-brass-light"
                onClick={() => onNavigate("catalogue")}
                type="button"
              >
                Shop catalogue
                <ChevronRight size={18} />
              </button>
              <button
                className="inline-flex h-12 items-center gap-2 rounded border border-white/25 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/18"
                onClick={() => onNavigate("services")}
                type="button"
              >
                Private blending
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
          <div className="mt-14 grid max-w-3xl gap-3 sm:grid-cols-3">
            {storeStats.map((stat) => (
              <div
                className="border-l border-white/20 bg-black/20 px-4 py-3 backdrop-blur"
                key={stat.label}
              >
                <p className="font-display text-3xl font-semibold text-brass-light">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/62">
                  {stat.label}
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
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onSelect={() => {
                onSelectProduct(product.id);
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
              <div className="rounded border border-stone/10 bg-white p-5 shadow-sm" key={item.title}>
                <div className="mb-4 grid h-10 w-10 place-items-center rounded bg-sage/10 text-sage">
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

function CataloguePage({
  category,
  filteredProducts,
  inStockOnly,
  maxPrice,
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
  category: ProductCategory | "All";
  filteredProducts: Product[];
  inStockOnly: boolean;
  maxPrice: number;
  query: string;
  selectedProduct: Product;
  sort: SortKey;
  onAddToCart: (productId: string) => void;
  onCategory: (category: ProductCategory | "All") => void;
  onInStockOnly: (checked: boolean) => void;
  onMaxPrice: (price: number) => void;
  onQuery: (query: string) => void;
  onSelectProduct: (productId: string) => void;
  onSort: (sort: SortKey) => void;
}) {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="catalogue" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="self-start rounded border border-stone/10 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-sage" size={19} />
              <h2 className="font-display text-2xl font-semibold">Controls</h2>
            </div>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Search
              </span>
              <span className="mt-2 flex h-11 items-center gap-2 rounded border border-stone/15 bg-porcelain px-3 focus-within:border-sage">
                <Search size={18} className="text-stone" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-stone/60"
                  onChange={(event) => onQuery(event.target.value)}
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
                {productCategories.map((item) => (
                  <button
                    className={`h-10 rounded border px-3 text-sm font-semibold transition ${
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
                max="320"
                min="140"
                onChange={(event) => onMaxPrice(Number(event.target.value))}
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
                className="mt-2 h-11 w-full rounded border border-stone/15 bg-porcelain px-3 text-sm font-semibold outline-none focus:border-sage"
                onChange={(event) => onSort(event.target.value as SortKey)}
                value={sort}
              >
                {(Object.keys(sortLabels) as SortKey[]).map((item) => (
                  <option key={item} value={item}>
                    {sortLabels[item]}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 flex cursor-pointer items-center justify-between rounded border border-stone/10 bg-porcelain px-4 py-3">
              <span className="text-sm font-semibold">In stock only</span>
              <input
                checked={inStockOnly}
                className="h-5 w-5 accent-sage"
                onChange={(event) => onInStockOnly(event.target.checked)}
                type="checkbox"
              />
            </label>
          </aside>

          <div className="grid gap-6">
            <ProductDetail product={selectedProduct} onAddToCart={onAddToCart} />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-stone">
                  {filteredProducts.length} product
                  {filteredProducts.length === 1 ? "" : "s"} found
                </p>
                <h2 className="font-display text-3xl font-semibold text-ink">
                  Browse collection
                </h2>
              </div>
              <button
                className="hidden h-11 rounded border border-stone/15 bg-white px-4 text-sm font-semibold text-stone transition hover:border-sage hover:text-ink sm:inline-flex sm:items-center"
                onClick={() => {
                  onQuery("");
                  onCategory("All");
                  onMaxPrice(320);
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
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedProduct.id === product.id}
                    onAddToCart={onAddToCart}
                    onSelect={() => onSelectProduct(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded border border-stone/10 bg-white p-8 text-center shadow-sm">
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

function ProductDetail({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (productId: string) => void;
}) {
  return (
    <article className="grid overflow-hidden rounded border border-stone/10 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-72 bg-ink">
        <img
          alt={`${product.name} perfume display`}
          className="absolute inset-0 h-full w-full object-cover"
          src="/hero.jpg"
          style={{ objectPosition: product.imagePosition }}
        />
        <div
          className="absolute inset-0 opacity-75"
          style={{
            background: `linear-gradient(135deg, ${product.swatch}CC, rgba(18,15,12,.25))`,
          }}
        />
        <div className="absolute bottom-5 left-5 right-5">
          <p className="mb-2 inline-flex rounded bg-white/92 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-ink">
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
          <span className="rounded bg-sage/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-sage">
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
          {product.notes.map((note) => (
            <span
              className="rounded border border-stone/10 bg-porcelain px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-stone"
              key={note}
            >
              {note}
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
            className="inline-flex h-12 items-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage"
            onClick={() => onAddToCart(product.id)}
            type="button"
          >
            <ShoppingBag size={18} />
            Add to order
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
  product: Product;
  selected?: boolean;
  onAddToCart: (productId: string) => void;
  onSelect: () => void;
}) {
  return (
    <article
      className={`group overflow-hidden rounded border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
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
          src="/hero.jpg"
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded border border-stone/10 text-stone transition hover:border-sage hover:text-sage"
            type="button"
          >
            <Heart size={17} />
          </button>
        </div>
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone">
          {product.mood}
        </p>
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
            className="grid h-11 w-11 place-items-center rounded bg-ink text-white transition hover:bg-sage"
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

function StoryPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="story" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded border border-stone/10 bg-white shadow-sm">
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
              <div className="rounded border border-stone/10 bg-white p-6 shadow-sm" key={item.title}>
                <h2 className="font-display text-3xl font-semibold text-ink">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-stone">{item.copy}</p>
              </div>
            ))}
            <button
              className="inline-flex h-12 w-fit items-center gap-2 rounded bg-ink px-5 text-sm font-bold text-white transition hover:bg-sage"
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

function ServicesPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
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
          {services.map((service) => (
            <div className="rounded border border-stone/10 bg-white p-6 shadow-sm" key={service.title}>
              <div className="grid h-12 w-12 place-items-center rounded bg-clay/12 text-clay">
                {service.icon}
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold leading-tight">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-stone">{service.copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded border border-stone/10 bg-ink p-6 text-white shadow-sm lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
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
            className="inline-flex h-12 items-center justify-center gap-2 rounded bg-brass px-5 text-sm font-bold text-ink transition hover:bg-brass-light"
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

function ContactPage({
  contactMessage,
  contactName,
  contactPhone,
  contactReady,
  submitted,
  onContactMessage,
  onContactName,
  onContactPhone,
  onSubmit,
}: {
  contactMessage: string;
  contactName: string;
  contactPhone: string;
  contactReady: boolean;
  submitted: boolean;
  onContactMessage: (message: string) => void;
  onContactName: (name: string) => void;
  onContactPhone: (phone: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const whatsappMessage = encodeURIComponent(
    `Hello Serr El Oud, my name is ${contactName || "[name]"}. ${contactMessage}`
  );

  return (
    <section className="px-5 py-12 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <PageHeading page="contact" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            {[
              {
                icon: <MapPin size={21} />,
                title: "Boutique",
                copy: "V579+M43, Ariana, Tunis",
              },
              {
                icon: <Clock size={21} />,
                title: "Hours",
                copy: "Monday to Saturday, 9:00 to 20:00",
              },
              {
                icon: <Phone size={21} />,
                title: "Phone",
                copy: "+216 20 200 888",
              },
              {
                icon: <Mail size={21} />,
                title: "Orders",
                copy: "Fast requests by WhatsApp or the form.",
              },
            ].map((item) => (
              <div className="flex gap-4 rounded border border-stone/10 bg-white p-5 shadow-sm" key={item.title}>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded bg-sage/10 text-sage">
                  {item.icon}
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-stone">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="rounded border border-stone/10 bg-white p-6 shadow-sm sm:p-8"
            onSubmit={onSubmit}
          >
            <h2 className="font-display text-4xl font-semibold text-ink">
              Order request
            </h2>
            <p className="mt-2 text-sm leading-7 text-stone">
              The button becomes ready when your name and phone are filled in.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                  Name
                </span>
                <input
                  className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage"
                  onChange={(event) => {
                    onContactName(event.target.value);
                  }}
                  placeholder="Your name"
                  value={contactName}
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                  Phone
                </span>
                <input
                  className="mt-2 h-12 w-full rounded border border-stone/15 bg-porcelain px-4 text-sm outline-none transition focus:border-sage"
                  onChange={(event) => {
                    onContactPhone(event.target.value);
                  }}
                  placeholder="+216 ..."
                  value={contactPhone}
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone">
                Message
              </span>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded border border-stone/15 bg-porcelain p-4 text-sm leading-6 outline-none transition focus:border-sage"
                onChange={(event) => onContactMessage(event.target.value)}
                value={contactMessage}
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                className={`inline-flex h-12 items-center gap-2 rounded px-5 text-sm font-bold transition ${
                  contactReady
                    ? "bg-ink text-white hover:bg-sage"
                    : "cursor-not-allowed bg-stone/15 text-stone"
                }`}
                disabled={!contactReady}
                type="submit"
              >
                <Send size={18} />
                Submit request
              </button>
              <a
                className="inline-flex h-12 items-center gap-2 rounded border border-sage/30 bg-sage/10 px-5 text-sm font-bold text-sage transition hover:border-sage"
                href={`https://wa.me/21620200888?text=${whatsappMessage}`}
              >
                <Phone size={18} />
                WhatsApp
              </a>
            </div>

            {submitted && (
              <p className="mt-5 rounded border border-sage/25 bg-sage/10 px-4 py-3 text-sm font-semibold text-sage">
                Request ready. The shop can use this information to reply with
                a fragrance recommendation.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
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
  cartItems: Array<{ product: Product; quantity: number }>;
  cartOpen: boolean;
  cartTotal: number;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        cartOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/40 transition ${
          cartOpen ? "opacity-100" : "opacity-0"
        }`}
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
                <p className="mt-4 font-display text-3xl font-semibold">
                  Empty bag
                </p>
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
                  <div
                    className="h-20 rounded"
                    style={{ background: product.swatch }}
                  />
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-semibold">
                          {product.name}
                        </h3>
                        <p className="text-sm text-stone">
                          {formatPrice(product.price)} each
                        </p>
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
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          fill={index + 1 <= Math.round(rating) ? "currentColor" : "none"}
          key={index}
          size={16}
        />
      ))}
      <span className="ml-2 text-sm font-bold text-ink">{rating.toFixed(1)}</span>
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="border-t border-stone/10 bg-ink px-5 py-12 text-white sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-display text-3xl font-semibold">Serr El Oud</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">
            Oriental perfume catalogue, private fragrance guidance, and direct
            order flow for Ariana, Tunis.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {reviews.map((review) => (
              <div className="border-l border-brass/40 pl-4" key={review.author}>
                <p className="text-sm leading-6 text-white/75">{review.text}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-brass-light">
                  {review.author}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
          {navigation.map((item) => (
            <button
              className="h-10 rounded border border-white/12 px-4 text-sm font-semibold text-white/75 transition hover:border-brass hover:text-brass-light"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
