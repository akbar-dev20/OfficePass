import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'
import Button from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { createVisitorRequest, fetchOfficeLocations, PURPOSES, DURATIONS } from '../../lib/visits'

const phoneRegex = /^[+()\-\s\d]{7,20}$/

const schema = z.object({
  office_location_id: z.string().min(1, 'Choose an office location'),
  purpose: z.string().min(1, 'Choose a purpose'),
  purpose_notes: z.string().max(500, 'Keep notes under 500 characters').optional().or(z.literal('')),
  visit_date: z.string().min(1, 'Visit date is required'),
  start_time: z.string().min(1, 'Expected arrival time is required'),
  duration: z.string().min(1, 'Choose an expected duration'),
  visitor_name: z.string().min(2, 'Visitor name is required'),
  visitor_email: z.string().min(1, 'Visitor email is required').email('Enter a valid email address'),
  visitor_phone: z.string().min(7, 'Enter a valid phone number').regex(phoneRegex, 'Enter a valid phone number'),
  visitor_organisation: z.string().optional().or(z.literal('')),
})

export default function NewVisitorRequest() {
  const [locations, setLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(true)
  const toast = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      office_location_id: '',
      purpose: '',
      purpose_notes: '',
      visit_date: new Date().toISOString().slice(0, 10),
      start_time: '10:00',
      duration: '1_hour',
      visitor_name: '',
      visitor_email: '',
      visitor_phone: '',
      visitor_organisation: '',
    },
  })

  useEffect(() => {
    fetchOfficeLocations()
      .then(setLocations)
      .catch(() => toast.error('Could not load office locations', 'Try refreshing the page.'))
      .finally(() => setLoadingLocations(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data) => {
    try {
      const result = await createVisitorRequest({
        office_location_id: data.office_location_id,
        purpose: data.purpose,
        purpose_notes: data.purpose_notes || null,
        visit_date: data.visit_date,
        start_time: data.start_time,
        duration: data.duration,
        visitor: {
          full_name: data.visitor_name,
          email: data.visitor_email,
          phone: data.visitor_phone,
          organisation: data.visitor_organisation,
        },
      })
      toast.success('Request submitted', `Your visitor request is pending approval. Reference: ${result.pass_code ?? result.id.slice(0, 8)}`)
      navigate('/employee/visits')
    } catch (error) {
      toast.error('Could not submit request', error.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="New visitor request"
        description="Raise a request for your guest. Your company admin approves it before a pass is issued."
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="panel">
        <div className="panel__body">
          <section className="form-section">
            <h2 className="form-section-title">Visit details</h2>
            <div className="form-grid">
              <FormField label="Office location" htmlFor="loc" error={errors.office_location_id?.message} required>
                <Select id="loc" invalid={!!errors.office_location_id} disabled={loadingLocations} {...register('office_location_id')}>
                  <option value="">{loadingLocations ? 'Loading…' : 'Select a location'}</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                      {loc.city ? ` — ${loc.city}` : ''}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Purpose" htmlFor="purpose" error={errors.purpose?.message} required>
                <Select id="purpose" invalid={!!errors.purpose} {...register('purpose')}>
                  <option value="">Select a purpose</option>
                  {PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Visit date" htmlFor="vdate" error={errors.visit_date?.message} required>
                <Input id="vdate" type="date" invalid={!!errors.visit_date} {...register('visit_date')} />
              </FormField>
              <FormField label="Expected arrival" htmlFor="vtime" error={errors.start_time?.message} required>
                <Input id="vtime" type="time" invalid={!!errors.start_time} {...register('start_time')} />
              </FormField>
              <FormField label="Expected duration" htmlFor="vdur" error={errors.duration?.message} required>
                <Select id="vdur" invalid={!!errors.duration} {...register('duration')}>
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </FormField>
              <div className="field field--full">
                <FormField label="Notes for the admin" htmlFor="vnotes" error={errors.purpose_notes?.message} hint="Optional">
                  <Textarea id="vnotes" rows={3} placeholder="Anything the approver should know…" invalid={!!errors.purpose_notes} {...register('purpose_notes')} />
                </FormField>
              </div>
            </div>
          </section>
          <section className="form-section">
            <h2 className="form-section-title">Visitor</h2>
            <div className="form-grid">
              <FormField label="Full name" htmlFor="vname" error={errors.visitor_name?.message} required>
                <Input id="vname" placeholder="Jane Cooper" invalid={!!errors.visitor_name} {...register('visitor_name')} />
              </FormField>
              <FormField label="Email" htmlFor="vemail" error={errors.visitor_email?.message} required>
                <Input id="vemail" type="email" placeholder="jane@guest.com" invalid={!!errors.visitor_email} {...register('visitor_email')} />
              </FormField>
              <FormField label="Phone" htmlFor="vphone" error={errors.visitor_phone?.message} required>
                <Input id="vphone" type="tel" placeholder="+91 98765 43210" invalid={!!errors.visitor_phone} {...register('visitor_phone')} />
              </FormField>
              <FormField label="Organisation" htmlFor="vorg" error={errors.visitor_organisation?.message} hint="Optional">
                <Input id="vorg" placeholder="Guest's company" invalid={!!errors.visitor_organisation} {...register('visitor_organisation')} />
              </FormField>
            </div>
          </section>
          <div className="form-actions">
            <Button type="submit" size="lg" loading={isSubmitting}>Submit request</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
