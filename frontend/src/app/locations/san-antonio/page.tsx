import Link from 'next/link';
import { HomeHero, HomeFadeUp } from '@/components/HomeAnimations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Custom Pet Figurines in San Antonio, TX | Cherished Mementos',
    description: 'Beautiful, hand-painted custom pet figurines made right here in San Antonio, Texas. 5-star rated on Etsy. Celebrate your pet or honor their memory.',
};

const reviews = [
    {
        name: 'Sarah M. (San Antonio)',
        text: 'I cried when I opened the box. It looks exactly like my Bailey. Every little marking, the way her ears fold. He nailed it.',
        stars: 5,
    },
    {
        name: 'James R.',
        text: 'We lost our cat last year and this clone sits on our mantle now. It\'s like she\'s still here with us. Worth every penny.',
        stars: 5,
    },
    {
        name: 'Maria L. (Austin)',
        text: 'The attention to detail is insane. He even got the little white patch on her chin. My whole family was amazed.',
        stars: 5,
    },
];

export default function SanAntonioPage() {
    return (
        <>
            {/* ── Hero Section ── */}
            <section className="relative min-h-[70vh] flex items-center">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/replicas/_DSC3783.jpg"
                        alt="A hand-painted custom pet clone sitting beside a framed photo in San Antonio"
                        className="w-full h-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-dark-main)] via-[var(--color-dark-main)]/50 to-[var(--color-dark-main)]" />
                </div>

                <HomeHero>
                    <div className="relative z-10 max-w-6xl mx-auto px-6">
                        <div className="max-w-2xl space-y-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terra-400">
                                San Antonio, TX Local Artist
                            </p>

                            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.1]">
                                San Antonio's Best{' '}
                                <span className="text-gradient-terra">Custom Pet Figurines</span>
                            </h1>

                            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-lg">
                                Hand-painted right here in San Antonio to capture every marking, expression, and detail that makes your pet yours. Celebrate them while they&apos;re here, or keep their memory close forever.
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                <Link
                                    href="/product/custom-pet-replica"
                                    className="px-8 py-4 min-h-[48px] min-w-[48px] bg-terra-600 hover:bg-terra-500 text-white text-base font-semibold rounded-full transition-all shadow-[0_0_32px_rgba(212,112,62,0.25)] hover:shadow-[0_0_48px_rgba(212,112,62,0.4)] flex items-center justify-center"
                                >
                                    Order Your Figurine →
                                </Link>
                            </div>
                        </div>
                    </div>
                </HomeHero>
            </section>

            {/* ── Social Proof & Local Focus ── */}
            <section className="py-12 md:py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <HomeFadeUp>
                        <div className="text-center mb-8">
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                                Proudly Made in Military City, USA
                            </h2>
                            <div className="flex items-center justify-center gap-1.5 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 text-terra-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm text-neutral-500">
                                5-star rated · hundreds of happy customers on Etsy
                            </p>
                        </div>
                    </HomeFadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {reviews.map((review, i) => (
                            <HomeFadeUp key={i} delay={i * 0.15}>
                                <div className="bg-[var(--color-dark-card)] rounded-2xl p-6 shadow-lg">
                                    <div className="flex gap-1 mb-3">
                                        {[...Array(review.stars)].map((_, j) => (
                                            <svg key={j} className="w-4 h-4 text-terra-400" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-neutral-300 leading-relaxed mb-3">
                                        &ldquo;{review.text}&rdquo;
                                    </p>
                                    <p className="text-xs text-neutral-500 font-medium">
                                        — {review.name}
                                    </p>
                                </div>
                            </HomeFadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works (Local) ── */}
            <section className="py-12 md:py-16 px-6 bg-[var(--color-dark-card)]">
                <div className="max-w-6xl mx-auto">
                    <HomeFadeUp>
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-10">
                            How It Works for Locals
                        </h2>
                    </HomeFadeUp>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
                        {[
                            {
                                step: '01',
                                title: 'Send Your Photos',
                                desc: 'Upload a few clear photos of your pet from different angles right from your phone or computer.',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                ),
                            },
                            {
                                step: '02',
                                title: 'Sculpted &amp; Painted in San Antonio',
                                desc: 'We study your photos and handcraft a full-color figurine of your pet right here in our San Antonio studio, matching every unique marking and detail.',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                                    </svg>
                                ),
                            },
                            {
                                step: '03',
                                title: 'Fast Local Delivery',
                                desc: 'Your finished figurine is carefully packed and shipped. Standard orders ship in 5–7 business days — rush orders in as little as 3. Most competitors take 3+ weeks.',
                                icon: (
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                ),
                            },
                        ].map((item, i) => (
                            <HomeFadeUp key={i} delay={i * 0.15}>
                                <div className="text-center group">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-terra-600/10 text-terra-400 flex items-center justify-center mb-4 group-hover:bg-terra-600/20 group-hover:scale-110 transition-all duration-300">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-white mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-neutral-400 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            </HomeFadeUp>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
