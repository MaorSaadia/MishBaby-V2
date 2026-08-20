# MishBaby

MishBaby is a modern baby-product discovery and affiliate website built with Next.js, TypeScript, Tailwind CSS, Sanity, and Supabase Auth.

The public storefront reads published products, categories, guides, merchants, and affiliate offers from Sanity. The embedded Studio at `/studio` provides content editing plus guided Gemini assistants for products and guides.

## Local development

Requirements:

- A current Node.js LTS release
- Access to the MishBaby Sanity project
- A Gemini API key if you need the Studio assistants
- Access to the MishBaby Supabase project if you need account features

Copy `.env.example` to `.env.local`, fill in the required values, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/studio](http://localhost:3000/studio) for the CMS.

## Environment variables

| Variable | Required | Visibility | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Public | Connects the storefront and Studio to the Sanity project. |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Public | Selects the Sanity dataset, normally `production`. |
| `GEMINI_API_KEY` | For AI assistants | Server only | Generates product and guide drafts inside Studio. |
| `GEMINI_MODEL` | No | Server only | Overrides the assistants' default Gemini model. |
| `NEXT_PUBLIC_SUPABASE_URL` | For accounts | Public | Connects the browser and server auth clients to Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | For accounts | Public | Authorizes public Supabase Auth operations. |
| `SUPABASE_SECRET_KEY` | For accounts | Server only | Allows authenticated server actions to manage private account data. |
| `NEXT_PUBLIC_SITE_URL` | For accounts | Public | Absolute origin used in OAuth and authentication email redirects. |
| `RESEND_MARKETING_API_KEY` | For marketing contact sync | Server only | Synchronizes opted-in account contacts with Resend. |
| `RESEND_MARKETING_SEGMENT_ID` | For marketing contact sync | Server only | Identifies the Resend segment used for MishBaby updates. |
| `RESEND_WEBHOOK_SECRET` | For marketing contact sync | Server only | Verifies Resend contact webhook signatures. |

Never commit `.env.local`. Variables prefixed with `NEXT_PUBLIC_` are bundled into browser code and must not contain secrets.

## Verification

```bash
npm run lint
npm run build
```

The production build validates the Sanity connection and prerenders the current public catalog routes.

## Deployment

MishBaby requires a full Next.js deployment because it uses route handlers, ISR, image optimization, and the embedded Studio. Static export is not supported.

Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for the Vercel environment, domain, Sanity CORS, and post-deployment checklist. Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for authentication, Google OAuth, Resend SMTP, marketing contact synchronization, and email-template setup.
