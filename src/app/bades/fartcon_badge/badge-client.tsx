"use client";

import Script from "next/script";

declare global {
  interface Window {
    newBadge?: () => void;
  }
}

export default function BadgeClient() {
  return (
    <>
      <div id="badge"></div>
      <div className="btn-row">
        <button type="button" onClick={() => window.newBadge?.()}>
          roll new badge
        </button>
      </div>
      <Script src="/bades/fartcon_badge/script.js" strategy="afterInteractive" />
    </>
  );
}
