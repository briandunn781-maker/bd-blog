import { useState } from "react";
import api, { errorMessage } from "../api/client.js";
import SocialLinks from "../components/SocialLinks.jsx";
import Turnstile from "../components/Turnstile.jsx";
import { ErrorBox } from "../components/Status.jsx";
import { site } from "../config/site.js";

const SUBJECT = "Hello from BD Blog";
const mailtoFor = (email) =>
  `mailto:${email}?subject=${encodeURIComponent(SUBJECT)}`;

const primaryBtn =
  "rounded-md bg-gold px-4 py-2 text-sm font-semibold text-on-gold hover:bg-gold-hover disabled:pointer-events-none disabled:opacity-50";
const secondaryBtn =
  "rounded-md border border-line-strong px-4 py-2 text-sm font-medium enabled:hover:border-gold enabled:hover:text-gold-ink disabled:opacity-50";

export default function Contact() {
  const [email, setEmail] = useState(null);
  const [token, setToken] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // The address is not in the site's code: the API hands it over only after the bot check passes
  async function reveal() {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/contact/reveal-email", { token });
      setEmail(data.email);
      return data.email;
    } catch (err) {
      setError(errorMessage(err));
      // Tokens are single-use, so ask Turnstile for a fresh one
      setToken(null);
      setResetKey((k) => k + 1);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function sendEmail() {
    const address = await reveal();
    if (address) window.location.href = mailtoFor(address);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        "Could not copy automatically; select the address above instead"
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <title>{`Contact · BD Blog`}</title>

      <p className="mb-2 text-xs font-semibold tracking-[0.25em] text-gold-ink uppercase">
        Contact me
      </p>
      <h1 className="font-display text-4xl font-bold sm:text-5xl">
        Let’s talk
      </h1>
      <p className="mt-4 text-lg text-muted">
        Questions about a post, ideas for collaboration, or just want to say hi?
        Email is the best way to reach me.
      </p>

      <div className="mt-10 rounded-xl border border-line border-t-2 border-t-gold bg-surface p-6">
        <p className="text-sm font-medium text-muted">Email</p>

        {email ? (
          <>
            <p className="mt-1 font-display text-2xl font-bold break-all sm:text-3xl">
              {email}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={mailtoFor(email)} className={primaryBtn}>
                Send an email
              </a>
              <button onClick={copyEmail} className={secondaryBtn}>
                {copied ? "Copied!" : "Copy address"}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Opens your default mail app. If nothing happens, copy the address
              instead.
            </p>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted"></p>
            <div className="mt-4">
              <Turnstile
                resetKey={resetKey}
                onToken={setToken}
                onError={setError}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={sendEmail}
                disabled={!token || busy}
                className={primaryBtn}
              >
                {busy ? "Checking…" : "Send an email"}
              </button>
              <button
                onClick={reveal}
                disabled={!token || busy}
                className={secondaryBtn}
              >
                Show address
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4">
            <ErrorBox>{error}</ErrorBox>
          </div>
        )}
      </div>

      {site.socials.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Find me elsewhere</h2>
          <div className="mt-2 mb-5 h-px w-12 bg-gold" />
          <SocialLinks />
        </section>
      )}
    </div>
  );
}
