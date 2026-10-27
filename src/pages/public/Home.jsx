import { Link } from 'react-router-dom'
import { ArrowRight, Building2, ClipboardCheck, QrCode, ShieldCheck } from 'lucide-react'

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero container">
        <div className="hero__copy">
          <span className="hero__badge">Visitor management for modern offices</span>
          <h1>Welcome visitors in. Paperwork out.</h1>
          <p className="hero__lead">
            OfficePass gives every company a secure digital front desk — pre-register guests,
            approve visits in one tap, and issue QR passes reception can scan in seconds.
          </p>
          <div className="hero__actions">
            <Link to="/register-company" className="btn btn--primary btn--lg">
              Register your company
            </Link>
            <Link to="/check-status" className="btn btn--outline btn--lg">
              Check visit status
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero-card">
            <div className="hero-card__top">
              <span className="brand__mark">OP</span>
              <div>
                <p className="hero-card__name">Jane Cooper</p>
                <p className="hero-card__sub">Acme Corp · 2 visitors</p>
              </div>
              <span className="badge badge--approved">
                <span className="badge__dot" />
                Approved
              </span>
            </div>
            <div className="hero-card__qr" />
            <div className="hero-card__rows">
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-head">
          <h2>Everything your front desk needs</h2>
          <p className="text-secondary">
            From the first registration link to the scan at the door — one flow, zero paper.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card card">
            <span className="feature-card__icon">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <h3>Per-office invite links</h3>
            <p>Every office location gets its own registration link — visitors land pre-filled with the right venue.</p>
          </article>
          <article className="feature-card card">
            <span className="feature-card__icon">
              <ClipboardCheck size={20} aria-hidden="true" />
            </span>
            <h3>One-tap approvals</h3>
            <p>Host employees approve or decline visits from a clean dashboard — no email chains.</p>
          </article>
          <article className="feature-card card">
            <span className="feature-card__icon">
              <QrCode size={20} aria-hidden="true" />
            </span>
            <h3>QR visitor passes</h3>
            <p>Approved visitors receive a scannable pass. Reception checks them in instantly.</p>
          </article>
          <article className="feature-card card">
            <span className="feature-card__icon">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <h3>Audit-ready trail</h3>
            <p>Every approval, check-in and check-out is logged — compliance without the clipboard.</p>
          </article>
        </div>
      </section>
      <section className="section container">
      <div className="section-head">
        <h2>How OfficePass works</h2>
        <p className="text-secondary">Three steps from invite to check-in.</p>
      </div>
      <div className="steps">
        <article className="step-card card">
          <span className="step-card__num">1</span>
          <h3>Register your company</h3>
          <p>Create your workspace, add office locations and invite your team.</p>
        </article>
        <article className="step-card card">
          <span className="step-card__num">2</span>
          <h3>Share the visit link</h3>
          <p>Visitors pre-register through your office link — details, duration and consent included.</p>
        </article>
        <article className="step-card card">
          <span className="step-card__num">3</span>
          <h3>Approve &amp; scan</h3>
          <p>The host approves, the visitor gets a QR pass, reception scans it on arrival.</p>
        </article>
      </div>
    </section>
      {/* ### cta ### */}
    </div>
  )
}
