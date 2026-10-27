/**
 * Button — primary/secondary/outline/ghost/danger variants, three sizes,
 * optional leading icon and built-in loading state.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon: Icon,
  type = 'button',
  className = '',
  children,
  disabled,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    fullWidth ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {Icon && !loading && <Icon size={18} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
