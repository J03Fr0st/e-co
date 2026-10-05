import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router'
import { ToastProvider, cx } from '@/ui'

export interface AppShellProps {
  /** Items in the bag; wired to the bag in S5. */
  bagCount?: number
}

export function AppShell({ bagCount = 0 }: AppShellProps) {
  return (
    <ToastProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <header className="on-enamel bg-enamel text-enamel-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.25)]">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
            <Link to="/" className="sign-type min-h-11 content-center text-[1.75rem] no-underline sm:text-3xl">
              Long Cycle
            </Link>
            <nav aria-label="Main" className="flex-1">
              <ul className="flex gap-1">
                <li>
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      cx(
                        'inline-flex min-h-11 items-center rounded-button px-3 font-semibold no-underline hover:bg-enamel-hover',
                        isActive && 'underline decoration-2 underline-offset-[0.4em]',
                      )
                    }
                  >
                    Shop
                  </NavLink>
                </li>
              </ul>
            </nav>
            <p className="readout flex items-baseline gap-1.5 rounded-sticker bg-ink px-2.5 py-1.5 text-sm text-tile-raised">
              <span aria-hidden="true">BAG</span>
              <span aria-hidden="true">{String(bagCount).padStart(2, '0')}</span>
              <span className="sr-only">{`Bag: ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`}</span>
            </p>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6">
          <Outlet />
        </main>

        <footer className="border-t border-grout bg-panel">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-steel sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>Long Cycle is a fictional demo store. Payments run in test mode, and no order is real.</p>
            <Link to="/privacy" className="inline-flex min-h-11 items-center font-semibold text-enamel underline">
              Privacy note
            </Link>
          </div>
        </footer>
      </div>
      <ScrollRestoration />
    </ToastProvider>
  )
}
