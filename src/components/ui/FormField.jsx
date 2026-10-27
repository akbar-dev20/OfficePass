/**
 * FormField — label + control + hint/error wrapper for consistent forms.
 *
 * Usage:
 *   <FormField label="Email" htmlFor="email" error={errors.email?.message} required>
 *     <Input id="email" invalid={!!errors.email} {...register('email')} />
 *   </FormField>
 */
export default function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      {label && (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required && (
            <span className="field__required" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="field__hint">{hint}</p>}
      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
