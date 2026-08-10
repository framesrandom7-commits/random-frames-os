"use client";

import Script from "next/script";

export function WebsiteAnalytics() {
  const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX";

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      
      {/* JSON-LD Structured Data for Local Business */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Random Frames Studio",
            "image": "https://randomframes.os/icon.jpg",
            "url": "https://randomframes.os",
            "telephone": "+15551234567",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "124 Cinematic Way",
              "addressLocality": "New York",
              "addressRegion": "NY",
              "postalCode": "10012",
              "addressCountry": "US"
            }
          })
        }}
      />
    </>
  );
}
