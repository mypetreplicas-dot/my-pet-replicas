'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { queryVendure, GET_PRODUCT_BY_SLUG_QUERY, getProxiedAssetUrl, type GetProductBySlugResponse } from '@/lib/vendure';

export default function CartDrawer() {
    const { order, isOpen, isLoading, closeCart, addToCart, updateQuantity, removeFromCart } = useCart();
    const [isAddingRush, setIsAddingRush] = useState(false);

    const total = order ? (order.subTotal / 100).toFixed(2) : '0.00';
    const allLines = order?.lines || [];

    // Separate rush order lines from regular product lines
    const productLines = allLines.filter((line) => line.productVariant.product.slug !== 'rush-order');
    const rushLine = allLines.find((line) => line.productVariant.product.slug === 'rush-order');
    const rushTotal = rushLine ? rushLine.linePrice : 0;
    const rushUnitPrice = rushLine ? (rushLine.productVariant.price || 0) : 0;

    // Auto-sync rush order quantity whenever product line count changes
    const syncingRush = useRef(false);
    useEffect(() => {
        if (!rushLine || syncingRush.current || isLoading) return;
        if (rushLine.quantity === productLines.length && productLines.length > 0) return;
        syncingRush.current = true;
        (async () => {
            try {
                if (productLines.length > 0) {
                    await updateQuantity(rushLine.id, productLines.length);
                } else {
                    await removeFromCart(rushLine.id);
                }
            } catch (e) {
                console.error('Failed to sync rush quantity:', e);
            } finally {
                syncingRush.current = false;
            }
        })();
    }, [productLines.length, rushLine, isLoading, updateQuantity, removeFromCart]);

    const handleToggleRush = async () => {
        setIsAddingRush(true);
        try {
            if (rushLine) {
                // Remove rush order
                await removeFromCart(rushLine.id);
            } else {
                // Add rush order with quantity = number of figures
                const rushData = await queryVendure<GetProductBySlugResponse>(GET_PRODUCT_BY_SLUG_QUERY, { slug: 'rush-order' });
                const rushVariantId = rushData.product?.variants[0]?.id;
                if (!rushVariantId) return;
                await addToCart(rushVariantId, productLines.length);
            }
        } catch (e) {
            console.error('Failed to toggle rush order:', e);
        } finally {
            setIsAddingRush(false);
        }
    };

    return (
        <div className={`${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} {...(!isOpen ? { inert: true } : {})}>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/70 transition-all duration-300 ${isOpen ? 'z-50 opacity-100' : '-z-10 opacity-0 invisible'}`}
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-dark-card)] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'z-50 translate-x-0' : '-z-10 translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5">
                    <h2 className="font-display text-lg font-bold text-white">
                        Your Cart
                        {order && order.totalQuantity > 0 && (
                            <span className="ml-2 text-sm font-normal text-neutral-500">
                                ({order.totalQuantity} {order.totalQuantity === 1 ? 'item' : 'items'})
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 text-neutral-500 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="h-px bg-neutral-800/50" />

                {/* Cart Items (product lines only. no rush orders here) */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {allLines.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-20 h-20 rounded-full bg-neutral-800/80 flex items-center justify-center mb-6">
                                <span className="text-4xl">🐾</span>
                            </div>
                            <p className="text-neutral-400 text-base font-medium mb-2">Your cart is empty</p>
                            <p className="text-neutral-500 text-sm mb-8 max-w-[240px]">
                                Commission a hand-painted clone of your best friend.
                            </p>
                            <Link
                                href="/product/custom-pet-replica"
                                onClick={closeCart}
                                className="px-6 py-3 min-h-[48px] bg-terra-600 hover:bg-terra-500 text-white text-sm font-semibold rounded-full transition-all shadow-[0_0_24px_rgba(212,112,62,0.25)] hover:shadow-[0_0_32px_rgba(212,112,62,0.4)] flex items-center justify-center"
                            >
                                Start Customizing Your Clone
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {productLines.map((line) => {
                                const instructions = line.customFields?.specialInstructions || '';
                                const photos = line.customFields?.petPhotos;
                                const nameMatch = instructions.match(/\[Pet name: (.+?)\]/);
                                const petName = nameMatch ? nameMatch[1] : null;
                                const discountMatch = instructions.match(/\[Multi-pet (\d+)% off\]/);
                                const price = (line.linePrice / 100).toFixed(2);

                                // Resolve the starred reference photo thumbnail
                                let thumbnailSrc: string;
                                if (photos && photos.length > 0) {
                                    // First try to match by asset ID (reliable, order-independent)
                                    const assetMatch = instructions.match(/\[Reference asset: (\S+)\]/);
                                    const starred = assetMatch ? photos.find((p) => p.id === assetMatch[1]) : null;
                                    if (starred) {
                                        thumbnailSrc = getProxiedAssetUrl(starred.preview);
                                    } else {
                                        // Fallback: match by photo index (for older orders)
                                        const poseMatch = instructions.match(/\[(?:Reference photo|Preferred pose): Photo (\d+)\]/);
                                        const poseIndex = poseMatch ? parseInt(poseMatch[1], 10) - 1 : 0;
                                        const photo = photos[poseIndex] || photos[0];
                                        thumbnailSrc = getProxiedAssetUrl(photo.preview);
                                    }
                                } else {
                                    thumbnailSrc = line.productVariant.product.featuredAsset?.preview
                                        ? getProxiedAssetUrl(line.productVariant.product.featuredAsset.preview)
                                        : '/images/replicas/_DSC3783.jpg';
                                }

                                return (
                                    <div key={line.id} className="flex gap-4">
                                        {/* Thumbnail — customer's starred reference photo */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-800 shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={thumbnailSrc}
                                                alt={line.productVariant.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/product/${line.productVariant.product.slug}`}
                                                className="text-sm font-medium text-white hover:text-terra-300 transition-colors line-clamp-1"
                                                onClick={closeCart}
                                            >
                                                {petName ? `${petName}'s Clone` : line.productVariant.product.name}
                                            </Link>
                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                {line.productVariant.name}
                                            </p>

                                            {/* Price with multi-pet discount indicator */}
                                            {discountMatch ? (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-sm font-medium text-terra-400">${price}</p>
                                                    <span className="text-xs font-semibold text-terra-400 bg-terra-500/10 px-2 py-0.5 rounded-full">
                                                        {discountMatch[1]}% OFF
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-neutral-300 mt-1">${price}</p>
                                            )}

                                            {/* Remove button */}
                                            <div className="flex items-center mt-2">
                                                <button
                                                    onClick={() => removeFromCart(line.id)}
                                                    disabled={isLoading}
                                                    className="text-xs text-neutral-600 hover:text-red-400 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {allLines.length > 0 && (
                    <div className="px-6 py-6 bg-[var(--color-dark-elevated)]">
                        {/* Rush order toggle */}
                        {productLines.length > 0 && (
                            <button
                                onClick={handleToggleRush}
                                disabled={isAddingRush || isLoading}
                                className={`w-full mb-4 flex items-center gap-3 py-3 px-4 rounded-lg transition-all text-left disabled:opacity-50 ${rushLine
                                    ? 'bg-terra-500/10 border border-terra-500/30'
                                    : 'border border-terra-500/20 hover:bg-terra-500/10'
                                    }`}
                            >
                                <svg className="w-4 h-4 text-terra-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <div className="flex-grow">
                                    <span className="text-xs font-medium text-terra-400">
                                        {isAddingRush ? (rushLine ? 'Removing...' : 'Adding...') : rushLine ? 'Rush Order Added' : 'Add Rush Order'}
                                    </span>
                                    <p className="text-[10px] text-neutral-500 mt-0.5">
                                        {rushUnitPrice > 0 ? `+$${(rushUnitPrice / 100).toFixed(2)}/figure · ` : ''}Priority queue &middot; Ships faster
                                    </p>
                                </div>
                                {rushLine && (
                                    <span className="text-xs font-semibold text-terra-400 flex-shrink-0">
                                        +${(rushTotal / 100).toFixed(2)}
                                    </span>
                                )}
                            </button>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm text-neutral-500">Subtotal</span>
                            <span className="text-lg font-display font-bold text-white">${total}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="block w-full py-4 text-center bg-terra-600 hover:bg-terra-500 text-white text-base font-semibold rounded-full transition-all shadow-[0_0_32px_rgba(212,112,62,0.25)] hover:shadow-[0_0_48px_rgba(212,112,62,0.4)]"
                        >
                            Proceed to Checkout
                        </Link>
                        <button
                            onClick={closeCart}
                            className="block w-full mt-3 text-center text-sm text-neutral-500 hover:text-white transition-colors py-2"
                        >
                            Keep Browsing
                        </button>
                        <button
                            onClick={async () => {
                                for (const line of allLines) {
                                    await removeFromCart(line.id);
                                }
                            }}
                            disabled={isLoading}
                            className="block w-full mt-1 text-center text-xs text-neutral-600 hover:text-red-400 transition-colors py-2 disabled:opacity-50"
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
