'use client';

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getImageFormats(src: string) {
    const isVendure = src.startsWith('http') && src.includes('format=');
    if (!isVendure) return { avif: null, webp: null, fallback: src };
    return {
        avif: src.replace(/format=\w+/, 'format=avif'),
        webp: src.replace(/format=\w+/, 'format=webp'),
        fallback: src.replace(/format=\w+/, 'format=jpg'),
    };
}

export function ProductGallery({ images, productName }: { images: string[]; productName: string }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const formats = getImageFormats(images[selectedIndex]);

    return (
        <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <picture>
                            {formats.avif && <source srcSet={formats.avif} type="image/avif" />}
                            {formats.webp && <source srcSet={formats.webp} type="image/webp" />}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={formats.fallback}
                                alt={`Custom hand-painted ${productName} replica`}
                                className="w-full h-full object-cover"
                            />
                        </picture>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
                <div className="flex gap-3">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            className={`w-20 h-20 rounded-xl overflow-hidden bg-neutral-900 transition-all duration-200 ${selectedIndex === i
                                ? 'ring-2 ring-terra-500 opacity-100'
                                : 'opacity-50 hover:opacity-80'
                                }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`${productName}. view ${i + 1} of ${images.length}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

export function ProductInfo({ children }: { children: ReactNode }) {
    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}

export function ProductFadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        >
            {children}
        </motion.div>
    );
}
