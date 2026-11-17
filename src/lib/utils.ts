export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatKesPrice(price: number) {
  return `KES ${new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)}`;
}

export function formatOrderPrice(price: number, currency: string) {
  return currency === "KES" ? formatKesPrice(price) : formatPrice(price);
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

export function waLink(number: string, text: string) {
  const digits = number.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function orderSummary(lines: Array<[string, string]>) {
  return lines.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");
}