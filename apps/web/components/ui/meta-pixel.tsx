"use client";

import Script from "next/script";
import type { FC } from "react";

interface MetaPixelProps {
  pixelIds: string[]; // ← array now
}

const MetaPixel: FC<MetaPixelProps> = ({ pixelIds }) => {
  return (
    <>
      <Script
        id="fb-script-multi"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${pixelIds.map((id) => `fbq('init', '${id}');`).join("\n")}
            fbq('track', 'PageView');
          `,
        }}
      />

      {/* One noscript tag per pixel */}
      {pixelIds.map((id) => (
        <noscript key={id}>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      ))}
    </>
  );
};

export default MetaPixel;
