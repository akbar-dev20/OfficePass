import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { friendlyAuthError } from '../../lib/auth'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } })
  const toast = useToast()

  const onSubmit = async (data) => {
    if (!isSupabaseConfigured) {
      toast.error('Configuration error', 'Supabase is not configured. Please check your environment variables.')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      toast.success('Reset link sent', 'Please check your email for the password reset link.')
    } catch (error) {
      toast.error('Reset failed', friendlyAuthError(error))
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="brand__mark">OP</span>
          OfficePass
        </div>
        <h1>Reset your password</h1>
        <p className="auth-sub">
          Enter your account email and we'll send you a secure reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message} required>
            <Input
              id="forgot-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              invalid={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <Button type="submit" variant="primary" fullWidth loading={isSubmitting} icon={Send}>
            Send reset link
          </Button>
        </form>
        <p className="auth-alt">
          Remembered it? <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}
