import Script from "next/script";

/**
 * Optional, privacy-respecting analytics.
 *
 * Disabled unless the deployment sets the environment variables below, so
 * self-hosted builds and local development send nothing anywhere by default.
 * Both supported providers are cookieless and do not collect personal data,
 * which matters for a security audience that will (rightly) check.
 *
 *   Plausible:  NEXT_PUBLIC_PLAUSIBLE_DOMAIN=asm-cheatsheet.vercel.app
 *               NEXT_PUBLIC_PLAUSIBLE_HOST=https://plausible.io   (optional, for self-hosting)
 *   Umami:      NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid>
 *               NEXT_PUBLIC_UMAMI_HOST=https://analytics.example.com
 */
export function Analytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleHost =
    process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? "https://plausible.io";

  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiHost = process.env.NEXT_PUBLIC_UMAMI_HOST;

  if (plausibleDomain) {
    return (
      <Script
        defer
        data-domain={plausibleDomain}
        src={`${plausibleHost.replace(/\/$/, "")}/js/script.js`}
        strategy="afterInteractive"
      />
    );
  }

  if (umamiWebsiteId && umamiHost) {
    return (
      <Script
        defer
        data-website-id={umamiWebsiteId}
        src={`${umamiHost.replace(/\/$/, "")}/script.js`}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}
