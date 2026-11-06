"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export function MetaPixelProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pixelConfig, setPixelConfig] = useState<{
    isActive: boolean;
    pixelId: string;
    trackPageView: boolean;
  }>({
    isActive: false,
    pixelId: "",
    trackPageView: true,
  });

  useEffect(() => {
    // 1. Fetch public settings for Meta Pixel
    fetch("/api/settings/public")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          const isActive = data.settings.meta_ads_active === "true";
          const pixelId = data.settings.meta_pixel_id || "";
          const trackPageView = data.settings.meta_track_pageview !== "false";
          setPixelConfig({ isActive, pixelId, trackPageView });
        }
      })
      .catch(() => {});

    // 2. Capture fbclid and store _fbc cookie
    const fbclid = searchParams?.get("fbclid");
    if (fbclid && typeof document !== "undefined") {
      const creationTime = Date.now();
      const fbcValue = `fb.1.${creationTime}.${fbclid}`;
      document.cookie = `_fbc=${fbcValue};path=/;max-age=${90 * 24 * 60 * 60};SameSite=Lax`;
    }

    // 3. Ensure _fbp cookie exists
    if (typeof document !== "undefined" && !document.cookie.includes("_fbp=")) {
      const creationTime = Date.now();
      const randomSubId = Math.floor(Math.random() * 10000000000);
      const fbpValue = `fb.1.${creationTime}.${randomSubId}`;
      document.cookie = `_fbp=${fbpValue};path=/;max-age=${90 * 24 * 60 * 60};SameSite=Lax`;
    }
  }, [searchParams]);

  // Track PageView on route change
  useEffect(() => {
    if (
      pixelConfig.isActive &&
      pixelConfig.pixelId &&
      pixelConfig.trackPageView &&
      typeof window !== "undefined" &&
      window.fbq
    ) {
      // Do not track internal admin pages
      if (!pathname?.startsWith("/admin")) {
        window.fbq("track", "PageView");
      }
    }
  }, [pathname, pixelConfig]);

  if (!pixelConfig.isActive || !pixelConfig.pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
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
            fbq('init', '${pixelConfig.pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelConfig.pixelId}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  );
}

/**
 * Client-side helper to track custom or standard Meta events with deduplication ID.
 */
export function trackMetaClientEvent(
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead" | "CompleteRegistration" | string,
  parameters?: Record<string, any>,
  eventId?: string
) {
  if (typeof window !== "undefined" && window.fbq) {
    if (eventId) {
      window.fbq("track", eventName, parameters || {}, { eventID: eventId });
    } else {
      window.fbq("track", eventName, parameters || {});
    }
  }
}
