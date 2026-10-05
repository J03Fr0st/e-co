import * as RadixRadio from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'
import { useId } from 'react'
import { cx } from './cx'

export interface RadioOption {
  value: string
  label: string
  /** Shown under the label in the list variant, e.g. a delivery time. */
  detail?: string
  /** Unavailable options stay visible: the ghost cell. */
  unavailable?: boolean
  /** Spoken and shown for an unavailable option, e.g. "Sold out". */
  unavailableLabel?: string
  /** Swatch colour for the `swatches` variant (the colour dial). */
  swatch?: string
}

export interface RadioGroupProps {
  legend: string
  options: RadioOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** `list` for stacked choices; `buttons` for machine-panel buttons such as sizes; `swatches` for the colour dial. */
  variant?: 'list' | 'buttons' | 'swatches'
  /** Visually hide the legend while keeping it for assistive technology. */
  hideLegend?: boolean
  className?: string
}

export function RadioGroup({
  legend,
  options,
  variant = 'list',
  hideLegend = false,
  className,
  ...root
}: RadioGroupProps) {
  const legendId = useId()

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <span id={legendId} className={cx('font-semibold', hideLegend && 'sr-only')}>
        {legend}
      </span>
      <RadixRadio.Root
        aria-labelledby={legendId}
        className={variant === 'list' ? 'flex flex-col gap-1' : 'flex flex-wrap gap-2'}
        {...root}
      >
        {options.map((option) =>
          variant === 'buttons' ? (
            <MachineButton key={option.value} option={option} />
          ) : variant === 'swatches' ? (
            <Swatch key={option.value} option={option} />
          ) : (
            <ListOption key={option.value} option={option} />
          ),
        )}
      </RadixRadio.Root>
    </div>
  )
}

function MachineButton({ option }: { option: RadioOption }) {
  const unavailable = option.unavailableLabel ?? 'Unavailable'
  return (
    <RadixRadio.Item
      value={option.value}
      disabled={option.unavailable}
      aria-label={option.unavailable ? `${option.label}, ${unavailable}` : option.label}
      className={cx(
        'readout relative flex min-h-11 min-w-12 flex-col items-center justify-center rounded-button px-3 text-base',
        'border border-steel bg-tile-raised text-ink transition-colors duration-160 ease-out-expo',
        'hover:bg-panel data-[state=checked]:border-enamel data-[state=checked]:bg-enamel data-[state=checked]:text-enamel-ink',
        // Ghost cell: an unlit button, still present and still announced.
        'data-[disabled]:cursor-not-allowed data-[disabled]:border-dashed data-[disabled]:bg-transparent data-[disabled]:text-steel',
      )}
    >
      <span aria-hidden="true">{option.label}</span>
      {option.unavailable && (
        <span aria-hidden="true" className="text-[0.6875rem] leading-none font-medium tracking-wide uppercase">
          {unavailable}
        </span>
      )}
    </RadixRadio.Item>
  )
}

/** A colour on the dial: named, ringed and ticked when chosen, so colour is never the only signal. */
function Swatch({ option }: { option: RadioOption }) {
  const unavailable = option.unavailableLabel ?? 'Unavailable'
  return (
    <RadixRadio.Item
      value={option.value}
      disabled={option.unavailable}
      aria-label={option.unavailable ? `${option.label}, ${unavailable}` : option.label}
      title={option.label}
      className={cx(
        'group grid size-11 place-items-center rounded-full border-2 border-transparent p-0.5',
        'data-[state=checked]:border-ink data-[disabled]:cursor-not-allowed',
      )}
    >
      <span
        aria-hidden="true"
        className="grid size-full place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(20_32_29/0.35)] group-data-[disabled]:opacity-40"
        style={{ backgroundColor: option.swatch }}
      >
        <RadixRadio.Indicator className="grid size-5 place-items-center rounded-full bg-tile-raised text-ink shadow-[0_0_0_1px_rgb(20_32_29/0.4)]">
          <Check className="size-3.5" strokeWidth={3} />
        </RadixRadio.Indicator>
      </span>
    </RadixRadio.Item>
  )
}

function ListOption({ option }: { option: RadioOption }) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className={cx(
        'flex min-h-11 cursor-pointer items-center gap-3 rounded-button px-2 py-2 hover:bg-panel',
        option.unavailable && 'cursor-not-allowed text-steel hover:bg-transparent',
      )}
    >
      <RadixRadio.Item
        id={id}
        value={option.value}
        disabled={option.unavailable}
        className="grid size-6 shrink-0 place-items-center rounded-full border-2 border-steel bg-tile-raised data-[state=checked]:border-enamel data-[disabled]:border-dashed"
      >
        <RadixRadio.Indicator className="size-3 rounded-full bg-enamel" />
      </RadixRadio.Item>
      <span className="flex flex-col">
        <span className="font-medium">
          {option.label}
          {option.unavailable && <span className="font-normal"> ({option.unavailableLabel ?? 'Unavailable'})</span>}
        </span>
        {option.detail && <span className="text-sm text-steel">{option.detail}</span>}
      </span>
    </label>
  )
}
