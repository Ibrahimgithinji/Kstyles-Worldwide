export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

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
