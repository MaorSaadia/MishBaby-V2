This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MishBaby Content Studio

The Sanity Studio is embedded at [http://localhost:3000/studio](http://localhost:3000/studio). The public storefront still reads products from `lib/products.ts` until the separately planned CMS cutover.

1. Create a free Sanity project at [sanity.io/manage](https://www.sanity.io/manage).
2. Copy `.env.example` to `.env.local`.
3. Replace `your_project_id` with the project ID shown in Sanity. Keep the dataset as `production` unless you created it with another name.
4. Restart `npm run dev`, open `/studio`, and sign in with the Sanity account that owns the project.

Before the storefront cutover, create the Amazon and AliExpress merchants, then recreate the two published products and their offers in Studio for review.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
