/**
 * Seed script for My Pet Clones
 * Creates ONE product with 8 bundle variants (pet count × base option).
 * No option groups — variants are looked up by SKU in the frontend.
 * Run with: npx ts-node src/seed.ts
 */
import 'dotenv/config';

const ADMIN_API = process.env.VENDURE_API_URL || `http://localhost:${process.env.PORT || 3000}/admin-api`;

async function adminQuery(query: string, variables: any = {}, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(ADMIN_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) {
        console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
        throw new Error('GraphQL error');
    }
    return json.data;
}

async function login(): Promise<string> {
    const res = await fetch(ADMIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `mutation { login(username: "${process.env.SUPERADMIN_USERNAME || 'superadmin'}", password: "${process.env.SUPERADMIN_PASSWORD || 'superadmin'}") { ... on CurrentUser { id } } }`,
        }),
    });
    const authToken = res.headers.get('vendure-auth-token') || '';
    console.log('Logged in, token:', authToken ? '✓' : '✗');
    return authToken;
}

async function seed() {
    console.log('🌱 Starting seed...');
    const token = await login();

    // ── Step 1: Delete old products ──
    console.log('\n🗑️  Cleaning up old products...');
    const existingProducts = await adminQuery(
        `query { products(options: { take: 50 }) { items { id name } } }`,
        {},
        token
    );
    for (const p of existingProducts.products.items) {
        await adminQuery(
            `mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) { result } }`,
            { id: p.id },
            token
        );
        console.log(`  ✓ Deleted old product: ${p.name} (id: ${p.id})`);
    }

    // ── Step 2: Create the single product ──
    console.log('\n📦 Creating product: Custom Pet Clone...');
    const createProductData = await adminQuery(
        `mutation CreateProduct($input: CreateProductInput!) {
            createProduct(input: $input) { id name }
        }`,
        {
            input: {
                enabled: true,
                translations: [
                    {
                        languageCode: 'en',
                        name: 'Custom Pet Figurine',
                        slug: 'custom-pet-replica',
                        description:
                            'A beautifully hand-painted custom figurine of your pet. Upload photos and we\'ll handcraft a one-of-a-kind keepsake that perfectly captures your pet\'s unique personality and markings.',
                    },
                ],
            },
        },
        token
    );
    const productId = createProductData.createProduct.id;
    console.log(`  ✓ Product created (id: ${productId})`);

    // ── Step 3: Create the 8 bundle variants ──
    // Pricing: flat per-pet-count bundles + base add-ons
    //   No base:     1=$150  2=$270  3=$390
    //   Own bases:   1=$175  2=$320  3=$465  (+$25 per pet)
    //   Together:           2=$305  3=$435  (+$35 for 2, +$45 for 3)
    console.log('\n🏷️  Creating variants...');

    const variantDefs = [
        { sku: 'PET-1-NOBASE',    price: 15000, name: '1 Pet — No Base' },
        { sku: 'PET-1-BASE',      price: 17500, name: '1 Pet — With Base' },
        { sku: 'PET-2-NOBASE',    price: 27000, name: '2 Pets — No Base' },
        { sku: 'PET-2-OWNBASES',  price: 32000, name: '2 Pets — Each on Own Base' },
        { sku: 'PET-2-TOGETHER',  price: 30500, name: '2 Pets — Together on Shared Base' },
        { sku: 'PET-3-NOBASE',    price: 39000, name: '3 Pets — No Base' },
        { sku: 'PET-3-OWNBASES',  price: 46500, name: '3 Pets — Each on Own Base' },
        { sku: 'PET-3-TOGETHER',  price: 43500, name: '3 Pets — Together on Shared Base' },
    ];

    const variantInputs = variantDefs.map((v) => ({
        productId,
        sku: v.sku,
        price: v.price,
        stockOnHand: 100,
        optionIds: [],
        translations: [{ languageCode: 'en', name: v.name }],
    }));

    const variantData = await adminQuery(
        `mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
            createProductVariants(input: $input) { id name sku price }
        }`,
        { input: variantInputs },
        token
    );

    for (const v of variantData.createProductVariants) {
        console.log(`  ✓ Variant: ${v.name} — $${(v.price / 100).toFixed(2)} (sku: ${v.sku})`);
    }

    console.log('\n✅ Seed completed! Single product with 8 bundle variants created successfully.');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
