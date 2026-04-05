import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { HomeHero, HomeFadeUp, ExpandableImage } from '@/components/HomeAnimations';

const reviewImages = [
  '/images/reviews/petreplicas website etsy-01.jpg',
  '/images/reviews/petreplicas website etsy-02.jpg',
  '/images/reviews/petreplicas website etsy-03.jpg',
];

function getWorkImages() {
  const dir = path.join(process.cwd(), 'public/images/my-work');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort()
    .map((f) => `/images/my-work/${f}`);
}

export default function HomePage() {
  const workImages = getWorkImages();
  return (
    <>
      {/* ── Hero Section ── */}
      <section className="relative min-h-[70vh] flex items-center">
        {/* Background image & Overlay */}
        <div className="absolute inset-0 z-0 bg-[var(--color-surface-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/replicas/_DSC3783.jpg"
            alt="A hand-painted custom pet clone sitting beside a framed photo"
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface-main)] via-[var(--color-surface-main)]/90 to-transparent" />
        </div>

        <HomeHero>
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="max-w-2xl space-y-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-gold)] drop-shadow-md">
                Hand-Painted in San Antonio, TX
              </p>

              <h1 className="font-display text-5xl md:text-7xl font-bold text-[var(--color-text-primary)] leading-[1.1] drop-shadow-sm">
                Your Pet{' '}
                <span className="text-[var(--color-primary)] drop-shadow-lg">Miniaturized.</span>
              </h1>

              <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-lg drop-shadow-md">
                A hand-painted figurine that captures your pet's every marking, color, and expression. Starting at $150 — delivered in 5–7 business days, or as fast as 3 days with rush.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-8">
                <Link
                  href="/product/custom-pet-replica"
                  className="px-8 py-5 min-h-[56px] bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[18px] font-sans font-extrabold rounded-full transition-all shadow-[0_4px_16px_hsla(358,100%,67%,0.4)] hover:shadow-[0_8px_24px_hsla(358,100%,67%,0.6)] hover:-translate-y-1 flex items-center justify-center duration-300"
                >
                  Order yours
                </Link>
              </div>
            </div>
          </div>
        </HomeHero>
      </section>

      {/* ── My Work Gallery ── */}
      {workImages.length > 0 && (
        <section className="py-16 md:py-20 px-6">
          <div className="max-w-[1200px] mx-auto">
            <HomeFadeUp>
              <div className="text-center mb-10 md:mb-12">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                  My Work
                </h2>
                <p className="text-sm text-neutral-400 max-w-lg mx-auto">
                  Every one of these is hand-painted. Real pets, real details. Each one as unique as the pet it&apos;s based on.
                </p>
              </div>
            </HomeFadeUp>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {workImages.map((src, i) => (
                <HomeFadeUp key={i} delay={i * 0.1}>
                  <ExpandableImage src={src} alt={`Pet figurine ${i + 1}`} />
                </HomeFadeUp>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Social Proof: Craftsman Image Gallery ── */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <HomeFadeUp>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                Trusted by Hundreds of Happy Customers.<br />Each Figurine as Unique as the Pet It&apos;s Based On.
              </h2>
              <a
                href="https://www.etsy.com/shop/PRNTMAKYR"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-terra-600/10 border border-terra-500/20 mb-4 hover:bg-terra-600/20 transition-colors group cursor-pointer"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-terra-400 group-hover:text-terra-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold tracking-wide text-terra-400 uppercase group-hover:text-terra-300 transition-colors">
                  5-Star Rated Custom Artist on Etsy
                </span>
                <svg className="w-4 h-4 text-terra-400/70 group-hover:text-terra-300 transition-colors ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </HomeFadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {reviewImages.map((src, i) => (
              <HomeFadeUp key={i} delay={i * 0.15}>
                <ExpandableImage src={src} alt={`Etsy review ${i + 1}`} />
              </HomeFadeUp>
            ))}
          </div>

          <HomeFadeUp delay={0.5}>
            <p className="text-center text-sm text-neutral-400 mt-10">
              These are just a few favorites, you can read{' '}
              <a
                href="https://www.etsy.com/shop/PRNTMAKYR#reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="text-terra-400 hover:text-terra-300 underline underline-offset-2 transition-colors"
              >
                hundreds more on my Etsy
              </a>
            </p>
          </HomeFadeUp>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-14 md:py-20 px-6 bg-[var(--color-surface-elevated)]">
        <div className="max-w-[1000px] mx-auto">
          <HomeFadeUp>
            <div className="text-center mb-10 md:mb-14">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]">
                How It Works
              </h2>
            </div>
          </HomeFadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10 lg:gap-14">
            {/* Step 1: Upload Your Photos */}
            <HomeFadeUp delay={0}>
              <div className="text-left md:text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                  <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="7" width="24" height="19" rx="3" />
                    <circle cx="16" cy="17" r="5" />
                    <circle cx="16" cy="17" r="2" />
                    <path d="M11 7V5.5A1.5 1.5 0 0112.5 4h7A1.5 1.5 0 0121 5.5V7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  Upload Your Photos
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                  Submit at least 3 clear photos of your pet — different angles help us get every detail right.
                </p>
              </div>
            </HomeFadeUp>

            {/* Step 2: We Sculpt & Paint */}
            <HomeFadeUp delay={0.15}>
              <div className="text-left md:text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                  <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 4l9 9-14.5 14.5a3 3 0 01-2.12.88H6v-5.38a3 3 0 01.88-2.12L19 4z" />
                    <path d="M15 8l9 9" />
                    <path d="M6 28.5c-1.5-1-2.5-3-2-5 .5 2 2 3.5 4 4-.5.5-1.2.8-2 1z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  We Sculpt, Refine &amp; Hand-Paint
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                  We study your photos carefully and handcraft a full-color figurine that captures your pet&apos;s exact markings, colors, and expression — every detail, exactly as they are.
                </p>
              </div>
            </HomeFadeUp>

            {/* Step 3: Unbox Your Best Friend */}
            <HomeFadeUp delay={0.3}>
              <div className="text-left md:text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-terra-600/10 border border-terra-500/10 flex items-center justify-center text-terra-400 md:mx-auto mb-5">
                  <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 6C14.5 3.5 11 2 8 4.5S5.5 12 16 18c10.5-6 11-10.5 8-13.5S17.5 3.5 16 6z" />
                    <rect x="5" y="20" width="22" height="8" rx="2" />
                    <path d="M16 20v8" />
                    <path d="M5 24h22" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  Unbox Your Best Friend
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed max-w-[300px] md:mx-auto">
                  Your figurine arrives carefully packaged and ready to display — a permanent reminder of the pet you love or the one you still miss.
                </p>
              </div>
            </HomeFadeUp>
          </div>

          {/* Secondary CTA */}
          <HomeFadeUp delay={0.45}>
            <div className="text-center mt-10 md:mt-14">
              <Link
                href="/product/custom-pet-replica"
                className="inline-flex items-center px-8 py-4 min-h-[52px] border-2 border-[var(--color-border-bright)] text-[var(--color-text-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 font-sans font-extrabold rounded-full transition-all duration-300"
              >
                Commission your figure
              </Link>
            </div>
          </HomeFadeUp>
        </div>
      </section>

    </>
  );
}
