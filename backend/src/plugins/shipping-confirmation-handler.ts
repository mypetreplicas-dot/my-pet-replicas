import { OrderStateTransitionEvent, EntityHydrator } from '@vendure/core';
import { EmailEventListener, transformOrderLineAssetUrls, shippingLinesWithMethod } from '@vendure/email-plugin';

export const shippingConfirmationHandler = new EmailEventListener('shipping-confirmation')
    .on(OrderStateTransitionEvent)
    .filter(event => event.toState === 'Shipped' && !!event.order.customer)
    .loadData(async ({ event, injector }) => {
        const entityHydrator = injector.get(EntityHydrator);
        await entityHydrator.hydrate(event.ctx, event.order, {
            relations: ['lines.featuredAsset', 'shippingLines.shippingMethod', 'fulfillments'],
        });
        transformOrderLineAssetUrls(event.ctx, event.order, injector);
        const shippingLines = shippingLinesWithMethod(event.order);
        return { shippingLines };
    })
    .setRecipient(event => event.order.customer!.emailAddress)
    .setFrom('{{ fromAddress }}')
    .setSubject('Your order #{{ order.code }} has shipped!')
    .setTemplateVars(event => ({
        order: event.order,
        shippingLines: event.data.shippingLines,
    }));
