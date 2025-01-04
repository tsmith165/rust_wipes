import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(resendApiKey);

export async function sendEmail({ from, to, subject, html }: { from: string; to: string | string[]; subject: string; html: string }) {
    try {
        console.log('Sending email with Resend...');
        console.log('API Key present:', !!resendApiKey);
        console.log('From:', from);
        console.log('To:', to);
        console.log('Subject:', subject);

        const result = await resend.emails.send({
            from,
            to,
            subject,
            html,
        });

        console.log('Resend API Response:', result);
        return result;
    } catch (error) {
        console.error('Error sending email with Resend:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
            });
        }
        throw error;
    }
}
