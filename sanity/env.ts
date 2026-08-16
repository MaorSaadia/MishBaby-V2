export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
export const isSanityConfigured = sanityProjectId.length > 0;

// Sanity validates these values while the Studio bundle is built. The fallback
// is used only for the local setup screen and never makes a network request.
export const studioProjectId = sanityProjectId || "mishbaby";
