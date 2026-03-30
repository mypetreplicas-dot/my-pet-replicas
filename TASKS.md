# My Pet Clones - Development Roadmap & Tasks

## Phase 1: Environment & Foundation
- [x] Scaffold Backend (Vendure) & Frontend (Next.js)
- [x] Configure Database Connection (SQLite/PostgreSQL)
- [x] Seed Initial Products (Custom Pet Replicas, Memorial Halo)
- [x] Ensure local Dev Servers sync correctly (Next.js & Vendure)

## Phase 2: Frontend UI & Pet Replica Configurator
- [x] **Fix NaN Price Errors:** Added guards for undefined/NaN prices across ProductCard, ProductConfigurator, and CartDrawer.
- [x] **Pet Replica Configurator Flow:**
  - [x] Implement robust image upload component (drag & drop, 5 files max, 10MB, JPG/PNG/WebP).
  - [x] Ensure user-entered "Special Instructions" are correctly saved to the cart/order via custom fields.
  - [x] Validate accurate pricing based on replica size selected (3-inch, 6-inch, 9-inch).
- [x] **Trust & Visuals:**
  - [x] Product pages use framer-motion animations (fade-in, slide-in gallery, scroll-triggered sections).
  - [x] Interactive image gallery with thumbnail selector and animated transitions on product pages.
  - [x] Product cards have hover lift + clay glow animation.
  - [x] Added customer reviews/testimonials section to home page and product pages.

## Phase 3: SEO & Local GEO Strategy (Crucial)
- [x] **Core SEO Fundamentals:**
  - [x] Implement dynamic Meta Titles & Descriptions focused on "Custom Pet Replicas" (product pages have dynamic metadata).
  - [x] Ensure semantic HTML structure (H1, H2, H3) across product pages and articles.
  - [x] Generate XML Sitemap & `robots.txt` allowing indexing by ChatGPT, Claude, and Perplexity.
  - [x] **AIO (AI Optimization):** Inject "gifting" semantic keywords into page copy so LLMs recommend the site for "pet lover gifts".
- [x] **GEO / Local Strategy:**
  - [x] Create dedicated landing page for San Antonio (`/locations/san-antonio`).
  - [x] Implement `LocalBusiness` or `Product` Schema Markup tailored for local visibility.
  - [x] Target voice-search FAQ phrases (e.g., "Where can I get a custom plush of my dog?").

## Phase 4: Operations & Payments (Stripe)
- [x] Configure `StripePlugin` in `vendure-config.ts`.
- [x] Create Stripe payment method in Vendure Admin.
- [x] Connect Stripe Elements on Next.js Checkout page.
- [x] Configure local Stripe Webhook for event handling and testing.
- [x] Set up United States Tax Zones (8.25% Sales tax for TX) to calculate instantly on checkout.

## Phase 5: Storage & Email
- [x] **Asset Storage:**
  - [x] `@vendure/asset-server-plugin` configured with local dev storage + Cloudflare R2 for production.
- [x] **Transactional Email:**
  - [x] `@vendure/email-plugin` connected to Resend (HTTP API) with verified domain `sales.mypetclones.com`.
  - [x] Styled "Order Confirmation" email template (dark theme matching website design).
  - [x] Styled "Shipping Confirmation" email template (auto-sends on order fulfillment).
  - [x] Fixed timezone display (TZ=America/Chicago).
  - [x] Hardened all email templates against crash scenarios (missing order data, null assets, non-order templates).
  - [x] Switched non-order templates (email-verification, password-reset, email-address-change) to dark theme.

## Phase 5b: Pre-Launch Hardening
- [x] **Footer Redesign:** 4-column layout (Brand/NAP, Shop, Support/Legal, Secure Payments) with trust badges, payment icons (Stripe, Visa, Mastercard), SSL lock, Privacy Policy & Terms links. Mobile-stacked, tertiary styling.
- [x] **Form UX & Accessibility:** Replaced `alert()` file validation with inline error messages (red accent, clear fix instructions). All form fields already have permanent visible labels above inputs.
- [x] **Database Safety:** Set `synchronize: false` in production DB config (`vendure-config.ts`). Dev keeps `synchronize: true`. Use `npx vendure migrate` for schema changes in production.
- [ ] **Email Deliverability (SPF, DKIM, DMARC):**
  - [ ] Configure SPF record to authorize Resend (end with `~all` softfail).
  - [ ] Verify DKIM signing via Resend (`rsa-sha256`, 2048-bit key).
  - [ ] Set up DMARC policy (start with `p=none`, move to `p=quarantine` then `p=reject`).
