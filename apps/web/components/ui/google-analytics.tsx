"use client";

import Script from "next/script";
import type { FC } from "react";

interface GoogleAnalyticsProps {
  gaIds: string[];
}

const GoogleAnalytics: FC<GoogleAnalyticsProps> = ({ gaIds }) => {
  if (gaIds.length === 0) {
    return null;
  }

  return (
    <>
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaIds[0]}`}
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            ${gaIds.map((id) => `gtag('config', '${id}', { page_path: window.location.pathname });`).join("\n")}
          `,
        }}
      />
    </>
  );
};

export default GoogleAnalytics;
