import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Header from "@/components/Header";
// Hidden until post-deployment. Needs smoother animation & email integration
// import ExitIntentPopup from "@/components/ExitIntentPopup";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Pet Clones | Custom Hand-Painted Pet Figures. San Antonio, TX",
  description:
    "Custom hand-painted pet clones starting at $150. Each one is painted by a single artist in San Antonio, TX. Your pet, actually painted to look like them.",
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
    "name": "My Pet Clones",
    "image": "https://mypetclones.com/images/replicas/_DSC3783.jpg",
    "description": "Custom hand-painted pet clones starting at $150. Each one painted by a single artist in San Antonio, TX.",
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
    "url": "https://mypetclones.com",
    "email": "mypetreplicas@gmail.com",
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
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased bg-[var(--color-dark-main)] text-[var(--color-neutral-100)] selection:bg-terra-500/30`}
      >
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {/* ── Header ── */}
            <Header />

            {/* ── Main ── */}
            <main className="flex-grow pt-24">{children}</main>

            {/* ── Footer ── */}
            <footer id="site-footer" className="py-16 md:py-20 bg-[var(--color-dark-card)]">
              <div className="max-w-6xl mx-auto px-6">
                {/* ── Main Footer Grid ── */}
                <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-8">
                  {/* Column 1: Brand & NAP */}
                  <div className="md:w-1/3">
                    <span className="font-display font-bold text-xl text-white">
                      MyPet<span className="text-terra-400">Clones</span>
                    </span>
                    <address className="not-italic mt-4 space-y-1.5 text-sm text-neutral-500 leading-relaxed">
                      <p>San Antonio, TX</p>
                      <p>
                        <a href="mailto:mypetreplicas@gmail.com" className="hover:text-neutral-300 transition-colors">
                          mypetreplicas@gmail.com
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
                          <div className="flex items-center gap-2 text-sm text-terra-500 font-medium">
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
                            I will never share the reference photos you provide. If I'd like to post your finished replica online, I will always ask for your permission first.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> {/* This closes the grid grid-cols-1 md:grid-cols-3 div */}

                {/* ── Bottom Bar ── */}
                <div className="mt-16 pt-8 border-t border-neutral-800/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
                  <p>
                    &copy; 2026 MyPetClones. All rights reserved.
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
