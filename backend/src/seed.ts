/**
 * Seed script for My Pet Replicas
 * Creates ONE product with two Option Groups (Size + Base) and 4 variants.
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
    console.log('\n📦 Creating product: Custom Pet Replica...');
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
                        name: 'Custom Pet Replica',
                        slug: 'custom-pet-replica',
                        description:
                            'A beautifully hand-painted custom figure of your pet. Choose your size and whether you\'d like a display base included. Upload photos and we\'ll handcraft a one-of-a-kind replica that perfectly captures your pet\'s unique personality and markings.',
                    },
                ],
            },
        },
        token
    );
    const productId = createProductData.createProduct.id;
    console.log(`  ✓ Product created (id: ${productId})`);

    // ── Step 3: Create Option Groups ──
    console.log('\n🎛️  Creating option groups...');

    // Size option group
    const sizeGroupData = await adminQuery(
        `mutation CreateProductOptionGroup($input: CreateProductOptionGroupInput!) {
            createProductOptionGroup(input: $input) { id code options { id code } }
        }`,
        {
            input: {
                code: 'size',
                translations: [{ languageCode: 'en', name: 'Size' }],
                options: [
                    { code: '4-inch', translations: [{ languageCode: 'en', name: '4 Inch' }] },
                    { code: '5-inch', translations: [{ languageCode: 'en', name: '5 Inch' }] },
                ],
            },
        },
        token
    );
    console.log(`  ✓ Size option group created (id: ${sizeGroupData.createProductOptionGroup.id})`);

    // Base option group
    const baseGroupData = await adminQuery(
        `mutation CreateProductOptionGroup($input: CreateProductOptionGroupInput!) {
            createProductOptionGroup(input: $input) { id code options { id code } }
        }`,
        {
            input: {
                code: 'base',
                translations: [{ languageCode: 'en', name: 'Base' }],
                options: [
                    { code: 'no-base', translations: [{ languageCode: 'en', name: 'No Base' }] },
                    { code: 'with-base', translations: [{ languageCode: 'en', name: 'With Base' }] },
                ],
            },
        },
        token
    );
    console.log(`  ✓ Base option group created (id: ${baseGroupData.createProductOptionGroup.id})`);

    // ── Step 4: Assign option groups to product ──
    console.log('\n🔗 Assigning option groups to product...');
    await adminQuery(
        `mutation AddOptionGroupToProduct($productId: ID!, $optionGroupId: ID!) {
            addOptionGroupToProduct(productId: $productId, optionGroupId: $optionGroupId) { id }
        }`,
        { productId, optionGroupId: sizeGroupData.createProductOptionGroup.id },
        token
    );
    await adminQuery(
        `mutation AddOptionGroupToProduct($productId: ID!, $optionGroupId: ID!) {
            addOptionGroupToProduct(productId: $productId, optionGroupId: $optionGroupId) { id }
        }`,
        { productId, optionGroupId: baseGroupData.createProductOptionGroup.id },
        token
    );
    console.log('  ✓ Both option groups assigned');

    // ── Step 5: Create the 4 variants ──
    console.log('\n🏷️  Creating variants...');

    const sizeOptions = sizeGroupData.createProductOptionGroup.options;
    const baseOptions = baseGroupData.createProductOptionGroup.options;

    // Map: [sizeCode, baseCode] → { sku, price }
    const variantDefs = [
        { sizeCode: '4-inch', baseCode: 'no-base', sku: 'PET-4IN-NOBASE', price: 15000, name: '4 Inch. No Base' },
        { sizeCode: '4-inch', baseCode: 'with-base', sku: 'PET-4IN-BASE', price: 17500, name: '4 Inch. With Base' },
        { sizeCode: '5-inch', baseCode: 'no-base', sku: 'PET-5IN-NOBASE', price: 18500, name: '5 Inch. No Base' },
        { sizeCode: '5-inch', baseCode: 'with-base', sku: 'PET-5IN-BASE', price: 21500, name: '5 Inch. With Base' },
    ];

    const variantInputs = variantDefs.map((v) => {
        const sizeOption = sizeOptions.find((o: any) => o.code === v.sizeCode);
        const baseOption = baseOptions.find((o: any) => o.code === v.baseCode);
        return {
            productId,
            sku: v.sku,
            price: v.price,
            stockOnHand: 100,
            optionIds: [sizeOption.id, baseOption.id],
            translations: [{ languageCode: 'en', name: v.name }],
        };
    });

    const variantData = await adminQuery(
        `mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
            createProductVariants(input: $input) { id name sku price }
        }`,
        { input: variantInputs },
        token
    );

    for (const v of variantData.createProductVariants) {
        console.log(`  ✓ Variant: ${v.name}. $${(v.price / 100).toFixed(2)} (sku: ${v.sku})`);
    }

    console.log('\n✅ Seed completed! Single product with 4 variants created successfully.');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
