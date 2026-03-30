'use client';

import Link from 'next/link';
import { useState } from 'react';
import CartButton from '@/components/CartButton';

export default function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full z-50 bg-[var(--color-dark-main)] shadow-[0_2px_4px_hsla(0,0%,0%,0.2),_0_8px_16px_hsla(0,0%,0%,0.4)]">
            <div className="max-w-[1200px] mx-auto px-6 h-[88px] flex items-center justify-between">

                {/* Left: Logo (Serif font-display) */}
                <Link
                    href="/"
                    className="flex items-center min-h-[44px] min-w-[44px] z-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <span className="font-display font-bold text-2xl tracking-tight text-white">
                        MyPet<span className="text-terra-400">Clones</span>
                    </span>
                </Link>

                {/* Right: CTA, Cart, Hamburger */}
                <div className="flex items-center gap-1 md:gap-4 z-50">
                    <div className="hidden md:block">
                        <Link
                            href="/product/custom-pet-replica"
                            className="px-6 py-3 min-h-[44px] bg-terra-600 hover:bg-terra-500 text-white text-[16px] font-semibold rounded-full transition-all shadow-[0_2px_8px_hsla(22,74%,54%,0.25)] flex items-center justify-center"
                        >
                            Create My Clone
                        </Link>
                    </div>

                    <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                        <CartButton />
                    </div>

                    {/* Hamburger Menu Toggle (Mobile Only) */}
                    <button
                        className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] text-neutral-400 hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-[88px] left-0 w-full h-screen bg-[var(--color-dark-main)] z-40 md:hidden flex flex-col p-6 shadow-inner">
                    <Link
                        href="/product/custom-pet-replica"
                        className="w-full px-6 py-4 min-h-[44px] bg-terra-600 hover:bg-terra-500 text-white text-[18px] font-semibold rounded-full transition-colors flex items-center justify-center shadow-[0_4px_12px_hsla(22,74%,54%,0.3)]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Create My Clone
                    </Link>
                </div>
            )}
        </header>
    );
}
