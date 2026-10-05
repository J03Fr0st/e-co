import { CircleAlert, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { cx } from './cx'

/** A placeholder at the final layout's size, so content arriving causes no shift (AC-025). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cx('rounded-button bg-grout/60 motion-safe:animate-pulse', className)}
    />
  )
}

export interface ErrorStateProps {
  title: string
  /** What went wrong and what the visitor can do, in plain words. */
  message: ReactNode
  onRetry?: () => void
  retryLabel?: string
  retrying?: boolean
  className?: string
}

/** Shown where the failure happened (the machine's own display), never as a vanishing toast. */
export function ErrorState({ title, message, onRetry, retryLabel = 'Try again', retrying, className }: ErrorStateProps) {
  return (
    <div role="alert" className={cx('flex flex-col items-start gap-3 rounded-button bg-red-tint p-4 text-ink', className)}>
      <div className="flex items-start gap-2">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-red" />
        <div>
          <p className="font-semibold">{title}</p>
          <div className="text-sm">{message}</div>
        </div>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} loading={retrying} icon={<RotateCcw aria-hidden="true" className="size-4" />}>
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

export interface ReadoutProps {
  label: string
  value: string | number
  /** Amber, by palette law: low stock or in progress. */
  tone?: 'plain' | 'attention'
  className?: string
}

/** A machine readout: tabular figures that never jitter as values change. */
export function Readout({ label, value, tone = 'plain', className }: ReadoutProps) {
  return (
    <span
      className={cx(
        'readout inline-flex items-baseline gap-1.5 rounded-sticker px-2 py-1 text-sm',
        tone === 'attention' ? 'bg-amber text-amber-ink' : 'bg-ink text-tile-raised',
        className,
      )}
    >
      <span className="uppercase">{label}</span>{' '}
      <span>{value}</span>
    </span>
  )
}
