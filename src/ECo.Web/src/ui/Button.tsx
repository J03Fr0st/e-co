import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows progress, blocks repeat presses, and is announced through aria-busy. */
  loading?: boolean
  /** Replaces the label while loading, e.g. "Placing order". */
  loadingLabel?: string
  icon?: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-enamel text-enamel-ink shadow-[inset_0_-2px_0_rgb(0_0_0/0.25)] hover:bg-enamel-hover disabled:bg-steel/60',
  secondary:
    'bg-tile-raised text-ink border border-steel hover:bg-panel disabled:text-steel disabled:border-grout',
  quiet: 'bg-transparent text-enamel underline-offset-4 hover:underline disabled:text-steel',
  danger: 'bg-red text-enamel-ink hover:bg-[#962513] disabled:bg-steel/60',
}

// Primary actions are at least 44px tall; small controls still clear the 24px target minimum.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-11 px-5 text-base',
  lg: 'min-h-13 px-6 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  icon,
  disabled,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // Loading keeps focus and the enamel fill: aria-disabled, not disabled (critique P1).
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? (event) => event.preventDefault() : onClick}
      className={cx(
        'inline-flex min-w-11 items-center justify-center gap-2 rounded-button font-semibold',
        'transition-[background-color,transform] duration-160 ease-out-expo',
        'active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0',
        // Palette law: amber means in progress.
        'aria-busy:cursor-progress aria-busy:active:translate-y-0 aria-busy:shadow-[inset_0_-4px_0_var(--color-amber)]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
      ) : (
        icon
      )}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  )
}
