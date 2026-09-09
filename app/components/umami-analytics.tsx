import Script from "next/script";

const umamiWebsiteIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const privacyFilterScript = `window.mishbabyUmamiBeforeSend = function (type, payload) {
  try {
    if (!payload || typeof payload.url !== "string") return payload;
    var path = new URL(payload.url, window.location.origin).pathname;
    var excludedPaths = ["/account", "/forgot-password", "/sign-in", "/sign-up", "/update-password"];
    var excludedPrefixes = ["/api", "/auth", "/studio"];
    var isExcluded = excludedPaths.indexOf(path) !== -1 || excludedPrefixes.some(function (prefix) {
      return path === prefix || path.indexOf(prefix + "/") === 0;
    });
    return isExcluded ? false : payload;
  } catch (_) {
    return false;
  }
};`;

export function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();

  if (!websiteId || !umamiWebsiteIdPattern.test(websiteId)) return null;

  return (
    <>
      <Script id="mishbaby-umami-privacy-filter" strategy="beforeInteractive">
        {privacyFilterScript}
      </Script>
      <Script
        id="mishbaby-umami-analytics"
        src="https://cloud.umami.is/script.js"
        strategy="afterInteractive"
        data-website-id={websiteId}
        data-domains="mishbaby.com,www.mishbaby.com"
        data-exclude-search="true"
        data-exclude-hash="true"
        data-do-not-track="true"
        data-performance="true"
        data-before-send="mishbabyUmamiBeforeSend"
      />
    </>
  );
}
