import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import { useToast } from '../../components/ui/Toast'

const phoneRegex = /^[+()\-\s\d]{7,20}$/

const PURPOSE_OPTIONS = [
  { value: 'business_meeting', label: 'Business meeting' },
  { value: 'interview', label: 'Interview' },
  { value: 'delivery', label: 'Delivery / pickup' },
  { value: 'contractor_work', label: 'Contractor work' },
  { value: 'client_visit', label: 'Client visit' },
  { value: 'other', label: 'Other' },
]

const DURATION_OPTIONS = [
  { value: '30_minutes', label: '30 min' },
  { value: '1_hour', label: '1 hour' },
  { value: '2_hours', label: '2 hours' },
  { value: '4_hours', label: '4 hours' },
  { value: 'full_day', label: 'Full day' },
]

const visitorFields = {
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number').regex(phoneRegex, 'Enter a valid phone number'),
  organisation: z.string().max(80, 'Keep it under 80 characters').optional(),
}

const visitSchema = z.object({
  purpose: z.string().min(1, 'Select the purpose of the visit'),
  purposeNotes: z.string().max(500, 'Keep it under 500 characters').optional(),
  visitDate: z.string().min(1, 'Choose a visit date'),
  startTime: z.string().min(1, 'Choose an arrival time'),
  duration: z.string().min(1, 'Choose a duration'),
  employeeCode: z.string().trim().min(2, "Enter the employee ID you're visiting"),
  primaryVisitor: z.object(visitorFields),
  additionalVisitors: z
    .array(
      z.object({
        fullName: visitorFields.fullName,
        email: visitorFields.email,
        phone: visitorFields.phone,
      }),
    )
    .max(5, 'Up to 5 additional visitors per request'),
  consent: z.boolean().refine((v) => v === true, { message: 'Consent is required to submit the request' }),
})

