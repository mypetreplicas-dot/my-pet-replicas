/**
 * One-shot script: disables inventory tracking on every product variant.
 * Made-to-order products don't need stock limits.
 * Run with: npx ts-node src/disable-stock-tracking.ts
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
    const token = res.headers.get('vendure-auth-token') || '';
    console.log('Logged in, token:', token ? '✓' : '✗');
    return token;
}

async function run() {
    const token = await login();

    // Fetch all variants across all products
    const data = await adminQuery(
        `query {
            products(options: { take: 100 }) {
                items {
                    name
                    variants {
                        id
                        name
                        sku
                        trackInventory
                        stockOnHand
                    }
                }
            }
        }`,
        {},
        token,
    );

    const allVariants: { id: string; name: string; sku: string }[] = [];
    for (const product of data.products.items) {
        for (const v of product.variants) {
            allVariants.push({ id: v.id, name: `${product.name} — ${v.name}`, sku: v.sku });
        }
    }

    console.log(`\nFound ${allVariants.length} variant(s). Disabling stock tracking on all...`);

    const input = allVariants.map((v) => ({
        id: v.id,
        trackInventory: 'FALSE',   // GlobalFlag.FALSE — never block orders due to stock
        outOfStockThreshold: 0,
    }));

    // Vendure accepts up to 100 variant updates per call
    const updated = await adminQuery(
        `mutation UpdateVariants($input: [UpdateProductVariantInput!]!) {
            updateProductVariants(input: $input) {
                id
                name
                trackInventory
            }
        }`,
        { input },
        token,
    );

    for (const v of updated.updateProductVariants) {
        console.log(`  ✓ ${v.name}  trackInventory=${v.trackInventory}`);
    }

    console.log('\n✅ Done. All variants will now accept unlimited orders.');
}

run().catch((err) => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
