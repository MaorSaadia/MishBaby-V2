# MishBaby deployment checklist

This project is ready for a managed Next.js deployment. Vercel is the recommended first host because it supports the App Router, ISR, route handlers, and image optimization without extra infrastructure.

## 1. Import the repository

Create a new Vercel project from the MishBaby repository. Keep the detected framework as Next.js and use the standard commands:

- Install: `npm install`
- Build: `npm run build`
- Output directory: leave unset

Do not configure the project as a static export.

## 2. Add environment variables

Add these values in Vercel Project Settings → Environment Variables:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` only when overriding the default model
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` to enable production Umami analytics

Use the same Sanity project and dataset for Production and Preview unless a separate test dataset is intentionally introduced later. `GEMINI_API_KEY` must remain server-only.

After changing any `NEXT_PUBLIC_` value, create a new deployment because public variables are fixed into the browser bundle at build time.

For Umami Cloud, create a website for MishBaby's production domain and use its website ID. The tracker accepts both `mishbaby.com` and `www.mishbaby.com` so analytics continue working during canonical-domain redirects. It excludes query strings and URL hashes, respects Do Not Track, and does not record account, authentication, API, or Studio routes. Verify page views from the production domain after redeploying; localhost and Vercel preview traffic should not appear.

## 3. Connect the production domain

Add `mishbaby.com` to the Vercel project and configure the DNS records Vercel provides. Choose one canonical hostname and redirect the other:

- Canonical: `https://mishbaby.com`
- Redirect: `https://www.mishbaby.com` → `https://mishbaby.com`

The application metadata, sitemap, and robots file already use `https://mishbaby.com` as the canonical origin.

## 4. Configure Sanity CORS

The public storefront fetches catalog data on the server. The browser-based Studio still needs its exact origin approved by Sanity.

In [Sanity Manage](https://www.sanity.io/manage), open the MishBaby project, then Settings → API settings → CORS Origins. Add:

- `http://localhost:3000` with credentials allowed for local Studio access
- `https://mishbaby.com` with credentials allowed for production Studio access

If Studio is intentionally opened on `https://www.mishbaby.com`, add that exact origin too. Avoid credential-enabled wildcard origins. For a temporary Vercel preview, add only that preview's exact origin and remove it when testing is finished.

## 5. Deploy and smoke-test

Confirm the deployment succeeds, then check:

- `/`, `/products`, `/categories`, and `/guides` load correctly
- A product page displays active merchant offers
- A guide page and its related content load
- `/studio` requires Sanity authentication
- Product and Guide Assistants generate drafts
- With the publish webhook configured below, a published Sanity change appears on a fresh page load after the webhook succeeds; hourly background revalidation remains the fallback
- `/robots.txt` and `/sitemap.xml` use the production domain
- An unknown URL displays the custom 404 page
- A public page view appears in Umami without its query string, while account and Studio routes do not appear

## 6. Production checks

- Confirm HTTPS is active before sharing the site publicly.
- Confirm the response includes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.
- Confirm `/studio` is not indexed and remains accessible only to approved Sanity members.
- Keep Vercel deployment logs free of Sanity or Gemini authentication errors.
- Rotate the Gemini key immediately if it is ever exposed.

A strict Content Security Policy is intentionally deferred. The embedded Sanity Studio loads several external resources, so its policy should be tested separately before enforcement rather than added broadly and risk breaking editorial access.

## 7. ISR usage

Published CMS fetches share the one-hour lifetime in `lib/content-cache.ts`. This includes the categories and product search index used by the root layout. A shorter lifetime on a shared fetch can lower the revalidation interval of every prerendered route that uses it. Revalidation is request-driven, so an unvisited page does not refresh on an hourly timer. Live Amazon and AliExpress API caches are managed separately.

The root layout passes only the category fields used by navigation to the client. Keep client props small: serializing the full catalog or editorial content into a shared component increases the payload stored with every affected page.

After deploying, filter Vercel's ISR usage to this project (the team overview can include other projects). Compare daily read/write units alongside traffic and publishing activity over several days. If available, use route-level ISR observability to identify pages with poor write utilization. Units measure 8 KB of data, not page views or regenerations. Unchanged regeneration output does not incur ISR write units, so a longer interval does not imply proportional billing savings.

The signed Sanity webhook at `/api/webhooks/sanity` expires tagged content on publishing, updating, unpublishing, or deleting documents. It uses immediate expiration so the next server request fetches fresh data. The hourly lifetime remains a fallback if webhook delivery fails. A product change also invalidates product lists and the navigation search index; category, merchant, and image changes invalidate queries that reference them. Because navigation includes all products, product changes can still invalidate many pages, but only when publishing rather than every minute.

See [Vercel's ISR optimization guidance](https://vercel.com/docs/incremental-static-regeneration/limits-and-pricing#optimizing-isr-reads-and-writes).

## 8. Immediate updates from Sanity

This needs a one-time configuration in both Vercel and Sanity; deploying the endpoint alone does not enable it.

1. Generate a random secret of at least 32 characters (for example, `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). Store it as the server-only Vercel environment variable `SANITY_REVALIDATE_SECRET` for Production, then deploy these changes. Do not commit the secret or use a `NEXT_PUBLIC_` prefix.
2. Open your project in [Sanity Manage](https://www.sanity.io/manage), then **API > Webhooks > Create webhook**.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Name | MishBaby published content refresh |
| URL | `https://mishbaby.com/api/webhooks/sanity` (use your canonical production origin if different) |
| Dataset | Your production dataset, matching `NEXT_PUBLIC_SANITY_DATASET` |
| HTTP method | POST |
| Trigger on | Create, Update, Delete |
| Projection | `{_id, _type}` |
| Secret | The same value as `SANITY_REVALIDATE_SECRET` in Vercel |
| Drafts / Versions | Disabled |
| Enabled | Yes |

Use this filter:

```groq
_type in ["product", "category", "collection", "guide", "merchant", "homepageSettings", "sanity.imageAsset"] &&
!(_id in path("drafts.**")) && !(_id in path("versions.**"))
```

4. Publish a test product. Check the webhook delivery log for HTTP 200 and `{"revalidated":true}`, then open a fresh page load of its URL and the product list. New product slugs are generated on demand; no full redeploy is needed. Also test an edit, a category/merchant change, and unpublishing or deleting a test product. Saving a draft must not invalidate the public cache.

Updates normally become available within seconds of successful webhook delivery, including a short propagation delay. This does not push updates into already-open browser tabs: reload the page to discard prefetched/browser-cached content. Product visibility still requires Publish and the required fields in the storefront query. The assistants create drafts, so their approval button alone does not publish a product.

If delivery fails, verify the exact URL (avoid redirects), environment variable, dataset, and matching secret. HTTP 503 means the server secret is missing, 401 indicates a signature problem, and 500 means cache invalidation failed. Retry the delivery after correcting the problem. Do not point the production webhook at localhost or a protected preview deployment.

Implementation reference: [Sanity webhook validation](https://www.sanity.io/docs/nextjs/validating-sanity-webhooks-nextjs).

Run `npm run test:sanity-webhook` on Node 22.20+ to check the handler's authentication decisions, draft/version exclusions, tag expiration, and error responses. These isolated tests mock the framework and signature parser; the production delivery smoke test above is still required to verify the real signature and cache integration.