- [ ] **How It Works Section:** Redesigned with Rule of Three (Upload, Sculpt & Paint, Unbox), custom 32px SVG icons, left-aligned on mobile / 3-column on desktop, `max-w-[1000px]`, secondary ghost CTA, `dark-elevated` background separation.

## Phase 6: Deployment & Launch
- [x] Provision Production PostgreSQL Database (Railway).
- [x] Deploy Vendure Backend to Railway.
- [x] Deploy Next.js Frontend to Railway.
- [x] Configure Custom Domain and switch out localhost environment variables.
- [x] Switch Stripe from `Test Mode` to `Live Mode`.
- [x] Remove test mode card text from checkout UI.
- [x] Add email confirmation (retype) field on checkout for redundancy.
- [x] Remove "Contact Artist" link from header (desktop + mobile).
- [x] Fix mobile Chrome HDR brightness glitch (removed backdrop-blur, mix-blend-mode, added sRGB canvas conversion for uploaded images).

## Phase 7: Post-Launch Enhancements (V2) & Mobile-First Push
- [ ] **Animated Background:** Implement a video or sequence of images showing a hand-drawn dog animating across the screen.
- [ ] **Scroll-Triggered Lead Capture:** Slide-up bottom sheet triggered via Intersection Observer at page footer (w/ localStorage).
  - [ ] *Note:* `ExitIntentPopup.tsx` component exists (email capture popup on scroll-to-footer) but is **hidden for now** — needs smoother animation & email integration deferred until post-deployment.
- [ ] **Cart Abandonment Recovery (Vendure + Resend):**
  - [ ] Update frontend checkout to capture email as Step 1.
  - [ ] Create Vendure Scheduled Task (cron job) to find abandoned orders stuck in `AddingItems`.
  - [ ] Integrate Resend to fire a heavily personalized email 1 hour after abandonment showing their specific pet photos.
- [ ] **Post-Purchase & Advocacy Email Workflows (Resend):**
  - [ ] **Post-Delivery Check-in:** A few days after tracking shows "delivered," trigger an automated email asking "How's your order?" — use this to gather feedback and request a photo (UGC) of the replica next to their actual pet.
  - [ ] **Advocacy / Referral Invitation:** ~6 weeks post-purchase, send an email inviting them to refer a friend. DINKWADs (Double Income, No Kids, With A Dog) have networks of devoted pet parents — offer a referral perk to turn satisfied customers into active brand advocates.
- [ ] **Streamlined Mobile Checkout & Speed (CRO):**
  - [ ] Implement Apple Pay + Google Pay 1-click checkout options.
  - [ ] Provide Buy Now, Pay Later (BNPL) like Klarna/Afterpay.
  - [ ] Guarantee < 3s load times through aggressive image compression and caching.
- [ ] **Mobile-First Indexing & Communication:**
  - [ ] Test and optimize all automated Resend emails on iOS/Android clients.
  - [ ] Maximize local "Micro-Moments": ensure contact and local info is reachable in <= 2 taps.

## Phase 8: Local SEO Engine & Location Search Optimization (LSO)
- [ ] **Google Business Profile (GBP):**
  - [ ] Set up and meticulously manage GBP with high-quality photos of studio and finished replicas.
  - [ ] Ensure NAP (Name, Address, Phone) is 100% consistent across website footer, GBP, and local directories.
  - [ ] Upload high-impact visuals regularly (listings with photos get 42% more direction requests).
  - [ ] Actively push customers to leave Google reviews.
- [ ] **Locally Relevant Content / Blog:**
  - [ ] Publish guides tailored to the San Antonio area (e.g., "Best Dog-Friendly Parks in San Antonio," "Meaningful Ways to Memorialize a Pet in Bexar County") to build local authority and drive organic traffic.
- [ ] **Micro-Moment Capture:** Localize GBP Q&A and website FAQ with natural phrases like "pet memorials near me," "custom dog urns San Antonio" to capture 76% of local-search-to-visit conversions.

## Phase 9: Optimize Average Order Value (AOV) with Upsells
- [ ] **In-Cart Cross-Sells:** Offer complementary add-ons before checkout — memorial halo, premium engraved wooden base, expedited "skip-the-line" 2-day sculpting service.
- [ ] **Future Revenue Streams (Mind Map):**
  - [ ] Partnerships: Network with local high-end veterinarians or groomers to display figures.
  - [ ] Merchandising: Custom framed prints of the 3D render.
  - [ ] New Audiences: Expand from dogs to horses, reptiles, etc.
