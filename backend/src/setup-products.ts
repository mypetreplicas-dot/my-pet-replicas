/**
 * Sets up all add-on products for the storefront.
 * - Ensures custom-pet-replica has exactly ONE variant at $150
 * - Creates additional-pet ($120), single-base ($25), multiple-base ($35) if missing
 * - Disables stock tracking on every variant
 *
 * Run with: npx ts-node src/setup-products.ts
 */
import 'dotenv/config';

const ADMIN_API = process.env.VENDURE_API_URL || `http://localhost:${process.env.PORT || 3000}/admin-api`;

async function q(query: string, variables: any = {}, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(ADMIN_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(JSON.stringify(json.errors));
    return json.data;
}

async function login() {
    const res = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `mutation { login(username: "${process.env.SUPERADMIN_USERNAME || 'superadmin'}", password: "${process.env.SUPERADMIN_PASSWORD || 'superadmin'}") { ... on CurrentUser { id } } }`,
        }),
    });
    const token = res.headers.get('vendure-auth-token') || '';
    if (!token) throw new Error('Login failed');
    console.log('✓ Logged in');
    return token;
}

async function disableStockTracking(variantIds: string[], token: string) {
    await q(
        `mutation U($input: [UpdateProductVariantInput!]!) { updateProductVariants(input: $input) { id } }`,
        { input: variantIds.map(id => ({ id, trackInventory: 'FALSE', outOfStockThreshold: 0 })) },
        token,
    );
}

async function ensureProduct(
    slug: string,
    name: string,
    price: number, // cents
    variantName: string,
    token: string,
) {
    const data = await q(
        `query P($slug: String!) { product(slug: $slug) { id variants { id } } }`,
        { slug },
        token,
    );

    if (data.product) {
        console.log(`  • ${name} already exists — skipping create`);
        await disableStockTracking(data.product.variants.map((v: any) => v.id), token);
        return data.product;
    }

    const created = await q(
        `mutation C($input: CreateProductInput!) { createProduct(input: $input) { id } }`,
        {
            input: {
                enabled: true,
                translations: [{ languageCode: 'en', name, slug, description: '' }],
            },
        },
        token,
    );
    const productId = created.createProduct.id;

    const variant = await q(
        `mutation V($input: [CreateProductVariantInput!]!) { createProductVariants(input: $input) { id } }`,
        {
            input: [{
                productId,
                sku: slug.toUpperCase(),
                price,
                stockOnHand: 9999,
                translations: [{ languageCode: 'en', name: variantName }],
                optionIds: [],
            }],
        },
        token,
    );
    const variantId = variant.createProductVariants[0].id;
    await disableStockTracking([variantId], token);
    console.log(`  ✓ Created ${name} at $${(price / 100).toFixed(2)}`);
    return { id: productId };
}

async function run() {
    const token = await login();

    // ── Fetch current state of custom-pet-replica ──
    const mainData = await q(
        `query { product(slug: "custom-pet-replica") { id variants { id name price } } }`,
        {},
        token,
    );
    if (!mainData.product) throw new Error('custom-pet-replica not found');

    const mainVariants: { id: string; name: string; price: number }[] = mainData.product.variants;
    console.log(`\nCustom Pet Replica — found ${mainVariants.length} variant(s)`);

    // Keep or create the $150 variant; delete extras
    const keepVariant = mainVariants.find(v => v.price === 15000) ?? mainVariants[0];

    if (!keepVariant) {
        // No variants at all — create one
        await q(
            `mutation V($input: [CreateProductVariantInput!]!) { createProductVariants(input: $input) { id } }`,
            {
                input: [{
                    productId: mainData.product.id,
                    sku: 'CUSTOM-PET-150',
                    price: 15000,
                    stockOnHand: 9999,
                    translations: [{ languageCode: 'en', name: 'Custom Pet Figurine' }],
                    optionIds: [],
                }],
            },
            token,
        );
        console.log('  ✓ Created $150 variant');
    } else {
        // Ensure the kept variant is priced at $150
        if (keepVariant.price !== 15000) {
            await q(
                `mutation U($input: [UpdateProductVariantInput!]!) { updateProductVariants(input: $input) { id } }`,
                { input: [{ id: keepVariant.id, price: 15000, trackInventory: 'FALSE' }] },
                token,
            );
            console.log(`  ✓ Updated "${keepVariant.name}" price to $150`);
        } else {
            console.log(`  • "${keepVariant.name}" is already $150`);
        }

        // Delete all other variants
        const extras = mainVariants.filter(v => v.id !== keepVariant.id);
        for (const v of extras) {
            await q(
                `mutation D($id: ID!) { deleteProductVariant(id: $id) { result } }`,
                { id: v.id },
                token,
            );
            console.log(`  ✓ Deleted extra variant: "${v.name}"`);
        }

        await disableStockTracking([keepVariant.id], token);
    }

    // ── Add-on products ──
    console.log('\nEnsuring add-on products...');
    await ensureProduct('additional-pet',  'Additional Pet',    12000, 'Additional Pet',    token);
    await ensureProduct('single-base',     'Single Base',        2500, 'Single Base',        token);
    await ensureProduct('multiple-base',   'Multiple Base',      3500, 'Multiple Base',      token);

    console.log('\n✅ All done.');
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
