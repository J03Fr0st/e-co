import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export interface DialogProps {
  /** The element that opens the dialog; focus returns to it on close. */
  trigger: ReactNode
  title: string
  description?: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/** For tasks that need protected focus, e.g. confirming a refund. Not for ordinary content. */
export function Dialog({ trigger, title, description, children, ...root }: DialogProps) {
  return (
    <RadixDialog.Root {...root}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-ink/50 motion-safe:data-[state=open]:animate-[fade-in_var(--duration-settle)_var(--ease-out-expo)]" />
        <RadixDialog.Content
          className={
            'fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-sign bg-tile-raised p-6 shadow-pop ' +
            'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(32rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-sign ' +
            'motion-safe:data-[state=open]:animate-[rise-in_var(--duration-settle)_var(--ease-out-expo)]'
          }
          {...(description ? {} : { 'aria-describedby': undefined })}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <RadixDialog.Title className="sign-type text-2xl text-enamel">{title}</RadixDialog.Title>
            <RadixDialog.Close
              aria-label="Close"
              className="-m-2 grid size-11 shrink-0 place-items-center rounded-button text-steel hover:bg-panel hover:text-ink"
            >
              <X aria-hidden="true" className="size-5" />
            </RadixDialog.Close>
          </div>
          {description && <RadixDialog.Description className="mb-4 text-steel">{description}</RadixDialog.Description>}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export const DialogClose = RadixDialog.Close
