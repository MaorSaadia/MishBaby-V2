# Amazon Creator API setup

Amazon Finds searches the Amazon US Baby catalog from the server. The supplied official Node.js SDK is installed as a local npm workspace and compiled automatically during `npm install` and Vercel installs.

## 1. Apply the Supabase migration

Open the Supabase SQL Editor for the MishBaby project and run:

`supabase/migrations/20260821000000_create_amazon_search_cache_and_limits.sql`

The migration creates private server-only tables for:

- Amazon responses cached for no more than 24 hours
- salted visitor hashes retained for no more than 48 hours
- aggregate daily request counts retained for seven days

It also creates the atomic quota function and an hourly `pg_cron` cleanup job. The tables have Row Level Security enabled and are unavailable to `anon` and `authenticated`; only the server-side Supabase secret can use them.

If the Supabase project does not permit the `pg_cron` extension, enable Cron from the Supabase dashboard and rerun the migration. Do not enable Amazon Finds without an equivalent cleanup schedule.

## 2. Configure credentials

Add these variables to `.env.local` and to the Production, Preview, and Development environments in Vercel:

```dotenv
AMAZON_CREATORS_CREDENTIAL_ID="your-credential-id"
AMAZON_CREATORS_CREDENTIAL_SECRET="your-credential-secret"
AMAZON_CREATORS_CREDENTIAL_VERSION="the-exact-version-from-amazon"
AMAZON_CREATORS_PARTNER_TAG="your-us-associates-tag"
AMAZON_CREATORS_MARKETPLACE="www.amazon.com"
AMAZON_SEARCH_RATE_LIMIT_SECRET="a-random-secret-with-at-least-32-characters"
```

All six variables are server-only. Never prefix them with `NEXT_PUBLIC_`, include them in browser code, commit them, or paste them into support screenshots.

The credential version must exactly match the value Amazon issued. The current integration accepts Creator API OAuth credential versions `2.1`–`2.3` and `3.1`–`3.3`. The partner tag must belong to the matching US Associates account.

Generate a separate random rate-limit secret rather than reusing an Amazon or Supabase credential. For example:

```bash
openssl rand -hex 32
```

## 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000/amazon-finds](http://localhost:3000/amazon-finds). The API intentionally fails closed with a friendly message if credentials, Supabase, or quota storage are unavailable.

## 4. Deploy and verify

Redeploy after adding the Vercel variables, then verify:

1. A two-character-or-longer search returns up to ten Baby results.
2. **Load more** accumulates pages two and three without duplicate ASINs.
3. Result links open Amazon in a new tab and keep Amazon's returned URL unchanged.
4. Repeating the same query and page within 24 hours uses the existing `amazon_search_cache` row.
5. A different query or page creates a distinct cache entry and increments the quota tables.
6. `/amazon-finds` is marked `noindex`, and `/api/amazon/` is disallowed in `robots.txt`.

Do not inspect or edit the attributed destination URL before sending it to the visitor. Prices, availability, ratings, reviews, and permanent catalog imports are outside this feature.

## Limits and retention

Only cache misses consume MishBaby's internal allowance:

- 10 Creator API calls per salted visitor hash per fixed UTC hour
- 250 Creator API calls across the site per UTC day
- Pages 1–3 only, with up to ten results per page

Expired cache data is never served even if scheduled cleanup has not run yet. Raw visitor IP addresses and raw search phrases are not written to the Amazon search tables.

Amazon documentation:

- [Using the Creator API SDK](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-sdk)
- [SearchItems](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/search-items)
- [Caching practices](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/best-programming-practices)
- [API rates and attributed URLs](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/concepts/api-rates)
