import { EmailSender, EmailDetails, EmailTransportOptions } from '@vendure/email-plugin';
import { Resend } from 'resend';

/**
 * Custom EmailSender that uses Resend's HTTP API instead of SMTP.
 * Railway blocks outbound SMTP ports (465, 587), so we bypass
 * nodemailer entirely and use Resend's REST API.
 */
export class ResendEmailSender implements EmailSender {
    private resend!: Resend;

    init() {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            console.warn('[ResendEmailSender] RESEND_API_KEY not set — emails will fail');
        }
        this.resend = new Resend(apiKey);
    }

    async send(email: EmailDetails, options: EmailTransportOptions) {
        const { data, error } = await this.resend.emails.send({
            from: email.from,
            to: [email.recipient],
            subject: email.subject,
            html: email.body,
            ...(email.cc ? { cc: [email.cc] } : {}),
            ...(email.bcc ? { bcc: [email.bcc] } : {}),
            ...(email.replyTo ? { replyTo: email.replyTo } : {}),
        });

        if (error) {
            console.error('[ResendEmailSender] Failed to send email:', error);
            throw new Error(`Resend API error: ${error.message}`);
        }

        console.log(`[ResendEmailSender] Email sent to ${email.recipient} (id: ${data?.id})`);
    }

    destroy() {
        // nothing to clean up
    }
}
