import type { Merchant, Offer, Product } from "./products";

type Catalog = {
  merchants: Merchant[];
  products: Product[];
  offers: Offer[];
};

function findDuplicates(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isSecureUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validateCatalog({ merchants, products, offers }: Catalog) {
  const errors: string[] = [];
  const merchantIds = new Set(merchants.map((merchant) => merchant.id));
  const productIds = new Set(products.map((product) => product.id));

  const uniqueFields = [
    ["merchant ID", merchants.map((merchant) => merchant.id)],
    ["product ID", products.map((product) => product.id)],
    ["product slug", products.map((product) => product.slug)],
    ["offer ID", offers.map((offer) => offer.id)],
  ] as const;

  for (const [label, values] of uniqueFields) {
    const duplicates = findDuplicates(values);
    if (duplicates.length > 0) errors.push(`Duplicate ${label}: ${duplicates.join(", ")}`);
  }

  for (const offer of offers) {
    if (!productIds.has(offer.productId)) {
      errors.push(`Offer "${offer.id}" references unknown product "${offer.productId}".`);
    }

    if (!merchantIds.has(offer.merchantId)) {
      errors.push(`Offer "${offer.id}" references unknown merchant "${offer.merchantId}".`);
    }

    if (offer.status === "active") {
      if (!isSecureUrl(offer.url)) {
        errors.push(`Active offer "${offer.id}" must have a valid HTTPS URL.`);
      }

      if (!isValidDate(offer.lastVerifiedAt)) {
        errors.push(`Active offer "${offer.id}" must have a valid lastVerifiedAt date in YYYY-MM-DD format.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid MishBaby catalog:\n- ${errors.join("\n- ")}`);
  }
}
