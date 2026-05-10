/**
 * Full-screen loading state — swap into AuthProvider / ProtectedRoute in Phase 3.
 */
export default function FullPageLoader({ message = "Loading…" }) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="relative h-9 w-9"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={message}
      >
        <span
          className="absolute inset-0 rounded-full border-2 opacity-25"
          style={{ borderColor: "var(--border)" }}
        />
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
          style={{
            borderTopColor: "var(--accent)",
            borderRightColor: "color-mix(in srgb, var(--accent) 35%, transparent)",
          }}
        />
      </div>
      {message ? (
        <p
          className="text-sm font-medium tracking-tight"
          style={{ color: "var(--text-muted)" }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
