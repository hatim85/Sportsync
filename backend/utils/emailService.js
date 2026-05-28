import nodemailer from 'nodemailer';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

let smtpTransporter;

function getSender() {
  return {
    name: process.env.BREVO_SENDER_NAME || 'Sportsync',
    email: process.env.BREVO_SENDER_EMAIL || 'sportsync98@gmail.com',
  };
}

/**
 * Brevo REST API (HTTPS). Use on Render/production — outbound SMTP is often blocked.
 */
async function sendViaBrevoApi({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      'BREVO_API_KEY is not set. In Brevo: Settings → SMTP & API → API keys. Add it to Render env vars.',
    );
  }

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: getSender(),
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API failed (${res.status}): ${body}`);
  }

  const data = await res.json();
  console.log('EMAIL SENT (Brevo API):', data?.messageId || 'ok');
  return data;
}

/** SMTP fallback for local dev only (blocked on many hosts e.g. Render). */
function getSmtpTransporter() {
  if (!smtpTransporter) {
    if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_KEY) {
      throw new Error('Brevo SMTP credentials are missing from environment variables.');
    }
    smtpTransporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
    });
  }
  return smtpTransporter;
}

async function sendViaSmtp({ to, subject, html }) {
  const sender = getSender();
  const info = await getSmtpTransporter().sendMail({
    from: `"${sender.name}" <${sender.email}>`,
    to,
    subject,
    html,
  });
  console.log('EMAIL SENT (SMTP):', info.messageId);
  return info;
}

async function sendEmail({ to, subject, html }) {
  // Prefer HTTPS API (works on Render). SMTP only if explicitly enabled or no API key.
  const useSmtp =
    process.env.EMAIL_TRANSPORT === 'smtp' ||
    (!process.env.BREVO_API_KEY && process.env.BREVO_SMTP_USER);

  if (useSmtp && !process.env.BREVO_API_KEY) {
    console.warn(
      'Using SMTP for email. On Render this often times out — set BREVO_API_KEY and EMAIL_TRANSPORT=api.',
    );
    return sendViaSmtp({ to, subject, html });
  }

  return sendViaBrevoApi({ to, subject, html });
}

/**
 * Send a 6-digit OTP to the given email address.
 */
export const sendOtpEmail = async (to, otp) => {
  await sendEmail({
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
        `,
  });
};

/**
 * Notify admin of payment/refund issues (non-blocking for webhooks).
 */
export const sendAdminAlertEmail = async ({ type, orderId, message }) => {
  const to = process.env.ADMIN_ALERT_EMAIL || process.env.BREVO_SENDER_EMAIL;
  if (!to) {
    console.warn('ADMIN_ALERT_EMAIL not set; skipping alert email');
    return;
  }

  await sendEmail({
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
  });
};
