/**
 * Inline error surface — use with forms or section-level failures.
 */
export default function ErrorBanner({
  children,
  className = "",
  role = "alert",
}) {
  return (
    <div
      role={role}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-snug ${className}`}
      style={{
        borderColor: "color-mix(in srgb, var(--danger) 28%, var(--border))",
        backgroundColor: "color-mix(in srgb, var(--danger) 8%, var(--surface))",
        color: "color-mix(in srgb, var(--danger) 92%, var(--text-primary))",
      }}
    >
      {children}
    </div>
  );
}
