import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { friendlyAuthError } from '../../lib/auth'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Include at least one letter and one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { password: '', confirmPassword: '' } })
  const toast = useToast()

  const onSubmit = async (data) => {
    if (!isSupabaseConfigured) {
      toast.error('Configuration error', 'Supabase is not configured. Please check your environment variables.')
      return
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) throw error
      toast.success('Password updated', 'Your password has been updated successfully.')
      navigate('/login')
    } catch (error) {
      toast.error('Update failed', friendlyAuthError(error))
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="brand__mark">OP</span>
          OfficePass
        </div>
        <h1>Set a new password</h1>
        <p className="auth-sub">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="New password"
            htmlFor="reset-password"
            error={errors.password?.message}
            hint="At least 8 characters, with one letter and one number."
            required
          >
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.password}
              {...register('password')}
            />
          </FormField>
          <FormField
            label="Confirm password"
            htmlFor="reset-confirm"
            error={errors.confirmPassword?.message}
            required
          >
            <Input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
          </FormField>
          <Button type="submit" variant="primary" fullWidth loading={isSubmitting} icon={KeyRound}>
            Update password
          </Button>
        </form>
        <p className="auth-note">
          {token
            ? 'Recovery token detected in the link — it will be validated in Phase 2.'
            : 'No recovery token detected in the URL — open the link from your reset email.'}
        </p>
        <p className="auth-alt">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}
