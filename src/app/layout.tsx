import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
const inter = Inter({ subsets: ["latin"] });
export const metadata = {
  title: "Kstyles Worldwide — Luxury Streetwear",
  description: "Luxury streetwear for the modern icon. Shop premium apparel from Kstyles Worldwide.",
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce");
  if (!nonce) throw new Error("The request is missing its Content Security Policy nonce.");

  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white antialiased">
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `if ("serviceWorker" in navigator) { navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())); }` }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
