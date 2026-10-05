import * as RadixToast from '@radix-ui/react-toast'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { cx } from './cx'

type ToastTone = 'info' | 'success' | 'error'

export interface ToastMessage {
  title: string
  description?: string
  /** Palette law: red only when the visitor needs to act. */
  tone?: ToastTone
}

interface QueuedToast extends ToastMessage {
  id: number
}

const ToastContext = createContext<((message: ToastMessage) => void) | null>(null)

const toneIcon: Record<ToastTone, ReactNode> = {
  info: <Info aria-hidden="true" className="size-5 text-steel" />,
  success: <CircleCheck aria-hidden="true" className="size-5 text-enamel" />,
  error: <CircleAlert aria-hidden="true" className="size-5 text-red" />,
}

/** Confirmations only. Errors that need fixing belong next to what failed, not in a toast. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<QueuedToast[]>([])

  const show = useCallback((message: ToastMessage) => {
    setToasts((current) => [...current, { ...message, id: Date.now() + Math.random() }])
  }, [])

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const value = useMemo(() => show, [show])

  return (
    <ToastContext.Provider value={value}>
      <RadixToast.Provider swipeDirection="down" duration={6000} label="Notification">
        {children}
        {toasts.map((toast) => (
          <RadixToast.Root
            key={toast.id}
            type={toast.tone === 'error' ? 'foreground' : 'background'}
            onOpenChange={(open) => !open && remove(toast.id)}
            className={cx(
              'flex items-start gap-3 rounded-button border bg-tile-raised p-4 shadow-pop',
              toast.tone === 'error' ? 'border-red' : 'border-grout',
              'motion-safe:data-[state=open]:animate-[rise-in_var(--duration-settle)_var(--ease-out-expo)]',
            )}
          >
            {toneIcon[toast.tone ?? 'info']}
            <div className="flex-1">
              <RadixToast.Title className="font-semibold">{toast.title}</RadixToast.Title>
              {toast.description && (
                <RadixToast.Description className="text-sm text-steel">{toast.description}</RadixToast.Description>
              )}
            </div>
            <RadixToast.Close
              aria-label="Dismiss"
              className="-m-2 grid size-10 place-items-center rounded-button text-steel hover:bg-panel hover:text-ink"
            >
              <X aria-hidden="true" className="size-4" />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 outline-none sm:inset-x-auto sm:right-6 sm:w-96" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast(): (message: ToastMessage) => void {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast must be used inside <ToastProvider>.')
  return show
}
