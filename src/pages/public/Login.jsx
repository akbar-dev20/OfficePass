import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { friendlyAuthError, fetchProfile, roleHomePath } from '../../lib/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (data) => {
    if (!isSupabaseConfigured) {
      toast.error('Configuration error', 'Supabase is not configured. Please check your environment variables.')
      return
    }
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      const profile = user ? await fetchProfile(user.id) : null
      const role = profile?.role

      const from = location.state?.from
      const target = from && from !== '/login' ? from : roleHomePath(role)
      navigate(target, { replace: true })
    } catch (error) {
      toast.error('Sign in failed', friendlyAuthError(error))
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card card">
        <div className="auth-brand">
          <span className="brand__mark">OP</span>
          OfficePass
        </div>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your OfficePass workspace.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" htmlFor="login-email" error={errors.email?.message} required>
            <Input
              id="login-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              invalid={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <FormField
            label="Password"
            htmlFor="login-password"
            error={errors.password?.message}
            required
          >
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              invalid={!!errors.password}
              {...register('password')}
            />
          </FormField>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <Button type="submit" variant="primary" fullWidth loading={isSubmitting} icon={LogIn}>
            Sign in
          </Button>
        </form>
        <p className="auth-alt">
          New to OfficePass? <Link to="/register-company">Register your company</Link>
        </p>
      </div>
    </main>
  )
}
