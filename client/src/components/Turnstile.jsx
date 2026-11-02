import { useEffect, useRef } from "react";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
// Cloudflare's documented test site key (always passes). Used only in development.
const DEV_TEST_SITE_KEY = "1x00000000000000000000AA";
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || (import.meta.env.DEV ? DEV_TEST_SITE_KEY : "");

let scriptPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load the bot check, please refresh the page"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Cloudflare Turnstile bot check. Calls onToken(token) when passed and onToken(null) when it
// expires or fails. Tokens are single-use: change `resetKey` to get a fresh one.
export default function Turnstile({ onToken, onError, resetKey }) {
  const container = useRef(null);
  const callbacks = useRef({ onToken, onError });

  useEffect(() => {
    callbacks.current = { onToken, onError };
  });

  useEffect(() => {
    if (!siteKey) {
      callbacks.current.onError?.("Bot protection is not configured: set VITE_TURNSTILE_SITE_KEY");
      return;
    }
    let widgetId;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: (token) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(null),
          "error-callback": () => {
            callbacks.current.onToken(null);
            callbacks.current.onError?.("The bot check failed, please refresh the page");
          },
        });
      })
      .catch((err) => callbacks.current.onError?.(err.message));

    return () => {
      cancelled = true;
      if (widgetId !== undefined) window.turnstile?.remove(widgetId);
    };
  }, [resetKey]);

  return <div ref={container} className="min-h-[65px]" />;
}
