import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  HelpCircle,
  Trees,
} from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../components/auth-context.ts'
import Brand from '../components/Brand.tsx'
import FormField from '../components/FormField.tsx'
import { inputClass, primaryButtonClass } from '../components/uiClasses.ts'
import {
  authErrorMessage,
  NOT_ADMIN_MESSAGE,
  NotAdminError,
  signInAdmin,
} from '../services/auth.ts'

const HIGHLIGHTS = [
  { icon: Trees, text: 'Kelola katalog hutan dan satwa Nusantara' },
  { icon: BookOpen, text: 'Terbitkan artikel edukasi untuk pembaca' },
  { icon: HelpCircle, text: 'Perbarui bank soal dan pembahasan kuis' },
]

/**
 * Admin login (PRD §8.2 A1): Email/Password only, no registration and no
 * Google sign-in. Non-admin accounts are rejected by `signInAdmin`.
 */
export default function Login() {
  const { status, notice, clearNotice } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'admin') {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    clearNotice()

    try {
      await signInAdmin(email.trim(), password)
      navigate('/', { replace: true })
    } catch (caught) {
      setError(
        caught instanceof NotAdminError
          ? NOT_ADMIN_MESSAGE
          : authErrorMessage(caught),
      )
    } finally {
      setBusy(false)
    }
  }

  const message = error ?? notice

  return (
    <div className="min-h-screen bg-cream-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-950 p-10 text-cream-100 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <img
          src="/logo-mark.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rotate-6 rounded-[3rem] object-cover opacity-[0.08]"
        />
        <div
          className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-brand-950 to-transparent"
          aria-hidden="true"
        />

        <div className="relative">
          <Brand tone="dark" />
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
            Rimba dalam genggaman
          </p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-white xl:text-4xl">
            Rawat rimba,
            <br />
            kelola ceritanya.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-100/80">
            Satu panel untuk mengelola seluruh konten RIMBANARA yang dibaca
            pengguna di aplikasi mobile.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon
              return (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-sm text-brand-100/90"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-white/10">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {item.text}
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative text-xs text-brand-300/70">
          Khusus administrator konten RIMBANARA.
        </p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-8 sm:px-8 lg:min-h-0 lg:justify-center lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Brand />
          </div>

          <div className="mt-8 lg:mt-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-brand-600 uppercase">
              Panel Admin
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-stone-900">
              Masuk ke akun Anda
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Gunakan Email/Password akun admin yang dibuat oleh pemilik
              proyek.
            </p>
          </div>

          {message ? (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs leading-relaxed text-red-700"
            >
              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              {message}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField label="Email" htmlFor="login-email" required>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="login-password" required>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Password akun admin"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition hover:bg-cream-100 hover:text-stone-700"
                >
                  {showPassword ? (
                    <EyeOff size={16} aria-hidden="true" />
                  ) : (
                    <Eye size={16} aria-hidden="true" />
                  )}
                </button>
              </div>
            </FormField>

            <button
              type="submit"
              className={`${primaryButtonClass} w-full`}
              disabled={busy}
            >
              {busy ? 'Memproses...' : 'Masuk ke panel'}
            </button>
          </form>

          <p className="mt-6 rounded-xl border border-cream-200 bg-white px-3.5 py-3 text-[11px] leading-relaxed text-stone-500">
            Tidak ada pendaftaran mandiri. Akun admin dibuat manual di Firebase
            Console dan harus memiliki dokumen{' '}
            <code className="rounded bg-cream-100 px-1 py-0.5 text-[10px] text-stone-700">
              admins/{'{uid}'}
            </code>
            .
          </p>

          <div className="mt-8 flex items-center justify-between text-[11px] text-stone-400">
            <span>© {new Date().getFullYear()} RIMBANARA</span>
            <span className="inline-flex items-center gap-1">
              <Trees size={12} aria-hidden="true" />
              Admin konten
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
