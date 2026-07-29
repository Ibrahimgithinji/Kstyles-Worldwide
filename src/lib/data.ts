export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Oversized Denim Jacket",
    slug: "oversized-denim-jacket",
    description: "Premium oversized denim jacket with gold-toned hardware. Crafted from heavyweight Japanese denim for durability and style.",
    price: 289,
    images: ["/images/product-1.jpg"],
    category: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Indigo", "Black"],
    featured: true,
    createdAt: "2025-12-01",
  },
  {
    id: "2",
    name: "Signature Hoodie",
    slug: "signature-hoodie",
    description: "Heavyweight cotton hoodie with embroidered Kstyles logo. Fleece-lined for maximum comfort.",
    price: 149,
    images: ["/images/product-2.jpg"],
    category: "tops",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Cream", "Olive"],
    featured: true,
    createdAt: "2025-11-15",
  },
  {
    id: "3",
    name: "Cargo Pants",
    slug: "cargo-pants",
    description: "Modern cargo pants with a tailored fit. Features multiple pockets and adjustable cuffs.",
    price: 179,
    images: ["/images/product-3.jpg"],
    category: "bottoms",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Khaki", "Grey"],
    featured: true,
    createdAt: "2025-11-20",
  },
  {
    id: "4",
    name: "Leather Bomber Jacket",
    slug: "leather-bomber-jacket",
    description: "Genuine leather bomber jacket with satin lining. A timeless piece with a modern edge.",
    price: 459,
    images: ["/images/product-4.jpg"],
    category: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    featured: true,
    createdAt: "2025-10-05",
  },
  {
    id: "5",
    name: "Graphic Tee",
    slug: "graphic-tee",
    description: "100% organic cotton tee with signature Kstyles graphic print. Pre-shrunk for lasting fit.",
    price: 69,
    images: ["/images/product-5.jpg"],
    category: "tops",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White"],
    featured: false,
    createdAt: "2025-12-10",
  },
  {
    id: "6",
    name: "Wide Leg Trousers",
    slug: "wide-leg-trousers",
    description: "Wide leg trousers in premium wool-blend fabric. Perfect for elevated streetwear looks.",
    price: 219,
    images: ["/images/product-6.jpg"],
    category: "bottoms",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Black", "Navy", "Charcoal"],
    featured: false,
    createdAt: "2025-11-01",
  },
];

export const collections: Collection[] = [
  {
    id: "1",
    name: "Fall/Winter 2025",
    description: "Embrace the cold with our latest drop. Heavy fabrics, dark tones, and bold silhouettes.",
    image: "/images/collection-1.jpg",
    slug: "fall-winter-2025",
  },
  {
    id: "2",
    name: "Gold Label",
    description: "Our premium line featuring exclusive pieces with gold detailing and limited runs.",
    image: "/images/collection-2.jpg",
    slug: "gold-label",
  },
  {
    id: "3",
    name: "Essentials",
    description: "Wardrobe staples reimagined. Elevated basics for everyday luxury.",
    image: "/images/collection-3.jpg",
    slug: "essentials",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Art of Layering: Winter Style Guide",
    slug: "art-of-layering-winter-style-guide",
    excerpt: "Master the art of layering with Kstyles' top picks for the cold season.",
    content: "Layering is not just about staying warm—it's about making a statement. Start with a lightweight base like our Graphic Tee, add a mid-layer such as the Signature Hoodie, and top it off with the Oversized Denim Jacket or Leather Bomber. The key is mixing textures and proportions while keeping a cohesive color palette.",
    image: "/images/blog-1.jpg",
    author: "Kstyles Team",
    date: "2025-12-20",
    tags: ["style-guide", "winter", "layering"],
  },
  {
    id: "2",
    title: "Behind the Design: Gold Label Collection",
    slug: "behind-the-design-gold-label-collection",
    excerpt: "An exclusive look at the inspiration and craftsmanship behind our Gold Label line.",
    content: "The Gold Label collection represents the pinnacle of Kstyles craftsmanship. Each piece undergoes a meticulous design process, from sketching to prototyping. We source premium materials from around the world—Italian leather, Japanese denim, and Egyptian cotton—to ensure unparalleled quality.",
    image: "/images/blog-2.jpg",
    author: "Kstyles Team",
    date: "2025-11-30",
    tags: ["behind-the-scenes", "gold-label", "craftsmanship"],
  },
  {
    id: "3",
    title: "How to Style Cargo Pants for Any Occasion",
    slug: "how-to-style-cargo-pants",
    excerpt: "From casual to dressed-up, here's how to make cargo pants work for you.",
    content: "Cargo pants have made a major comeback. For a casual look, pair our Cargo Pants with the Signature Hoodie and clean sneakers. To dress them up, swap the hoodie for a fitted turtleneck and add the Leather Bomber Jacket. The versatility of cargo pants makes them a must-have in any wardrobe.",
    image: "/images/blog-3.jpg",
    author: "Kstyles Team",
    date: "2025-11-15",
    tags: ["style-guide", "cargo-pants", "styling"],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Marcus J.",
    role: "Verified Buyer",
    avatar: "",
    content: "The quality of the denim jacket is unmatched. You can feel the weight and craftsmanship the moment you put it on.",
    rating: 5,
  },
  {
    id: "2",
    name: "Sarah K.",
    role: "Verified Buyer",
    avatar: "",
    content: "I've been searching for the perfect hoodie for years. Kstyles delivers on fit, feel, and style.",
    rating: 5,
  },
  {
    id: "3",
    name: "David L.",
    role: "Verified Buyer",
    avatar: "",
    content: "The Gold Label collection is on another level. Worth every penny. My go-to for statement pieces.",
    rating: 5,
  },
  {
    id: "4",
    name: "Amara T.",
    role: "Verified Buyer",
    avatar: "",
    content: "Fast shipping, amazing quality, and the customer service team went above and beyond. Lifelong customer.",
    rating: 5,
  },
];