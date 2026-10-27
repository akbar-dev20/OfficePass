/**
 * StatCard — dashboard KPI tile. `accent` picks the icon tint:
 * primary (teal, default) | peach | cream | orange.
 */
export default function StatCard({ label, value, hint, icon: Icon, accent = 'primary' }) {
  return (
    <article className={`stat-card stat-card--${accent}`}>
      {Icon && (
        <div className="stat-card__icon">
          <Icon size={20} aria-hidden="true" />
        </div>
      )}
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </article>
  )
}
