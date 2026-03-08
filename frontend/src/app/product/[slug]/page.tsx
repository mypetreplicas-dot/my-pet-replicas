import { notFound } from 'next/navigation';
import { queryVendure, GET_PRODUCT_BY_SLUG_QUERY, GetProductBySlugResponse, getEnabledVariants, getProxiedAssetUrl } from '@/lib/vendure';
import ProductConfigurator from '@/components/ProductConfigurator';
import { ProductGallery, ProductInfo, ProductFadeUp } from '@/components/ProductPageClient';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const data = await queryVendure<GetProductBySlugResponse>(GET_PRODUCT_BY_SLUG_QUERY, { slug });

    if (!data.product) {
        return { title: 'Product Not Found' };
    }

    const desc = data.product.description?.replace(/<[^>]*>/g, '').trim().slice(0, 160)
        || 'Custom hand-painted pet replica made in San Antonio, TX. Upload photos and receive a one-of-a-kind keepsake.';

    return {
        title: `Custom Hand-Painted ${data.product.name}. San Antonio, TX | My Pet Replicas`,
        description: desc,
        keywords: [
            'custom pet replica', 'hand-painted pet figurine', 'pet memorial San Antonio',
            'custom dog replica', 'custom cat replica', 'pet portrait San Antonio TX',
            'personalized pet gift', 'pet memorial gift',
        ],
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const data = await queryVendure<GetProductBySlugResponse>(GET_PRODUCT_BY_SLUG_QUERY, { slug });

    if (!data.product) {
        notFound();
    }

    const product = data.product;

    // Filter to only enabled variants
    const enabledVariants = getEnabledVariants(product.variants);

    // Strip HTML tags from description
    const cleanDescription = product.description
        ? product.description.replace(/<[^>]*>/g, '').trim()
        : '';

    // Build gallery from product assets in Vendure (proxied so images load on any device)
    const galleryImages = product.assets && product.assets.length > 0
        ? product.assets.map((a: { preview: string }) => getProxiedAssetUrl(`${a.preview}?preset=large&format=webp`))
        : [product.featuredAsset?.preview ? getProxiedAssetUrl(`${product.featuredAsset.preview}?preset=large&format=webp`) : '/images/replicas/_DSC3783.jpg'];

    // Get price range from enabled variants only
    const prices = enabledVariants.map((v: any) => v.price).filter((p: number) => typeof p === 'number') || [];
    const minPrice = prices.length > 0 ? Math.min(...prices) / 100 : 150.00;
    const maxPrice = prices.length > 0 ? Math.max(...prices) / 100 : 215.00;

    // Product schema markup
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": cleanDescription,
        "image": galleryImages,
        "brand": {
            "@type": "Brand",
            "name": "My Pet Replicas"
        },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "USD",
            "lowPrice": minPrice.toFixed(2),
            "highPrice": maxPrice.toFixed(2),
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "My Pet Replicas"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5",
            "reviewCount": "127"
        },
        "manufacturer": {
            "@type": "Organization",
            "name": "My Pet Replicas",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "San Antonio",
                "addressRegion": "TX",
                "addressCountry": "US"
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* ── Left: Image Gallery ── */}
                    <ProductGallery
                        images={galleryImages}
                        productName={product.name}
                    />

                    {/* ── Right: Product Info + Configurator ── */}
                    <ProductInfo>
                        {/* Breadcrumb */}
                        <div className="text-xs text-neutral-500">
                            <a href="/" className="hover:text-neutral-400 transition-colors">Home</a>
                            <span className="mx-2">/</span>
                            <span className="text-neutral-400">{product.name}</span>
                        </div>

                        {/* Name */}
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                            {product.name}
                        </h1>

                        {/* Description */}
                        <p className="text-neutral-400 leading-relaxed text-base max-w-prose text-left">
                            {cleanDescription}
                        </p>

                        {/* Shipping */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-400">Ships in 5 days</span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-neutral-800/60" />

                        {/* Configurator */}
                        <ProductConfigurator
                            product={{ ...product, variants: enabledVariants }}
                        />
                    </ProductInfo>
                </div>

                {/* ── FAQ / Risk Reversal ── */}
                <section className="mt-32 max-w-3xl mx-auto">
                    <ProductFadeUp>
                        <h2 className="font-display text-2xl font-bold text-white text-center mb-12">
                            Common Questions
                        </h2>
                    </ProductFadeUp>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'What if my photos aren\'t perfect?',
                                a: 'They don\'t need to be. As long as I can see your pet clearly, I can make it work. I\'ll ask for more photos if I need them.',
                            },
                            {
                                q: 'How long does it take?',
                                a: 'About 1-2 weeks from order to delivery. Each replica is hand-painted to order, so I take the time to get every detail right.',
                            },
                            {
                                q: 'Can you capture specific markings or colors?',
                                a: 'Absolutely. That\'s what makes each replica special. Use the special instructions box to point out anything specific. Spots, stripes, eye color, unique markings. I\'ll make sure to get it right.',
                            },
                            {
                                q: 'Is this a good gift for a pet owner?',
                                a: 'It really is one of the most meaningful gifts you can give a pet owner. Customers tell me their families are moved to tears when they open it. It\'s deeply personal and nothing like generic mass-produced pet gifts.',
                            },
                        ].map((faq, i) => (
                            <ProductFadeUp key={i} delay={i * 0.1}>
                                <div className="rounded-xl bg-[var(--color-dark-card)] p-8 shadow-md hover:shadow-lg transition-shadow">
                                    <h3 className="text-base font-semibold text-white mb-2">{faq.q}</h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed">{faq.a}</p>
                                </div>
                            </ProductFadeUp>
                        ))}
                    </div>
                </section>

                {/* ── Below: How it works ── */}
                <section className="mt-32 max-w-[1000px] mx-auto rounded-2xl bg-[var(--color-dark-elevated)] py-20 px-6 md:px-16">
                    <ProductFadeUp>
                        <div className="text-center mb-16 md:mb-20">
                            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
                                How It Works
                            </h2>
                        </div>
                    </ProductFadeUp>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 lg:gap-14">
                        {/* Step 1: Upload Your Photos */}
                        <ProductFadeUp delay={0}>
                            <div className="text-left md:text-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                                    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="4" y="7" width="24" height="19" rx="3" />
                                        <circle cx="16" cy="17" r="5" />
                                        <circle cx="16" cy="17" r="2" />
                                        <path d="M11 7V5.5A1.5 1.5 0 0112.5 4h7A1.5 1.5 0 0121 5.5V7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Upload Your Photos
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                                    Snap a few clear photos of your pet from different angles. Our uploader makes it easy. Just drag, drop, and you&apos;re done.
                                </p>
                            </div>
                        </ProductFadeUp>

                        {/* Step 2: We Sculpt & Paint */}
                        <ProductFadeUp delay={0.15}>
                            <div className="text-left md:text-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                                    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M19 4l9 9-14.5 14.5a3 3 0 01-2.12.88H6v-5.38a3 3 0 01.88-2.12L19 4z" />
                                        <path d="M15 8l9 9" />
                                        <path d="M6 28.5c-1.5-1-2.5-3-2-5 .5 2 2 3.5 4 4-.5.5-1.2.8-2 1z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    We Sculpt &amp; Paint
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                                    I 3D-sculpt and hand-paint your replica to match every marking, color, and expression that makes your pet one of a kind.
                                </p>
                            </div>
                        </ProductFadeUp>

                        {/* Step 3: Unbox Your Best Friend */}
                        <ProductFadeUp delay={0.3}>
                            <div className="text-left md:text-center">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                                    <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 6C14.5 3.5 11 2 8 4.5S5.5 12 16 18c10.5-6 11-10.5 8-13.5S17.5 3.5 16 6z" />
                                        <rect x="5" y="20" width="22" height="8" rx="2" />
                                        <path d="M16 20v8" />
                                        <path d="M5 24h22" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Unbox Your Best Friend
                                </h3>
                                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                                    Your replica arrives in premium packaging, ready to sit on a shelf forever. Whether it&apos;s a memorial or the perfect gift for a pet owner.
                                </p>
                            </div>
                        </ProductFadeUp>
                    </div>
                </section>


            </div>
        </>
    );
}
