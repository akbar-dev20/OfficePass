import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { friendlyAuthError } from '../../lib/auth'

const phoneRegex = /^[+()\-\s\d]{7,20}$/

const schema = z
  .object({
    companyName: z.string().min(2, 'Company name is required'),
    officialEmail: z.string().min(1, 'Official email is required').email('Enter a valid email address'),
    contactNumber: z
      .string()
      .min(7, 'Enter a valid contact number')
      .regex(phoneRegex, 'Enter a valid contact number'),
    address: z.string().min(5, 'Enter the registered office address'),
    website: z.string().url('Enter a full URL including https://').optional().or(z.literal('')),
    adminName: z.string().min(2, 'Admin name is required'),
    adminEmail: z.string().min(1, 'Admin email is required').email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Include at least one letter and one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().refine((v) => v === true, { message: 'You must accept the terms to continue' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterCompany() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      companyName: '',
      officialEmail: '',
      contactNumber: '',
      address: '',
      website: '',
      adminName: '',
      adminEmail: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })
  const toast = useToast()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    if (!isSupabaseConfigured) {
      toast.error('Configuration error', 'Supabase is not configured. Please check your environment variables.')
      return
    }
    try {
      const { error } = await supabase.auth.signUp({
        email: data.adminEmail,
        password: data.password,
        options: {
          data: {
            full_name: data.adminName,
            company_name: data.companyName,
            official_email: data.officialEmail,
            contact_number: data.contactNumber,
            address: data.address,
            website: data.website,
            role: 'company_admin',
          },
        },
      })
      if (error) throw error
      toast.success('Registration successful', 'Please check your email to verify your account.')
      navigate('/login')
    } catch (error) {
      toast.error('Registration failed', friendlyAuthError(error))
    }
  }
  return (
    <main className="page-pad">
      <div className="container container--narrow">
        <div className="register-head">
          <h1>Register your company</h1>
          <p className="text-secondary">
            Set up your workspace in minutes. Our team reviews new companies before activation.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="form-section">
            <h2 className="form-section-title">Company details</h2>
            <p className="form-section-sub">Used on visitor passes and email communications.</p>
            <div className="form-grid">
              <FormField label="Company name" htmlFor="company-name" error={errors.companyName?.message} required>
                <Input id="company-name" placeholder="Acme Corporation" invalid={!!errors.companyName} {...register('companyName')} />
              </FormField>
              <FormField label="Official email" htmlFor="company-email" error={errors.officialEmail?.message} required>
                <Input id="company-email" type="email" placeholder="admin@acme.com" invalid={!!errors.officialEmail} {...register('officialEmail')} />
              </FormField>
              <FormField label="Contact number" htmlFor="company-phone" error={errors.contactNumber?.message} required>
                <Input id="company-phone" type="tel" placeholder="+91 98765 43210" invalid={!!errors.contactNumber} {...register('contactNumber')} />
              </FormField>
              <FormField label="Website" htmlFor="company-website" error={errors.website?.message} hint="Optional — e.g. https://acme.com">
                <Input id="company-website" type="url" placeholder="https://acme.com" invalid={!!errors.website} {...register('website')} />
              </FormField>
              <div className="field field--full">
                <FormField label="Registered address" htmlFor="company-address" error={errors.address?.message} required>
                  <Input id="company-address" placeholder="Plot 42, Tech Park Road, Bengaluru" invalid={!!errors.address} {...register('address')} />
                </FormField>
              </div>
            </div>
          </section>
          <section className="form-section">
        <h2 className="form-section-title">Admin account</h2>
        <p className="form-section-sub">This account manages your company workspace.</p>
        <div className="form-grid">
          <FormField label="Admin name" htmlFor="admin-name" error={errors.adminName?.message} required>
            <Input id="admin-name" placeholder="Full name" invalid={!!errors.adminName} {...register('adminName')} />
          </FormField>
          <FormField label="Admin email" htmlFor="admin-email" error={errors.adminEmail?.message} hint="Used to sign in." required>
            <Input id="admin-email" type="email" placeholder="you@acme.com" invalid={!!errors.adminEmail} {...register('adminEmail')} />
          </FormField>
          <FormField label="Password" htmlFor="admin-password" error={errors.password?.message} hint="At least 8 characters with a letter and a number." required>
            <Input id="admin-password" type="password" placeholder="••••••••" invalid={!!errors.password} {...register('password')} />
          </FormField>
          <FormField label="Confirm password" htmlFor="admin-confirm" error={errors.confirmPassword?.message} required>
            <Input id="admin-confirm" type="password" placeholder="••••••••" invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
          </FormField>
        </div>
        <label className="consent-row">
          <input type="checkbox" {...register('terms')} />
          <span>
            I agree to the OfficePass <a href="#">Terms of Service</a> and{' '}
            <a href="#">Privacy Policy</a>.
          </span>
        </label>
        {errors.terms && <p className="field__error" role="alert">{errors.terms.message}</p>}
        <div className="form-actions">
          <Button type="submit" size="lg" loading={isSubmitting}>
            Submit registration
          </Button>
          <p className="text-secondary form-actions__note">
            Already registered? <Link to="/login">Sign in</Link> ·{' '}
            <Link to="/registration-status">Check your status</Link>
          </p>
        </div>
      </section>
        </form>
      </div>
    </main>
  )
}
