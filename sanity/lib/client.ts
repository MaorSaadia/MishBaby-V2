import { createClient } from "next-sanity";
import { sanityDataset, sanityProjectId } from "../env";

if (!sanityProjectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID. Add it to .env.local before running the MishBaby storefront.");
}

export const sanityClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: "2026-08-16",
  perspective: "published",
  useCdn: false,
});
