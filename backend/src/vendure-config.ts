import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    LanguageCode,
    VendureConfig,
    Asset,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin, configureS3AssetStorage, SharpAssetPreviewStrategy } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import { StripePlugin } from '@vendure/payments-plugin/package/stripe';
import { PetPhotoUploadPlugin } from './plugins/pet-photo-upload.plugin';
import { ResendEmailSender } from './plugins/resend-email-sender';
import { shippingConfirmationHandler } from './plugins/shipping-confirmation-handler';
import { multiPetDiscountAction } from './promotions/multi-pet-discount';
import 'dotenv/config';
import path from 'path';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3020';

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy: IS_DEV ? false : 1,
        cors: {
            origin: IS_DEV ? ['http://localhost:3020', 'http://localhost:5173'] : [frontendUrl],
            credentials: true,
        },
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiDebug: true,
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
            password: process.env.SUPERADMIN_PASSWORD || 'superadmin',
        },
        cookieOptions: {
            secret: process.env.COOKIE_SECRET || 'fallback-cookie-secret-12345',
        },
    },
    dbConnectionOptions: process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: false,
            ssl: {
                rejectUnauthorized: false,
            },
            migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
            logging: false,
        }
        : {
            type: 'postgres',
            synchronize: true,
            migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
            logging: false,
            database: 'vendure',
            host: '127.0.0.1',
            port: 5434,
            username: 'vendure',
            password: 'vendure_password',
        },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    promotionOptions: {
        promotionActions: [multiPetDiscountAction],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        OrderLine: [
            {
                name: 'specialInstructions',
                type: 'text',
                label: [{ languageCode: LanguageCode.en, value: 'Special Instructions' }],
                nullable: true,
                public: true,
            },
            {
                name: 'petPhotos',
                type: 'relation',
                entity: Asset,
                list: true,
                label: [{ languageCode: LanguageCode.en, value: 'Pet Photos' }],
                nullable: true,
                public: true,
            },
        ],
    },
    plugins: [
        GraphiqlPlugin.init(),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            previewStrategy: new SharpAssetPreviewStrategy({
                maxWidth: 1200,
                maxHeight: 1200,
                jpegOptions: { quality: 85, progressive: true },
                webpOptions: { quality: 85 },
                pngOptions: { quality: 90 },
            }),
            // Only use S3/R2 in production
            ...(IS_DEV
                ? {}
                : {
                    assetUrlPrefix: (process.env.R2_PUBLIC_URL || '').replace(/\/?$/, '/'),
                    storageStrategyFactory: configureS3AssetStorage({
                        bucket: process.env.R2_BUCKET_NAME || '',
                        credentials: {
                            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
                            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
                        },
                        nativeS3Configuration: {
                            endpoint: process.env.R2_ENDPOINT,
                            region: 'auto',
                            forcePathStyle: true,
                        },
                    }),
                }),
        }),
        StripePlugin.init({
            storeCustomersInStripe: true,
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init(
            process.env.RESEND_API_KEY
                ? {
                    outputPath: path.join(__dirname, '../static/email/test-emails'),
                    route: 'mailbox',
                    handlers: [...defaultEmailHandlers, shippingConfirmationHandler],
                    templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
                    globalTemplateVars: {
                        fromAddress: '"My Pet Clones" <noreply@sales.mypetclones.com>',
                        verifyEmailAddressUrl: `${frontendUrl}/verify`,
                        passwordResetUrl: `${frontendUrl}/password-reset`,
                        changeEmailAddressUrl: `${frontendUrl}/verify-email-address-change`,
                    },
                    transport: { type: 'none' as const },
                    emailSender: new ResendEmailSender(),
                }
                : {
                    devMode: true,
                    outputPath: path.join(__dirname, '../static/email/test-emails'),
                    route: 'mailbox',
                    handlers: [...defaultEmailHandlers, shippingConfirmationHandler],
                    templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
                    globalTemplateVars: {
                        fromAddress: '"My Pet Clones" <noreply@sales.mypetclones.com>',
                        verifyEmailAddressUrl: `${frontendUrl}/verify`,
                        passwordResetUrl: `${frontendUrl}/password-reset`,
                        changeEmailAddressUrl: `${frontendUrl}/verify-email-address-change`,
                    },
                }
        ),
        DashboardPlugin.init({
            route: 'dashboard',
            appDir: IS_DEV
                ? path.join(__dirname, '../dist/dashboard')
                : path.join(__dirname, 'dashboard'),
        }),
        PetPhotoUploadPlugin,
    ],
};
