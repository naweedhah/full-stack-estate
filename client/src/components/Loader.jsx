import { useState, useEffect } from "react";

/**
 * Loading UI with orbit rings, logo, shimmer title, tips rotation, and indeterminate bar.
 * @param {"fullscreen" | "inline" | "overlay"} variant
 */
export default function Loader({
  variant = "fullscreen",
  title = "SLIIT Stay",
  subtitle = "Preparing your experience…",
  tips = [
    "Mapping boardings by distance from campus",
    "Verifying your secure session",
    "Polishing the last details for you",
  ],
  className = "",
}) {
  const [logoSrc, setLogoSrc] = useState("/logo.png");
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (tips.length <= 1) return undefined;
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length);
    }, 2800);
    return () => clearInterval(id);
  }, [tips.length]);

  const isInline = variant === "inline";
  const isOverlay = variant === "overlay";

  const shell =
    variant === "inline"
      ? `relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-emerald-100/80 bg-white/90 px-6 py-14 shadow-lg shadow-emerald-900/5 backdrop-blur ${className}`
      : `fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden ${className}`;

  const titleClass = isInline
    ? "mt-8 max-w-xs text-center font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl loader-title-inline"
    : "mt-8 max-w-xs text-center font-display text-xl font-bold tracking-tight sm:text-2xl loader-title-dark";

  const subClass = isInline
    ? "mt-2 max-w-sm text-center text-sm font-medium text-slate-600"
    : "mt-2 max-w-sm text-center text-sm font-medium text-emerald-100/85";

  const tipClass = isInline
    ? "mt-5 max-w-[280px] text-center text-xs text-slate-500 motion-safe:animate-slide-up"
    : "mt-5 max-w-[280px] text-center text-xs text-slate-300/90 motion-safe:animate-slide-up";

  const barTrack = isInline ? "bg-emerald-100" : "bg-white/10";

  return (
    <div
      className={shell}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={subtitle}
    >
      {!isInline && !isOverlay && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950 via-emerald-950/90 to-slate-900" />
          <div className="pointer-events-none absolute -left-1/4 top-0 h-[70vh] w-[70vh] rounded-full bg-emerald-500/25 blur-[100px] motion-safe:animate-pulse-soft" />
          <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[60vh] w-[60vh] rounded-full bg-cyan-400/20 blur-[90px] motion-safe:animate-pulse-soft" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </>
      )}

      {isOverlay && (
        <div className="pointer-events-none absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
      )}

      <div className="relative flex flex-col items-center">
        <div className="relative flex h-40 w-40 items-center justify-center sm:h-44 sm:w-44">
          <span
            className={`absolute h-[7.5rem] w-[7.5rem] rounded-full border-2 border-t-transparent motion-safe:animate-spin sm:h-[8.25rem] sm:w-[8.25rem] ${
              isInline
                ? "border-emerald-200 border-t-emerald-500 shadow-md shadow-emerald-500/15"
                : "border-emerald-400/30 border-t-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
            }`}
            style={{ animationDuration: "3.1s" }}
          />
          <span
            className={`absolute h-[6.25rem] w-[6.25rem] rounded-full border-2 border-r-transparent motion-safe:animate-spin sm:h-28 sm:w-28 ${
              isInline
                ? "border-teal-100 border-r-teal-500"
                : "border-teal-400/25 border-r-teal-300"
            }`}
            style={{ animationDuration: "3.7s", animationDirection: "reverse" }}
          />
          <span
            className={`absolute h-[5rem] w-[5rem] rounded-full border border-b-transparent motion-safe:animate-spin ${
              isInline
                ? "border-cyan-100 border-b-cyan-400"
                : "border-cyan-300/40 border-b-transparent"
            }`}
            style={{ animationDuration: "3.4s" }}
          />

          <div
            className={`relative z-10 flex h-[4.25rem] w-[4.25rem] items-center justify-center overflow-hidden rounded-full p-[2px] shadow-xl motion-safe:animate-pulse-soft sm:h-[4.75rem] sm:w-[4.75rem] ${
              isInline
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/25"
                : "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/40"
            }`}
          >
            <div
              className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full ring-1 ${
                isInline ? "bg-white ring-emerald-100" : "bg-slate-900/90 ring-white/20"
              }`}
            >
              <img
                src={logoSrc}
                alt=""
                width={56}
                height={56}
                className="h-[85%] w-[85%] object-cover"
                onError={() => setLogoSrc("/logo.svg")}
              />
            </div>
          </div>
        </div>

        <h2 className={titleClass}>{title}</h2>
        <p className={subClass}>{subtitle}</p>

        <div
          className={`mt-8 h-1 w-48 overflow-hidden rounded-full sm:w-56 ${barTrack}`}
        >
          <div
            className={`loader-progress h-full w-1/2 rounded-full ${
              isInline
                ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                : "bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400"
            }`}
          />
        </div>

        <p key={tipIndex} className={tipClass}>
          {tips[tipIndex]}
        </p>
      </div>

      <style>{`
        @keyframes loader-shimmer-light {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes loader-shimmer-dark {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .loader-title-inline {
          background: linear-gradient(90deg, #047857 0%, #0d9488 40%, #047857 90%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: loader-shimmer-light 2.5s ease-in-out infinite;
        }
        .loader-title-dark {
          background: linear-gradient(90deg, #ecfdf5 0%, #5eead4 45%, #ecfdf5 90%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: loader-shimmer-dark 2.5s ease-in-out infinite;
        }
        @keyframes loader-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .loader-progress {
          animation: loader-progress 1.15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/** Compact row for cards and small surfaces */
export function LoaderInline({ label = "Loading…" }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-2">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500 motion-safe:animate-pulse"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-500 motion-safe:animate-pulse"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
