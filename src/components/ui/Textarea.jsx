/**
 * Textarea — styled multi-line input, same contract as Input.
 */
export default function Textarea({ invalid = false, rows = 4, className = '', ...rest }) {
  return (
    <textarea
      rows={rows}
      className={`textarea${invalid ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
