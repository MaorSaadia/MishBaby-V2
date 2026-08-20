# Supabase account setup

The application code is ready for Supabase Auth, but the hosted services must be configured before accounts are enabled.

## 1. Create the project

1. Create one hosted Supabase project in **Central EU (Frankfurt)**.
2. In Authentication settings, keep email confirmation enabled and set the minimum password length to at least 8.
3. Copy the project URL, publishable key, and secret key into local `.env.local` and the matching Vercel environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SITE_URL=https://mish-baby-v2.vercel.app
```

The secret key is server-only. Never give it a `NEXT_PUBLIC_` prefix. Redeploy after changing Vercel variables.

## 2. Configure redirect URLs

Set the Supabase Site URL to `https://mish-baby-v2.vercel.app`. Add these allowed redirect URLs:

- `http://localhost:3000/**`
- `https://mish-baby-v2.vercel.app/**`
- `https://mishbaby.com/**` when the custom domain is launched

For local development, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

## 3. Enable Google

1. Create a Google OAuth web client and add the Supabase-generated Google callback URL shown in the Supabase provider screen as an authorized redirect URI.
2. Add the temporary Vercel origin and later the custom domain to the Google app’s authorized JavaScript origins.
3. Add the Google client ID and secret to the Google provider in Supabase Auth and enable it.

MishBaby sends users through `/auth/callback` after the provider exchange.

## 4. Configure Resend SMTP

1. Verify `auth.mishbaby.com` in Resend.
2. Add Resend’s SPF and DKIM records to DNS. Add a DMARC record in monitoring mode (`p=none`) initially and review its reports before strengthening the policy.
3. Create a dedicated Resend API key for Supabase SMTP.
4. In Supabase custom SMTP settings use:

```text
Sender: MishBaby <no-reply@auth.mishbaby.com>
Host: smtp.resend.com
Port: 465
Username: resend
Password: [the dedicated Resend API key]
```

## 5. Update email templates

Brand the Supabase messages and use the following links so MishBaby can exchange token hashes securely.

Signup confirmation:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account">Confirm your MishBaby account</a>
```

Password recovery:

```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/update-password">Choose a new password</a>
```

## 6. Smoke test

Test locally and on Vercel: Google signup/sign-in, email confirmation, email/password sign-in, password recovery/update, local sign-out, and permanent account deletion. Test invalid, expired, reused, and malformed email links. Confirm Google and password login for the same verified address resolve to one Supabase user.

The Privacy Policy and Terms are working foundations and should receive owner/legal review before they are treated as final legal advice.

## 7. Enable product favorites

Run [`supabase/migrations/20260819000000_create_product_favorites.sql`](./supabase/migrations/20260819000000_create_product_favorites.sql) once in the Supabase SQL Editor (or apply it through the Supabase CLI if the project is linked). This creates only the product-favorites table and its Row Level Security policies.

After applying it, verify with two separate accounts that each account can see and remove only its own saved products. Deleting an Auth user automatically deletes that user’s favorites.

## 8. Enable guide favorites

Run [`supabase/migrations/20260819001000_create_guide_favorites.sql`](./supabase/migrations/20260819001000_create_guide_favorites.sql) once in the Supabase SQL Editor (or apply it through the Supabase CLI). Verify with two accounts that saved guides remain private to their owner and are removed when the Auth user is deleted.

## 9. Enable marketing consent preferences

Run [`supabase/migrations/20260820000000_create_marketing_consent_events.sql`](./supabase/migrations/20260820000000_create_marketing_consent_events.sql) once in the Supabase SQL Editor (or apply it through the Supabase CLI). The table stores an append-only history of opt-ins and withdrawals. Authenticated browser clients can read only their own history; writes go through MishBaby’s authenticated Server Action and server-only Supabase secret.

This migration does not create a mailing list or send any marketing email. Test opt-in, withdrawal, repeated submissions, cross-account isolation, and account-deletion cleanup before connecting a future campaign provider.
