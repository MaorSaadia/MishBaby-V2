const searchStopWords = new Set([
  "a",
  "an",
  "and",
  "best",
  "by",
  "for",
  "from",
  "in",
  "new",
  "of",
  "on",
  "the",
  "to",
  "top",
  "with",
]);

const babyMonitorPositiveTerms = new Set([
  "audio",
  "camera",
  "crib",
  "infant",
  "night",
  "nursery",
  "screen",
  "video",
  "vision",
]);

const babyMonitorTransportTerms = new Set([
  "car",
  "carplay",
  "dash",
  "dashcam",
  "rear",
  "rearview",
  "vehicle",
]);

const climateMonitorTerms = new Set([
  "barometer",
  "hygrometer",
  "humidity",
  "thermometer",
]);

const accessoryTerms = new Set([
  "arm",
  "bracket",
  "cable",
  "case",
  "clip",
  "holder",
  "mount",
  "protector",
  "replacement",
  "stand",
]);

const babyMonitorSpecialtyTerms = new Set([
  "doppler",
  "fetal",
  "gel",
  "module",
  "prenatal",
]);

const bottleWarmerBabyTerms = new Set([
  "baby",
  "breastmilk",
  "feeding",
  "formula",
  "infant",
  "milk",
  "newborn",
]);

const bottleWarmerUnrelatedTerms = new Set([
  "battery",
  "essential",
  "massage",
  "oil",
  "sports",
  "watch",
]);

const diaperBagBabyTerms = new Set([
  "baby",
  "changing",
  "infant",
  "maternity",
  "mom",
  "mommy",
  "mum",
  "mummy",
  "nappy",
  "newborn",
  "nursery",
  "parent",
  "stroller",
  "toddler",
]);

const diaperBagFashionTerms = new Set([
  "clutch",
  "designer",
  "elegant",
  "fashion",
  "handbag",
  "leather",
  "luxury",
  "messenger",
  "purse",
]);

const diaperBagStrongBabyTerms = new Set([
  "baby",
  "maternity",
  "mommy",
  "mummy",
  "nappy",
  "stroller",
]);

const toyPhotographyTerms = new Set([
  "decoration",
  "photo",
  "photography",
  "prop",
  "props",
  "studio",
]);

const clothingUnrelatedTerms = new Set([
  "doll",
  "laundry",
  "machine",
  "pet",
  "washing",
]);

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function meaningfulTerms(query: string) {
  const terms = normalizeText(query).split(" ").filter(Boolean);
  const filtered = terms.filter((term) => !searchStopWords.has(term));
  return [...new Set(filtered.length > 0 ? filtered : terms)];
}

function termMatches(term: string, titleTerms: Set<string>) {
  if (titleTerms.has(term)) return true;
  if (term.length < 4) return false;
  return [...titleTerms].some((candidate) => (
    candidate === `${term}s`
    || candidate === `${term}es`
    || term === `${candidate}s`
    || term === `${candidate}es`
  ));
}

function hasAny(titleTerms: Set<string>, candidates: Set<string>) {
  return [...candidates].some((term) => titleTerms.has(term));
}

function scoreTitle(title: string, query: string) {
  const normalizedTitle = normalizeText(title);
  const queryTerms = meaningfulTerms(query);
  if (!normalizedTitle || queryTerms.length === 0) return null;

  const titleTerms = new Set(normalizedTitle.split(" "));
  const matchedTerms = queryTerms.filter((term) => termMatches(term, titleTerms));
  const requiredMatches = queryTerms.length <= 2
    ? queryTerms.length
    : Math.ceil(queryTerms.length * 0.75);
  if (matchedTerms.length < requiredMatches) return null;

  const queryPhrase = queryTerms.join(" ");
  const exactPhrase = normalizedTitle.includes(queryPhrase);
  let score = matchedTerms.length * 30 + (matchedTerms.length / queryTerms.length) * 50;
  if (exactPhrase) score += 120;

  const isBabyMonitorSearch = queryTerms.includes("baby") && queryTerms.includes("monitor");
  if (isBabyMonitorSearch) {
    if (hasAny(titleTerms, babyMonitorTransportTerms)) return null;
    if (hasAny(titleTerms, climateMonitorTerms) && !hasAny(titleTerms, babyMonitorPositiveTerms)) return null;
    if (hasAny(titleTerms, accessoryTerms) || hasAny(titleTerms, babyMonitorSpecialtyTerms)) return null;
    if (!hasAny(titleTerms, babyMonitorPositiveTerms)) return null;
    score += [...babyMonitorPositiveTerms].filter((term) => titleTerms.has(term)).length * 10;
  }

  const isBottleWarmerSearch = queryTerms.includes("bottle") && queryTerms.includes("warmer");
  if (isBottleWarmerSearch) {
    if (!hasAny(titleTerms, bottleWarmerBabyTerms) || hasAny(titleTerms, bottleWarmerUnrelatedTerms)) return null;
    score += [...bottleWarmerBabyTerms].filter((term) => titleTerms.has(term)).length * 10;
  }

  const isDiaperBagSearch = queryTerms.includes("diaper") && queryTerms.includes("bag");
  if (isDiaperBagSearch) {
    if (!hasAny(titleTerms, diaperBagBabyTerms)) return null;
    if (hasAny(titleTerms, diaperBagFashionTerms) && !hasAny(titleTerms, diaperBagStrongBabyTerms)) return null;
    score += [...diaperBagBabyTerms].filter((term) => titleTerms.has(term)).length * 10;
  }

  const isInfantToySearch = queryTerms.includes("infant") && queryTerms.includes("toy");
  if (isInfantToySearch && hasAny(titleTerms, toyPhotographyTerms)) return null;

  const isInfantClothingSearch = queryTerms.includes("infant") && (queryTerms.includes("clothes") || queryTerms.includes("clothing"));
  if (isInfantClothingSearch && hasAny(titleTerms, clothingUnrelatedTerms)) return null;

  return score;
}

export function rankAliExpressResults<T extends { title: string }>(items: T[], query: string, limit = 10) {
  return items
    .map((item, index) => ({ item, index, score: scoreTitle(item.title, query) }))
    .filter((entry): entry is { item: T; index: number; score: number } => entry.score !== null)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ item }) => item);
}
