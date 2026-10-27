/**
 * LoadingState — spinner + label. `fullPage` centres it in the content area
 * (used by route-level guards), `inline` renders a compact spinner.
 */
export default function LoadingState({ label = 'Loading…', fullPage = false, inline = false }) {
  return (
    <div className={`state state--loading${fullPage ? ' state--fullpage' : ''}`} role="status">
      <span className={`spinner${inline ? ' spinner--inline' : ''}`} aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}
