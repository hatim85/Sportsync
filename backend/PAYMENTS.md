# Sportsync — Production payment setup

## Required environment variables

```env
RAZORPAY_API_KEY=rzp_live_...
RAZORPAY_API_SECRET=...
WEBHOOK_SECRET=...          # From Razorpay Dashboard → Webhooks → Secret
JWT_SECRET=...
ADMIN_ALERT_EMAIL=you@email.com   # Refund failures & webhook errors
BREVO_SMTP_USER=...
BREVO_SMTP_KEY=...
CLIENT=https://your-frontend.com
```

## Razorpay Dashboard

1. **Live mode** keys in production `.env`
2. **Webhook URL:** `https://<api-domain>/api/webhook`
3. **Events:** `payment.captured`, `payment.failed`, `order.paid`, `refund.created`, `refund.processed`, `refund.failed`

## Security

- Payment & order APIs require `access_token` cookie (JWT)
- Webhook verifies `x-razorpay-signature` with `WEBHOOK_SECRET`
- Order totals recalculated server-side before Razorpay order creation
- Webhook events stored in `WebhookEvent` collection (idempotent by `eventId`)

## Admin

- **Payment alerts:** `GET /api/admin/payment-alerts` (admin JWT)
- Shown on Admin → Orders page; email sent when `ADMIN_ALERT_EMAIL` is set
