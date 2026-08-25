# AliExpress Affiliate API setup

AliExpress Finds searches affiliate-eligible products through the server-only `aliexpress.affiliate.hotproduct.query` endpoint. The public experience requests English-language results but does not target or display a country-specific currency or shipping destination. AliExpress confirms local currency, shipping, and availability after a visitor opens a product.

## 1. Confirm the application permission

In the AliExpress Open Platform console, confirm that the approved application belongs to the same account as AliExpress Portals and can call:

`aliexpress.affiliate.hotproduct.query`

The current integration uses the HTTPS TOP affiliate gateway documented for that method:

`https://api-sg.aliexpress.com/sync`

It signs every request using the current IOP `sign_method=sha256` protocol (HMAC-SHA256 over the sorted request parameters). It does not require or store an AliExpress shopper or seller access token.

## 2. Apply the Supabase migration

Open the Supabase SQL Editor for the MishBaby project and run:

`supabase/migrations/20260823000000_create_aliexpress_search_cache_and_limits.sql`

The migration creates private, server-only tables for one-hour result caching, hashed hourly visitor usage, and aggregate daily usage. It also creates an atomic quota function and an hourly cleanup job. Row Level Security is enabled and browser roles receive no access.

If the project does not permit `pg_cron`, enable Supabase Cron and rerun the migration. Do not enable the public search without an equivalent cleanup schedule.

## 3. Configure server-only variables

Add these values to `.env.local` and to the Production, Preview, and Development environments in Vercel:

```dotenv
ALIEXPRESS_APP_KEY="your-approved-app-key"
ALIEXPRESS_APP_SECRET="your-app-secret"
ALIEXPRESS_TRACKING_ID="your-portals-tracking-id"
ALIEXPRESS_SEARCH_RATE_LIMIT_SECRET="a-random-secret-with-at-least-32-characters"
```

Never add a `NEXT_PUBLIC_` prefix, commit the values, expose them in browser code, or paste them into screenshots. Generate a dedicated random rate-limit secret instead of reusing the App Secret or a Supabase credential.

## 4. Verify the gateway and credentials

After adding the variables, run:

```bash
npm run test:aliexpress-api
```

You may provide a different safe public product phrase:

```bash
npm run test:aliexpress-api -- "baby monitor"
```

The command prints only whether the call succeeded and how many returned records contain valid HTTPS promotion links. It never prints credentials, product URLs, or the raw AliExpress response.

If the command reports a gateway, signing, or permission failure, stop before enabling `/aliexpress-finds`. Check the endpoint displayed by the approved Affiliate API application and the Advanced API permission for `aliexpress.affiliate.hotproduct.query`; do not substitute seller or dropshipping API credentials.

### Compare the Advanced API methods

After the Advanced API permission becomes active, compare its Smart Match and Hot Products methods with the standard product query:

```bash
npm run compare:aliexpress-api
```

The diagnostic uses the same three baby-product phrases for every method and reports returned products, relevant titles, and valid HTTPS affiliate links. Smart Match requires a device ID, so the diagnostic generates an ephemeral random value for each request; it does not read or store a visitor or device identifier. It also omits country and currency targeting. The command never prints credentials, affiliate URLs, or raw API responses, and it does not change the public AliExpress Finds implementation.

## 5. Run and deploy

```bash
npm run dev
```

Open [http://localhost:3000/aliexpress-finds](http://localhost:3000/aliexpress-finds). After local verification, redeploy with the same four server-only variables and smoke-test the Vercel page.

The route intentionally fails closed when credentials, Supabase, quota storage, or AliExpress are unavailable.

## Limits and retention

- Ten cache-miss API calls per salted visitor hash per fixed UTC hour.
- 200 cache-miss calls across MishBaby per UTC day.
- Pages one through three only, with ten results per page.
- Returned data is cached for no more than one hour.
- Raw visitor IP addresses and raw search phrases are not stored.
- Hashed hourly usage is retained for no more than 48 hours.
- Aggregate daily usage is retained for seven days.

Official references:

- [Affiliate product query](https://developer.alibaba.com/docs/api.htm?apiId=45803)
- [AliExpress API access-count limitations](https://developer.alibaba.com/docs/doc.htm?articleId=108426&docType=1&treeId=502)
