import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
    if (!transporter) {
        if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
            throw new Error('Brevo SMTP credentials are missing from environment variables.');
        }
        transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.BREVO_SMTP_USER,
                pass: process.env.BREVO_SMTP_KEY
            }
        });
    }
    return transporter;
};

/**
 * Send a 6-digit OTP to the given email address.
 * @param {string} to - recipient email
 * @param {string} otp - the 6-digit OTP string
 */
export const sendOtpEmail = async (to, otp) => {
    const mailOptions = {
        from: "sportsync98@gmail.com",
        to,
        subject: 'Verify Your Email — Sportsync',
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e5e5;">
                <div style="padding: 40px 32px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                    <h1 style="margin: 0; font-size: 28px; letter-spacing: 8px; font-weight: 400; text-transform: uppercase; color: #000;">Sportsync</h1>
                </div>
                <div style="padding: 40px 32px; text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #999; font-weight: 700;">Verification Code</p>
                    <div style="margin: 24px 0; padding: 20px; background: #fafafa; border: 1px solid #eee;">
                        <span style="font-size: 36px; letter-spacing: 12px; font-weight: 700; color: #000;">${otp}</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #888; line-height: 1.6;">
                        Enter this code to verify your email address.<br/>
                        This code expires in <strong>10 minutes</strong>.
                    </p>
                </div>
                <div style="padding: 20px 32px; text-align: center; background: #fafafa; border-top: 1px solid #f0f0f0;">
                    <p style="margin: 0; font-size: 10px; color: #bbb; letter-spacing: 1px; text-transform: uppercase;">
                        If you didn't request this, please ignore this email.
                    </p>
                </div>
            </div>
        `
    };

    const info = await getTransporter().sendMail(mailOptions);

    console.log("EMAIL SENT:", info);
};

/**
 * Notify admin of payment/refund issues (non-blocking for webhooks).
 */
export const sendAdminAlertEmail = async ({ type, orderId, message }) => {
    const to = process.env.ADMIN_ALERT_EMAIL || process.env.BREVO_SMTP_USER;
    if (!to) {
        console.warn('ADMIN_ALERT_EMAIL not set; skipping alert email');
        return;
    }

    const mailOptions = {
        from: 'sportsync98@gmail.com',
        to,
        subject: `[Sportsync] Payment alert: ${type}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px;">
                <h2 style="color:#c00;">Sportsync payment alert</h2>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Order:</strong> ${orderId || 'N/A'}</p>
                <p><strong>Details:</strong> ${message}</p>
                <p style="color:#666;font-size:12px;">Check admin dashboard → Payment alerts.</p>
            </div>
        `,
    };

    await getTransporter().sendMail(mailOptions);
};
