/**
 * Empty list / zero-data panel — optional primary action.
 */
export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  actionProps = {},
}) {
  return (
    <div
      className="brand-card flex flex-col items-center justify-center px-6 py-14 text-center"
      style={{ backgroundColor: "var(--surface)" }}
    >
      {icon ? (
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface-2)",
            color: "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      ) : null}
      <h2
        className="text-base font-semibold tracking-tight"
        style={{
          fontFamily: '"Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif',
          color: "var(--text-primary)",
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="mt-2 max-w-sm text-sm leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      ) : null}
      {actionLabel && typeof onAction === "function" ? (
        <button
          type="button"
          className="brand-btn-primary mt-6"
          {...actionProps}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
