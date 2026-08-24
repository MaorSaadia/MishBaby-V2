import { createHmac } from "node:crypto";

const endpoint = "https://api-sg.aliexpress.com/sync";
const method = "aliexpress.affiliate.product.query";

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local before running this check.`);
  return value;
}

function formatIopTimestamp(date = new Date()) {
  return String(date.getTime());
}

function sign(parameters, secret) {
  const signatureInput = Object.entries(parameters)
    .filter(([key, value]) => key !== "sign" && value.length > 0)
    .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    .map(([key, value]) => `${key}${value}`)
    .join("");
  return createHmac("sha256", secret).update(signatureInput, "utf8").digest("hex").toUpperCase();
}

function productsFrom(response) {
  const products = response?.aliexpress_affiliate_product_query_response?.resp_result?.result?.products;
  if (Array.isArray(products)) return products;
  if (products && typeof products === "object") {
    const values = products.product;
    return Array.isArray(values) ? values : values && typeof values === "object" ? [values] : [];
  }
  return [];
}

try {
  const appKey = requiredEnvironment("ALIEXPRESS_APP_KEY");
  const appSecret = requiredEnvironment("ALIEXPRESS_APP_SECRET");
  const trackingId = requiredEnvironment("ALIEXPRESS_TRACKING_ID");
  const query = process.argv.slice(2).join(" ").trim() || "baby bottle";
  if (query.length < 2 || query.length > 80) throw new Error("The optional test search must contain 2 to 80 characters.");

  const parameters = {
    method,
    app_key: appKey,
    sign_method: "sha256",
    timestamp: formatIopTimestamp(),
    format: "json",
    simplify: "false",
    keywords: query,
    page_no: "1",
    page_size: "3",
    platform_product_type: "ALL",
    target_language: "EN",
    tracking_id: trackingId,
  };
  parameters.sign = sign(parameters, appSecret);

  const result = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams(parameters),
    signal: AbortSignal.timeout(12_000),
  });
  if (!result.ok) throw new Error(`The gateway returned HTTP ${result.status}.`);

  const response = await result.json();
  const responseRoot = response?.aliexpress_affiliate_product_query_response?.resp_result;
  if (Number(responseRoot?.resp_code) !== 200) {
    const topCode = response?.error_response?.code;
    throw new Error(`AliExpress rejected the request${topCode ? ` with code ${topCode}` : ""}. Confirm the gateway and product-query permission in the app console.`);
  }

  const products = productsFrom(response);
  const attributedProducts = products.filter((product) => {
    try {
      const url = new URL(String(product?.promotion_link ?? ""));
      return url.protocol === "https:" && (url.hostname === "aliexpress.com" || url.hostname.endsWith(".aliexpress.com"));
    } catch {
      return false;
    }
  });

  console.log("AliExpress Affiliate API smoke test succeeded.");
  console.log(`Returned products: ${products.length}`);
  console.log(`Products with valid HTTPS promotion links: ${attributedProducts.length}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "AliExpress Affiliate API smoke test failed.");
  process.exitCode = 1;
}
