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

Use the same Sanity project and dataset for Production and Preview unless a separate test dataset is intentionally introduced later. `GEMINI_API_KEY` must remain server-only.

After changing either `NEXT_PUBLIC_` value, create a new deployment because public variables are fixed into the browser bundle at build time.

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
- A newly published Sanity change appears after the approximately one-minute cache refresh
- `/robots.txt` and `/sitemap.xml` use the production domain
- An unknown URL displays the custom 404 page

## 6. Production checks

- Confirm HTTPS is active before sharing the site publicly.
- Confirm the response includes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security`.
- Confirm `/studio` is not indexed and remains accessible only to approved Sanity members.
- Keep Vercel deployment logs free of Sanity or Gemini authentication errors.
- Rotate the Gemini key immediately if it is ever exposed.

A strict Content Security Policy is intentionally deferred. The embedded Sanity Studio loads several external resources, so its policy should be tested separately before enforcement rather than added broadly and risk breaking editorial access.
