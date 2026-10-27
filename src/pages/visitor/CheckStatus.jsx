import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

export default function CheckStatus() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })
  const toast = useToast()

  const onSubmit = async () => {
    // Phase 2: insert a visitor_email_verifications row and email the
    // verification link via the `send-visitor-verification` Edge Function (Resend).
    toast.info('Demo mode', 'The verification email flow is wired in Phase 2.')
  }

  return (
    <div>
      <div className="check-status-head">
        <span className="brand__mark">OP</span>
        <h1>Check Your Visit Request</h1>
        <p className="text-secondary">
          Enter the email you used when registering. We'll send a one-time verification link to
          show the live status of your request.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="check-status-form">
        <FormField
          label="Email address"
          htmlFor="check-email"
          error={errors.email?.message}
          required
        >
          <Input
            id="check-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            invalid={!!errors.email}
            {...register('email')}
          />
        </FormField>
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting} icon={Send}>
          Send verification link
        </Button>
      </form>
      <div className="check-notice">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>
          Privacy notice: your email is used only to verify your identity and show your request
          status. It is never shared with third parties and you can request deletion at any time.
        </span>
      </div>
    </div>
  )
}
