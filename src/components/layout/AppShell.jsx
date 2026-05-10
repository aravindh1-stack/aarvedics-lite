/**
 * App chrome: sticky nav + centered main region on a soft gradient background.
 * Compose with `logo` / `navRight` slots; pages supply Firebase-unrelated UI only.
 */
export default function AppShell({
  logo,
  navRight,
  children,
  contentClassName = "",
}) {
  return (
    <div className="relative min-h-screen">
      {/* Background: layered gradient + subtle noise-like grid */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(1200px 600px at 50% -10%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%),
              radial-gradient(900px 480px at 100% 0%, color-mix(in srgb, #4f9cf9 14%, transparent), transparent 50%),
              linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--surface-2) 65%, var(--background)) 100%)
            `,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--text-primary) 10%, transparent) 1px, transparent 0)
            `,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "color-mix(in srgb, var(--surface) 82%, transparent)",
        }}
      >
        <div className="brand-container flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">{logo}</div>
          <div className="flex shrink-0 items-center gap-2">{navRight}</div>
        </div>
      </header>

      <main className={`relative ${contentClassName}`}>
        <div className="brand-container brand-section">{children}</div>
      </main>
    </div>
  );
}
