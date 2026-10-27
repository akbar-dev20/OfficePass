/**
 * PageHeader — consistent page title block with optional eyebrow,
 * description and action slot.
 */
export default function PageHeader({ title, description, eyebrow = null, actions = null }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 className="page-header__title">{title}</h1>
        {description && <p className="page-header__desc">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  )
}
