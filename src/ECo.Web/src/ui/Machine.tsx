import { useState, type ReactNode } from 'react'
import { cx } from './cx'

/*
 * The Launderette's materials (direction contract OWN-WORLD): steel machine panels,
 * porthole windows and numbered machine stickers. White cards are for reading content only.
 */

export interface SteelPanelProps {
  children: ReactNode
  className?: string
  /** Render as a region with a heading id, or as a plain grouping. */
  as?: 'section' | 'div'
  labelledBy?: string
}

/** A machine's control panel: brushed steel with a pressed-in bevel. */
export function SteelPanel({ children, className, as: Tag = 'div', labelledBy }: SteelPanelProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cx(
        'rounded-sign bg-steel-panel p-4 text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.7),inset_0_-2px_0_rgb(20_32_29/0.12),var(--shadow-panel)] sm:p-5',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

export interface MachineNumberProps {
  n: number
  className?: string
}

/** The numbered sticker on a machine. Decorative position marker; the product name carries meaning. */
export function MachineNumber({ n, className }: MachineNumberProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'readout inline-grid min-w-10 place-items-center rounded-sticker bg-amber-ink px-1.5 py-1 text-base text-amber',
        className,
      )}
    >
      {String(n).padStart(2, '0')}
    </span>
  )
}

export interface PortholeProps {
  /** The garment image, or a labelled placeholder until imagery lands (CI-4). */
  children: ReactNode
  /**
   * Changes to this value play the signature quarter-turn once, e.g. the bag count after
   * Add to bag. Reduced motion removes the turn; the content simply stays put.
   */
  turnKey?: string | number
  className?: string
}

/** The round glass window of a machine: a steel ring, glass glare, and the garment inside. */
export function Porthole({ children, turnKey, className }: PortholeProps) {
  // The turn answers an action, never the first paint: only a value that differs from the mount value plays it.
  const [mountKey] = useState(turnKey)
  const turning = turnKey !== undefined && turnKey !== mountKey

  return (
    <div
      className={cx(
        'relative aspect-square w-full rounded-full bg-steel-panel p-[6%] shadow-[inset_0_2px_0_rgb(255_255_255/0.8),inset_0_-3px_0_rgb(20_32_29/0.18),var(--shadow-panel)]',
        className,
      )}
    >
      <div className="relative size-full overflow-hidden rounded-full bg-tile-raised shadow-[inset_0_0_0_3px_rgb(20_32_29/0.35),inset_0_6px_18px_rgb(20_32_29/0.25)]">
        <div
          key={turnKey}
          className={cx(
            'size-full',
            turning && 'motion-safe:animate-[drum-turn_var(--duration-drum)_var(--ease-out-expo)]',
          )}
        >
          {children}
        </div>
        {/* Glass glare, above the garment. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgb(255_255_255/0.55),transparent_45%)]"
        />
      </div>
    </div>
  )
}

/** Shown in a porthole until product imagery is sourced (carried item CI-4). */
export function PortholePlaceholder({ label }: { label: string }) {
  return (
    <div role="img" aria-label={`${label} (placeholder image)`} className="grid size-full place-items-center bg-panel p-6 text-center">
      <span className="text-sm text-steel">
        {label}
        <br />
        <span className="readout text-xs uppercase">Image to come</span>
      </span>
    </div>
  )
}
