"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    paypal?: {
      HostedButtons: (opts: { hostedButtonId: string }) => {
        render: (selector: string) => void;
      };
    };
  }
}

const SDK_ID = "paypal-hosted-sdk";

// Renders PayPal's official hosted button via the JS SDK. If the SDK fails to
// load or the IDs aren't configured, it gracefully falls back to a styled link
// to the same checkout (fallbackUrl), so the CTA always works.
export function PayPalButton({
  clientId,
  hostedButtonId,
  fallbackUrl,
  label = "Reserve my founding spot — $29 refundable",
}: {
  clientId?: string;
  hostedButtonId?: string;
  fallbackUrl?: string;
  label?: string;
}) {
  const rendered = useRef(false);
  const [failed, setFailed] = useState(false);
  const containerId = hostedButtonId
    ? `paypal-container-${hostedButtonId}`
    : "paypal-container";

  useEffect(() => {
    if (!clientId || !hostedButtonId) {
      setFailed(true);
      return;
    }
    let cancelled = false;

    function doRender() {
      if (rendered.current || cancelled) return;
      if (!document.getElementById(containerId) || !window.paypal?.HostedButtons)
        return;
      try {
        window.paypal
          .HostedButtons({ hostedButtonId: hostedButtonId as string })
          .render(`#${containerId}`);
        rendered.current = true;
      } catch {
        setFailed(true);
      }
    }

    if (window.paypal?.HostedButtons) {
      doRender();
      return;
    }

    let script = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = SDK_ID;
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        clientId
      )}&components=hosted-buttons&disable-funding=venmo&currency=USD`;
      script.crossOrigin = "anonymous";
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", doRender);
    script.addEventListener("error", () => setFailed(true));

    return () => {
      cancelled = true;
      script?.removeEventListener("load", doRender);
    };
  }, [clientId, hostedButtonId, containerId]);

  if (failed || !clientId || !hostedButtonId) {
    if (fallbackUrl) {
      return (
        <Button asChild size="lg">
          <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </Button>
      );
    }
    return null;
  }

  return <div id={containerId} className="min-h-[3rem] w-full max-w-xs" />;
}
