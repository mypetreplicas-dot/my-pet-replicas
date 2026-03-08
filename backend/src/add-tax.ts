import { bootstrap, RequestContext, DefaultLogger, LogLevel } from '@vendure/core';
import { config } from './vendure-config';

async function addTax() {
    console.log('Bootstrapping Vendure...');
    const appConfig = {
        ...config,
        logger: new DefaultLogger({ level: LogLevel.Info }),
    };

    const app = await bootstrap(appConfig);
    console.log('Vendure bootstrapped successfully');

    try {
        const taxRateService = app.get('TaxRateService');
        const taxCategoryService = app.get('TaxCategoryService');
        const zoneService = app.get('ZoneService');

        // Context (superuser)
        const ctx = new RequestContext({
            apiType: 'admin',
            isAuthorized: true,
            authorizedAsOwnerOnly: false,
            channel: await app.get('ChannelService').getDefaultChannel()
        });

        // Get 'Standard Tax' category
        const categories = await taxCategoryService.findAll(ctx);
        const standardTax = categories.items.find((c: any) => c.name === 'Standard Tax');

        if (!standardTax) {
            console.error('Standard Tax category not found');
            await app.close();
            process.exit(1);
        }

        // Get 'Americas' zone (this was seeded in populate.ts)
        const zones = await zoneService.findAll(ctx);
        const americasZone = zones.items.find((z: any) => z.name === 'Americas');

        if (!americasZone) {
            console.error('Americas zone not found');
            await app.close();
            process.exit(1);
        }

        // Add the TX tax rate
        console.log('Creating TX Sales Tax rate (8.25%)...');
        await taxRateService.create(ctx, {
            name: 'TX Sales Tax',
            enabled: true,
            value: 8.25,
            categoryId: standardTax.id,
            zoneId: americasZone.id,
        });

        console.log('✅ Tax rate created successfully.');

    } catch (error) {
        console.error('❌ Failed to create tax rate:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

addTax();
