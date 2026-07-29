const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  await prisma.user.create({
    data: { name: "Admin", email: "admin@kstyles.com", password: await bcrypt.hash("admin123", 10), role: "admin" },
  });

  // Create products
  const products = [
    { name: "Oversized Denim Jacket", slug: "oversized-denim-jacket", description: "Premium oversized denim jacket with gold-toned hardware. Crafted from heavyweight Japanese denim.", price: 289, category: "outerwear", sizes: "S,M,L,XL", colors: "Indigo,Black", featured: true, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80" },
    { name: "Signature Hoodie", slug: "signature-hoodie", description: "Heavyweight cotton hoodie with embroidered Kstyles logo. Fleece-lined for maximum comfort.", price: 149, category: "tops", sizes: "S,M,L,XL,XXL", colors: "Black,Cream,Olive", featured: true, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
    { name: "Cargo Pants", slug: "cargo-pants", description: "Modern cargo pants with a tailored fit. Features multiple pockets and adjustable cuffs.", price: 179, category: "bottoms", sizes: "28,30,32,34,36", colors: "Black,Khaki,Grey", featured: true, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80" },
    { name: "Leather Bomber Jacket", slug: "leather-bomber-jacket", description: "Genuine leather bomber jacket with satin lining. A timeless piece with a modern edge.", price: 459, category: "outerwear", sizes: "S,M,L,XL", colors: "Black,Brown", featured: true, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
    { name: "Graphic Tee", slug: "graphic-tee", description: "100% organic cotton tee with signature Kstyles graphic print. Pre-shrunk for lasting fit.", price: 69, category: "tops", sizes: "S,M,L,XL,XXL", colors: "Black,White", featured: false, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80" },
    { name: "Wide Leg Trousers", slug: "wide-leg-trousers", description: "Wide leg trousers in premium wool-blend fabric. Perfect for elevated streetwear looks.", price: 219, category: "bottoms", sizes: "28,30,32,34,36", colors: "Black,Navy,Charcoal", featured: false, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("Database seeded successfully!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());