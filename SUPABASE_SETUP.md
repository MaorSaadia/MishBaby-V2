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

The signup page includes one unchecked consent checkbox shared by email and Google signup. When selected, MishBaby records the consent only after Supabase authenticates or confirms the user. Leaving it unchecked creates no marketing consent event and does not prevent account creation.

## 10. Synchronize opted-in contacts with Resend

Run [`supabase/migrations/20260820001000_create_marketing_contact_sync.sql`](./supabase/migrations/20260820001000_create_marketing_contact_sync.sql) in the Supabase SQL Editor (or apply it through the Supabase CLI). Supabase remains the consent source of truth; this table records whether the current preference has been synchronized to Resend.

In Resend:

1. Create a segment named **MishBaby Updates** and copy its segment ID.
2. Create a dedicated marketing API key. Do not reuse the SMTP key used by Supabase Auth.
3. Add a webhook whose endpoint is `https://mish-baby-v2.vercel.app/api/webhooks/resend` and subscribe it to `contact.updated` and `contact.deleted` events.
4. Copy the webhook signing secret, including its `whsec_` prefix.

Add these server-only values to `.env.local` and Vercel, then redeploy:

```text
RESEND_MARKETING_API_KEY=
RESEND_MARKETING_SEGMENT_ID=
RESEND_WEBHOOK_SECRET=
```

Never give these variables a `NEXT_PUBLIC_` prefix. When `mishbaby.com` becomes the production domain, create or update the Resend webhook endpoint to use that domain.

Test both directions before sending any campaign:

- Opt in from the Account page and confirm the Resend contact is active and belongs to **MishBaby Updates**.
- Withdraw consent in MishBaby and confirm the Resend contact is marked unsubscribed.
- Mark a test contact unsubscribed in Resend and confirm the Account page reflects the withdrawal after reloading.
- Delete the test account and confirm its Resend contact is removed.

This integration synchronizes contacts only. It does not create or send broadcasts.

### If Resend is intentionally disabled

Leave `RESEND_MARKETING_API_KEY`, `RESEND_MARKETING_SEGMENT_ID`, and `RESEND_WEBHOOK_SECRET` unset. MishBaby will continue recording account consent in Supabase without showing email-provider synchronization warnings to users.

When the domain and Resend are ready, apply the contact-sync migration and configure the variables above. Preview the existing subscribed contacts without changing Resend:

```bash
npm run sync:marketing-contacts
```

After reviewing the count, synchronize them with:

```bash
npm run sync:marketing-contacts -- --apply
```

The command adds only users whose latest Supabase consent event is `subscribed`. It does not send an email. Run the production smoke tests above after the backfill.

## 11. Enable merchant click insights

Run [`supabase/migrations/20260904000000_create_merchant_click_insights.sql`](./supabase/migrations/20260904000000_create_merchant_click_insights.sql) in the Supabase SQL Editor (or apply it through the Supabase CLI). It creates anonymous daily aggregate counters, a short-lived hourly abuse-limit table, and service-role-only functions. It does not store individual click events, affiliate URLs, account IDs, email addresses, or raw IP addresses.

Generate a random secret containing at least 32 characters and add it to `.env.local` and Vercel:

```text
MERCHANT_CLICK_RATE_LIMIT_SECRET=
```

This value is server-only. Never give it a `NEXT_PUBLIC_` prefix. Redeploy after adding the migration and environment variable so published product pages receive signed tracking identities.

Open a curated product and test one link from each available surface: the desktop hero shortcut, mobile merchant tray, and full offer comparison. The merchant destination must open normally even if recording fails. Then open **Click Insights** in Sanity Studio and verify the totals appear in the 7-, 30-, and 90-day reports. The report uses UTC dates and can take one refresh to show a newly recorded click.