export default function VisitorRegistration() {
  const { officeCode } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(visitSchema),
    mode: 'onTouched',
    defaultValues: {
      purpose: '',
      purposeNotes: '',
      visitDate: '',
      startTime: '',
      duration: '2_hours',
      employeeCode: '',
      primaryVisitor: { fullName: '', email: '', phone: '', organisation: '' },
      additionalVisitors: [],
      consent: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'additionalVisitors' })
  const selectedDuration = watch('duration')

  const onSubmit = async () => {
    // Phase 2: POST to the `create-visitor-request` Edge Function (service-role)
    // which inserts visitor_requests + visitors rows and emails the host.
    // Phase 1 is UI-only: validate, then show the confirmation screen.
    toast.info('Demo mode', 'Backend submission is wired in Phase 2 — showing the confirmation screen.')
    navigate('/visit/submitted')
  }

  const today = new Date().toISOString().slice(0, 10)
  return (
    <div className="visit-form">
      <div className="visit-form__head">
        <span className="pill">Office · {officeCode}</span>
        <h1>Visitor registration</h1>
        <p className="text-secondary">
          You're visiting an office managed with OfficePass. Fill in your details to request access.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className="form-section">
          <h2 className="form-section-title">Visit details</h2>
          <p className="form-section-sub">Tell us when and why you're visiting.</p>
          <div className="form-grid">
            <FormField label="Purpose of visit" htmlFor="visit-purpose" error={errors.purpose?.message} required>
              <Select id="visit-purpose" invalid={!!errors.purpose} {...register('purpose')}>
                <option value="">Select a purpose…</option>
                {PURPOSE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField
              label="Employee you're visiting (ID)"
              htmlFor="visit-employee"
              error={errors.employeeCode?.message}
              hint="Your host receives an approval request."
              required
            >
              <Input id="visit-employee" placeholder="e.g. EMP-0142" invalid={!!errors.employeeCode} {...register('employeeCode')} />
            </FormField>
            <FormField label="Visit date" htmlFor="visit-date" error={errors.visitDate?.message} required>
              <Input id="visit-date" type="date" min={today} invalid={!!errors.visitDate} {...register('visitDate')} />
            </FormField>
            <FormField label="Arrival time" htmlFor="visit-time" error={errors.startTime?.message} required>
              <Input id="visit-time" type="time" invalid={!!errors.startTime} {...register('startTime')} />
            </FormField>
            <div className="field field--full">
              <span className="field__label" id="duration-label">Expected duration</span>
              <div className="duration-options" role="radiogroup" aria-labelledby="duration-label">
                {DURATION_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`duration-pill${selectedDuration === option.value ? ' duration-pill--active' : ''}`}
                  >
                    <input type="radio" value={option.value} {...register('duration')} />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.duration && <p className="field__error" role="alert">{errors.duration.message}</p>}
            </div>
            <div className="field field--full">
              <FormField
                label="Additional details"
                htmlFor="visit-notes"
                hint="Optional — anything your host should know."
              >
                <Textarea
                  id="visit-notes"
                  rows={3}
                  placeholder="e.g. Delivering equipment for the 3rd floor fit-out"
                  {...register('purposeNotes')}
                />
              </FormField>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Your details</h2>
          <p className="form-section-sub">The primary visitor receives the pass and status updates.</p>
          <div className="form-grid">
            <FormField label="Full name" htmlFor="visitor-name" error={errors.primaryVisitor?.fullName?.message} required>
              <Input id="visitor-name" placeholder="Jane Cooper" invalid={!!errors.primaryVisitor?.fullName} {...register('primaryVisitor.fullName')} />
            </FormField>
            <FormField label="Email" htmlFor="visitor-email" error={errors.primaryVisitor?.email?.message} hint="Your QR pass is sent here." required>
              <Input id="visitor-email" type="email" placeholder="jane@company.com" invalid={!!errors.primaryVisitor?.email} {...register('primaryVisitor.email')} />
            </FormField>
            <FormField label="Phone" htmlFor="visitor-phone" error={errors.primaryVisitor?.phone?.message} required>
              <Input id="visitor-phone" type="tel" placeholder="+91 98765 43210" invalid={!!errors.primaryVisitor?.phone} {...register('primaryVisitor.phone')} />
            </FormField>
            <FormField label="Organisation" htmlFor="visitor-org" hint="Optional">
              <Input id="visitor-org" placeholder="Company you represent" {...register('primaryVisitor.organisation')} />
            </FormField>
          </div>
        </section>

        <section className="form-section">
          <div className="form-section-row">
            <div>
              <h2 className="form-section-title">Additional visitors</h2>
              <p className="form-section-sub">Coming with colleagues? Add up to 5.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => append({ fullName: '', email: '', phone: '' })}
              disabled={fields.length >= 5}
            >
              Add visitor
            </Button>
          </div>
          {errors.additionalVisitors?.message && (
            <p className="field__error" role="alert">{errors.additionalVisitors.message}</p>
          )}
          {fields.length === 0 && (
            <p className="text-secondary additional-empty">No additional visitors added.</p>
          )}
          <div className="additional-list">
            {fields.map((field, index) => (
              <div key={field.id} className="additional-card card">
                <div className="additional-card__head">
                  <span>Visitor {index + 2}</span>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => remove(index)}
                    aria-label={`Remove visitor ${index + 2}`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className="form-grid">
                  <FormField label="Full name" htmlFor={`add-name-${index}`} error={errors.additionalVisitors?.[index]?.fullName?.message} required>
                    <Input id={`add-name-${index}`} placeholder="Full name" invalid={!!errors.additionalVisitors?.[index]?.fullName} {...register(`additionalVisitors.${index}.fullName`)} />
                  </FormField>
                  <FormField label="Email" htmlFor={`add-email-${index}`} error={errors.additionalVisitors?.[index]?.email?.message} required>
                    <Input id={`add-email-${index}`} type="email" placeholder="Email address" invalid={!!errors.additionalVisitors?.[index]?.email} {...register(`additionalVisitors.${index}.email`)} />
                  </FormField>
                  <FormField label="Phone" htmlFor={`add-phone-${index}`} error={errors.additionalVisitors?.[index]?.phone?.message} required>
                    <Input id={`add-phone-${index}`} type="tel" placeholder="Phone number" invalid={!!errors.additionalVisitors?.[index]?.phone} {...register(`additionalVisitors.${index}.phone`)} />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <label className="consent-row">
            <input type="checkbox" {...register('consent')} />
            <span>
              I confirm the information above is accurate and I consent to my details being
              shared with the host and reception for the purpose of this visit.
            </span>
          </label>
          {errors.consent && <p className="field__error" role="alert">{errors.consent.message}</p>}
          <div className="visit-form__actions">
            <Button type="submit" size="lg" loading={isSubmitting}>
              Submit visit request
            </Button>
            <p className="text-secondary visit-form__note">
              Your host reviews the request — you'll get an email with your QR pass once approved.
            </p>
          </div>
        </section>
      </form>
    </div>
  )
}
