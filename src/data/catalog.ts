export type ProductCategory = "Oud" | "Musk" | "Amber" | "Gift";

export type Product = {
  id: string;
  name: string;
  line: string;
  category: ProductCategory;
  price: number;
  volume: string;
  concentration: string;
  rating: number;
  stock: number;
  mood: string;
  notes: string[];
  description: string;
  tag?: string;
  swatch: string;
  imagePosition: string;
  imageUrl?: string;
};

export const productCategories: Array<ProductCategory | "All"> = [
  "All",
  "Oud",
  "Musk",
  "Amber",
  "Gift",
];

export const products: Product[] = [
  {
    id: "oud-mamlaka",
    name: "Oud Al-Mamlaka",
    line: "Royal oud extrait",
    category: "Oud",
    price: 280,
    volume: "50 ml",
    concentration: "Extrait",
    rating: 4.9,
    stock: 12,
    mood: "Deep, ceremonial, long lasting",
    notes: ["Cambodian oud", "saffron", "smoked amber"],
    description:
      "A polished oud with a warm saffron opening and a darker amber trail made for evenings and formal wear.",
    tag: "Best seller",
    swatch: "#8f5a2f",
    imagePosition: "78% 45%",
  },
  {
    id: "musk-sahara",
    name: "Musk El-Sahara",
    line: "Soft musk oil",
    category: "Musk",
    price: 195,
    volume: "30 ml",
    concentration: "Oil",
    rating: 4.7,
    stock: 18,
    mood: "Clean, soft, close to skin",
    notes: ["white musk", "Damask rose", "cotton flower"],
    description:
      "A clean musk layered with rose and airy florals. Easy to wear every day and beautiful for layering.",
    tag: "Daily wear",
    swatch: "#d7b5a6",
    imagePosition: "56% 42%",
  },
  {
    id: "amber-noor",
    name: "Amber Al-Noor",
    line: "Warm amber parfum",
    category: "Amber",
    price: 220,
    volume: "50 ml",
    concentration: "Parfum",
    rating: 4.8,
    stock: 9,
    mood: "Golden, resinous, comforting",
    notes: ["amber resin", "bourbon vanilla", "benzoin"],
    description:
      "A luminous amber blend with vanilla depth and a calm resin finish that feels rich without being heavy.",
    tag: "New",
    swatch: "#c69a39",
    imagePosition: "70% 50%",
  },
  {
    id: "sandal-riyadh",
    name: "Sandal Al-Riyadh",
    line: "Sandalwood attar",
    category: "Oud",
    price: 310,
    volume: "40 ml",
    concentration: "Attar",
    rating: 4.9,
    stock: 6,
    mood: "Velvet wood, incense, calm",
    notes: ["sandalwood", "frankincense", "black tea"],
    description:
      "Creamy sandalwood wrapped in incense and black tea. A meditative signature with excellent projection.",
    tag: "Limited",
    swatch: "#6f5548",
    imagePosition: "84% 58%",
  },
  {
    id: "misk-bakhra",
    name: "Misk Bakhra",
    line: "Incense musk blend",
    category: "Musk",
    price: 168,
    volume: "30 ml",
    concentration: "Oil",
    rating: 4.6,
    stock: 14,
    mood: "Powdered musk, incense, tender",
    notes: ["soft musk", "bakhour smoke", "iris"],
    description:
      "A gentle oil for people who love clean musk with a refined incense accent and a powdery drydown.",
    swatch: "#b98980",
    imagePosition: "88% 40%",
  },
  {
    id: "noir-souk",
    name: "Noir Souk",
    line: "Spiced amber extrait",
    category: "Amber",
    price: 245,
    volume: "50 ml",
    concentration: "Extrait",
    rating: 4.8,
    stock: 7,
    mood: "Spiced, smoky, magnetic",
    notes: ["black pepper", "labdanum", "date syrup"],
    description:
      "A late-night amber with spice, resin, and a dark sweetness inspired by Tunisian souks after sunset.",
    swatch: "#3f4f4a",
    imagePosition: "42% 48%",
  },
  {
    id: "jardin-medina",
    name: "Jardin Medina",
    line: "Floral musk eau de parfum",
    category: "Musk",
    price: 185,
    volume: "50 ml",
    concentration: "EDP",
    rating: 4.5,
    stock: 20,
    mood: "Fresh, floral, polished",
    notes: ["orange blossom", "white musk", "green fig"],
    description:
      "Fresh orange blossom and green fig over white musk. Bright, elegant, and effortless for daytime.",
    swatch: "#88a28f",
    imagePosition: "28% 38%",
  },
  {
    id: "majlis-set",
    name: "Majlis Discovery Set",
    line: "Five house signatures",
    category: "Gift",
    price: 145,
    volume: "5 x 5 ml",
    concentration: "Mixed",
    rating: 4.7,
    stock: 25,
    mood: "Curated, generous, gift ready",
    notes: ["oud", "musk", "amber"],
    description:
      "A refined sampler with five house favorites, packed for gifting or discovering a new personal scent.",
    tag: "Gift pick",
    swatch: "#7e5262",
    imagePosition: "64% 68%",
  },
];

export const storeStats = [
  { value: "28", label: "years of fragrance craft" },
  { value: "1.8k+", label: "local clients served" },
  { value: "42", label: "private blends archived" },
];

export const reviews = [
  {
    author: "Leila B.",
    text: "Oud Al-Mamlaka lasts the whole evening and still feels elegant the next morning.",
  },
  {
    author: "Youssef M.",
    text: "They helped me choose a gift set in ten minutes. The packaging felt premium.",
  },
  {
    author: "Nadia K.",
    text: "The musk oils are clean and never sharp. I came back for Jardin Medina.",
  },
];
