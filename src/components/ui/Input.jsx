/**
 * Input — styled text input. Spread React Hook Form's `register()` directly
 * onto it and pass `invalid` (from form errors) for error styling/aria.
 */
export default function Input({ invalid = false, className = '', ...rest }) {
  return (
    <input
      className={`input${invalid ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
