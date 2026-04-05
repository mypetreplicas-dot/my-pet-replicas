import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Cherished Mementos | Custom Hand-Painted Pet Figurines. San Antonio, TX",
  description:
    "Custom hand-painted pet figurines starting at $150. Each one handcrafted in San Antonio, TX to capture your pet's exact markings and expression. Delivered in 5–7 business days.",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Cherished Mementos",
    "image": "https://cherishedmementos.com/images/replicas/_DSC3783.jpg",
    "description": "Custom hand-painted pet figurines starting at $150. Handcrafted by our two-person team in San Antonio, TX to capture every detail of your pet.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Antonio",
      "addressRegion": "TX",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.4241,
      "longitude": -98.4936
    },
    "url": "https://cherishedmementos.com",
    "email": "cherishedpetsSA@outlook.com",
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "127"
    },
    "openingHours": "Mo-Fr 09:00-18:00"
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`antialiased bg-[var(--color-surface-main)] text-[var(--color-text-primary)] selection:bg-[var(--color-primary)]/30`}
      >
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {/* ── Header ── */}
            <Header />

            {/* ── Main ── */}
            <main className="flex-grow pt-24">{children}</main>

            {/* ── Footer ── */}
            <footer id="site-footer" className="py-10 md:py-12 bg-[var(--color-surface-card)]">
              <div className="max-w-6xl mx-auto px-6">
                {/* ── Main Footer Grid ── */}
                <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
                  {/* Column 1: Brand & NAP */}
                  <div className="md:w-1/3">
                    <div className="flex flex-col">
                      <span className="font-display text-[28px] text-[#FF585D] leading-none uppercase">Cherished</span>
                      <span className="font-sans font-black text-[var(--color-text-primary)] text-[13px] tracking-[0.2em] leading-tight">MEMENTOS</span>
                    </div>
                    <address className="not-italic mt-4 space-y-1.5 text-sm text-neutral-500 leading-relaxed">
                      <p>San Antonio, TX</p>
                      <p>
                        <a href="mailto:cherishedpetsSA@outlook.com" className="hover:text-[var(--color-primary)] transition-colors">
                          cherishedpetsSA@outlook.com
                        </a>
                      </p>
                    </address>
                  </div>

                  {/* Column 3: Trust & Privacy */}
                  <div className="md:w-1/2 md:flex md:justify-end">
                    <div className="max-w-md">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-5">
                        Trust & Privacy
                      </h4>
                      <ul className="space-y-4">
                        <li>
                          <div className="flex items-center gap-2 text-sm text-[var(--color-gold)] font-medium">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                          </div>
                          <span className="text-xs text-neutral-400 mt-1 block">5-Star Rated Custom Artist on Etsy</span>
                        </li>
                        <li>
                          <span className="text-sm text-neutral-500 leading-relaxed block">
                            I will never share the reference photos you provide. If I'd like to post your finished clone online, I will always ask for your permission first.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> {/* This closes the grid grid-cols-1 md:grid-cols-3 div */}

                {/* ── Bottom Bar ── */}
                <div className="mt-8 pt-6 border-t border-neutral-800/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
                  <p>
                    &copy; 2026 Cherished Mementos. All rights reserved.
                  </p>
                  <p>Hand-painted in San Antonio, TX</p>
                </div>
              </div>
            </footer>
          </div>

          {/* Cart Drawer (Exit Intent popup hidden until post-deployment) */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
