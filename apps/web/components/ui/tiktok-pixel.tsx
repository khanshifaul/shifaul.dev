"use client";

import Script from "next/script";
import type { FC } from "react";

interface TikTokPixelProps {
  pixelIds: string[]; // ← array
}

const TikTokPixel: FC<TikTokPixelProps> = ({ pixelIds }) => {
  return (
    <Script
      id="tiktok-script-multi"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
            var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;
            var p=document.getElementsByTagName("script")[0];p.parentNode.insertBefore(s,p)};
            ${pixelIds.map((id) => `ttq.load('${id}');`).join("\n")}
            ttq.page();
          }(window, document, 'ttq');
        `,
      }}
    />
  );
};

export default TikTokPixel;
