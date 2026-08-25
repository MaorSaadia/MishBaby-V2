import { createHmac, randomUUID } from "node:crypto";

const endpoint = "https://api-sg.aliexpress.com/sync";
const queries = ["baby monitor", "bottle warmer", "diaper bag"];
const endpoints = [
  { label: "Standard product query", method: "aliexpress.affiliate.product.query" },
  { label: "Smart Match", method: "aliexpress.affiliate.product.smartmatch" },
  { label: "Hot Products", method: "aliexpress.affiliate.hotproduct.query" },
];

const stopWords = new Set(["a", "an", "and", "best", "by", "for", "from", "in", "new", "of", "on", "the", "to", "top", "with"]);

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local before running this comparison.`);
  return value;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function meaningfulTerms(query) {
  const terms = normalize(query).split(" ").filter(Boolean);
  const filtered = terms.filter((term) => !stopWords.has(term));
  return [...new Set(filtered.length > 0 ? filtered : terms)];
}

function termMatches(term, titleTerms) {
  if (titleTerms.has(term)) return true;
  if (term.length < 4) return false;
  return [...titleTerms].some((candidate) => (
    candidate === `${term}s`
    || candidate === `${term}es`
    || term === `${candidate}s`
    || term === `${candidate}es`
  ));
}

function relevanceScore(title, query) {
  const normalizedTitle = normalize(title);
  const queryTerms = meaningfulTerms(query);
  if (!normalizedTitle || queryTerms.length === 0) return null;

  const titleTerms = new Set(normalizedTitle.split(" "));
  const matches = queryTerms.filter((term) => termMatches(term, titleTerms));
  const requiredMatches = queryTerms.length <= 2 ? queryTerms.length : Math.ceil(queryTerms.length * 0.75);
  if (matches.length < requiredMatches) return null;

  return matches.length * 30
    + (matches.length / queryTerms.length) * 50
    + (normalizedTitle.includes(queryTerms.join(" ")) ? 120 : 0);
}

function sign(parameters, secret) {
  const signatureInput = Object.entries(parameters)
    .filter(([key, value]) => key !== "sign" && value.length > 0)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}${value}`)
    .join("");

  return createHmac("sha256", secret).update(signatureInput, "utf8").digest("hex").toUpperCase();
}

function responseName(method) {
  return `${method.replaceAll(".", "_")}_response`;
}

function productsFrom(response, method) {
  const products = response?.[responseName(method)]?.resp_result?.result?.products;
  if (Array.isArray(products)) return products;
  if (products && typeof products === "object") {
    const entries = products.product;
    return Array.isArray(entries) ? entries : entries && typeof entries === "object" ? [entries] : [];
  }
  return [];
}

function hasValidPromotionLink(product) {
  try {
    const url = new URL(String(product?.promotion_link ?? ""));
    return url.protocol === "https:"
      && (url.hostname === "aliexpress.com" || url.hostname.endsWith(".aliexpress.com"));
  } catch {
    return false;
  }
}

function endpointParameters(method, query) {
  const shared = {
    keywords: query,
    page_no: "1",
    target_language: "EN",
    tracking_id: trackingId,
  };

  if (method === "aliexpress.affiliate.product.smartmatch") {
    return {
      ...shared,
      app: "mishbaby",
      site: "mishbaby.com",
      device: "server-diagnostic",
      device_id: randomUUID(),
    };
  }

  return {
    ...shared,
    page_size: "50",
    platform_product_type: "ALL",
  };
}

async function callEndpoint(method, query) {
  const parameters = {
    method,
    app_key: appKey,
    sign_method: "sha256",
    timestamp: String(Date.now()),
    format: "json",
    simplify: "false",
    ...endpointParameters(method, query),
  };
  parameters.sign = sign(parameters, appSecret);

  const result = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(parameters),
    signal: AbortSignal.timeout(15_000),
  });
  if (!result.ok) return { ok: false, error: `HTTP ${result.status}` };

  const response = await result.json();
  const root = response?.[responseName(method)]?.resp_result;
  if (Number(root?.resp_code) !== 200) {
    const code = response?.error_response?.code ?? root?.resp_code;
    return { ok: false, error: code ? `AliExpress code ${code}` : "request rejected" };
  }

  const products = productsFrom(response, method);
  const attributed = products.filter(hasValidPromotionLink);
  const relevant = attributed
    .map((product, index) => ({
      index,
      title: String(product?.product_title ?? "").trim().replace(/\s+/g, " "),
      score: relevanceScore(product?.product_title, query),
    }))
    .filter((product) => product.title && product.score !== null)
    .sort((left, right) => right.score - left.score || left.index - right.index);

  return {
    ok: true,
    returned: products.length,
    attributed: attributed.length,
    relevant: relevant.length,
    titles: relevant.slice(0, 5).map(({ title }) => title.slice(0, 120)),
  };
}

let appKey;
let appSecret;
let trackingId;

try {
  appKey = requiredEnvironment("ALIEXPRESS_APP_KEY");
  appSecret = requiredEnvironment("ALIEXPRESS_APP_SECRET");
  trackingId = requiredEnvironment("ALIEXPRESS_TRACKING_ID");

  console.log("AliExpress advanced API relevance comparison");
  console.log("No credentials, URLs, raw responses, or persistent device identifiers are printed.\n");

  for (const query of queries) {
    console.log(`Query: ${query}`);
    for (const api of endpoints) {
      const result = await callEndpoint(api.method, query);
      if (!result.ok) {
        console.log(`  ${api.label}: unavailable (${result.error})`);
        continue;
      }

      console.log(`  ${api.label}: ${result.relevant}/${result.returned} relevant, ${result.attributed} valid affiliate links`);
      for (const title of result.titles) console.log(`    - ${title}`);
    }
    console.log("");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "AliExpress advanced API comparison failed.");
  process.exitCode = 1;
}
