import { useEffect, useState } from 'react'
import {
  Bird,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Trees,
  Upload,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { signOutAdmin } from '../services/auth.ts'
import { useAuth } from './auth-context.ts'
import Brand from './Brand.tsx'
import ConfirmDialog from './ConfirmDialog.tsx'
import { useToast } from './toast-context.ts'

const NAV_GROUPS = [
  {
    label: 'Ruang kerja',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Konten',
    items: [
      { to: '/hutan', label: 'Hutan', icon: Trees },
      { to: '/satwa', label: 'Satwa', icon: Bird },
      { to: '/artikel', label: 'Artikel', icon: BookOpen },
      { to: '/kuis', label: 'Soal Kuis', icon: HelpCircle },
    ],
  },
  {
    label: 'Alat',
    items: [{ to: '/impor', label: 'Impor Data', icon: Upload }],
  },
]

function initialsFromEmail(email: string | undefined) {
  if (!email) return 'A'
  return email.slice(0, 2).toUpperCase()
}

function useActiveSection() {
  const { pathname } = useLocation()
  const items = NAV_GROUPS.flatMap((group) => group.items)
  const match = items.find((item) =>
    item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
  )
  return match?.label ?? 'Dashboard'
}

interface SidebarContentProps {
  email: string | undefined
  onNavigate?: () => void
  onSignOut: () => void
}

function SidebarContent({ email, onNavigate, onSignOut }: SidebarContentProps) {
  return (
    <div className="relative flex h-full flex-col">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_right,rgba(152,196,140,0.22),transparent_65%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full border border-white/5"
        aria-hidden="true"
      />

      <div className="relative px-5 pt-6 pb-5">
        <Brand to="/" tone="dark" />
      </div>

      <nav
        aria-label="Navigasi utama"
        className="scroll-slim relative flex-1 space-y-6 overflow-y-auto px-3 pb-4"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.18em] text-brand-300/70 uppercase">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-white text-brand-900 shadow-sm'
                            : 'text-brand-100/85 hover:bg-white/10 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                              isActive
                                ? 'bg-brand-100 text-brand-800'
                                : 'bg-white/5 text-brand-200 group-hover:bg-white/10 group-hover:text-white'
                            }`}
                          >
                            <Icon size={15} aria-hidden="true" />
                          </span>
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="relative border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
              {initialsFromEmail(email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">
                {email ?? 'Admin'}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-200">
                <ShieldCheck size={11} aria-hidden="true" />
                Administrator
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-brand-100 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={13} aria-hidden="true" />
            Keluar dari panel
          </button>
        </div>
      </div>
    </div>
  )
}

/** Shell for every admin page: forest-green sidebar + warm content canvas. */
export default function Layout() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const activeSection = useActiveSection()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOutAdmin()
      setConfirmOpen(false)
      navigate('/login', { replace: true })
    } catch {
      showToast('Gagal keluar. Silakan coba lagi.', 'error')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 text-stone-800">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Lewati ke konten
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-brand-950 lg:block">
        <SidebarContent
          email={user?.email}
          onSignOut={() => setConfirmOpen(true)}
        />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            className="animate-fade absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="animate-rise relative flex w-72 max-w-[85vw] flex-col bg-brand-950 shadow-float">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Tutup menu"
              className="absolute top-5 right-4 z-10 rounded-lg p-1.5 text-brand-200 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <SidebarContent
              email={user?.email}
              onNavigate={() => setDrawerOpen(false)}
              onSignOut={() => {
                setDrawerOpen(false)
                setConfirmOpen(true)
              }}
            />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-50/95 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              aria-expanded={drawerOpen}
              className="rounded-xl border border-cream-200 bg-white p-2 text-stone-600 shadow-sm transition hover:bg-cream-100 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-stone-400 uppercase">
                Panel Admin
              </p>
              <p className="truncate text-sm font-semibold text-stone-800">
                {activeSection}
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-cream-200 bg-white px-3 py-1.5 text-[11px] font-medium text-stone-600 sm:inline-flex">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-brand-500"
                  aria-hidden="true"
                />
                Konten aplikasi mobile
              </span>
              <span className="flex max-w-[12rem] items-center gap-2 rounded-full border border-cream-200 bg-white py-1 pr-3 pl-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-800">
                  {initialsFromEmail(user?.email)}
                </span>
                <span className="truncate text-[11px] font-medium text-stone-600">
                  {user?.email ?? 'Admin'}
                </span>
              </span>
            </div>
          </div>
        </header>

        <main
          id="konten"
          className="mx-auto w-full max-w-7xl px-4 pt-7 pb-16 sm:px-6 lg:px-10 lg:pt-9"
        >
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Keluar dari panel admin?"
        description="Anda perlu masuk kembali untuk mengelola konten."
        confirmLabel="Keluar"
        tone="neutral"
        busy={signingOut}
        onConfirm={handleSignOut}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
