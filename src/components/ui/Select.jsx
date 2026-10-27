import { ChevronDown } from 'lucide-react'

/**
 * Select — styled native select. Accepts either an `options` array
 * [{ value, label, disabled? }] or plain <option> children.
 */
export default function Select({
  options = [],
  children,
  invalid = false,
  className = '',
  ...rest
}) {
  return (
    <span className="select-wrap">
      <select
        className={`select${invalid ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      <ChevronDown size={16} className="select__chevron" aria-hidden="true" />
    </span>
  )
}
