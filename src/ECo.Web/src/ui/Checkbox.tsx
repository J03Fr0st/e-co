import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { useId } from 'react'
import { cx } from './cx'

export interface CheckboxProps {
  label: string
  detail?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function Checkbox({ label, detail, onCheckedChange, className, ...root }: CheckboxProps) {
  const id = useId()
  const detailId = detail ? `${id}-detail` : undefined

  return (
    <div className={cx('flex min-h-11 items-start gap-3 py-2', className)}>
      <RadixCheckbox.Root
        id={id}
        aria-describedby={detailId}
        onCheckedChange={(state) => onCheckedChange?.(state === true)}
        className={cx(
          'grid size-6 shrink-0 place-items-center rounded-sticker border-2 border-steel bg-tile-raised',
          'data-[state=checked]:border-enamel data-[state=checked]:bg-enamel data-[state=checked]:text-enamel-ink',
          'disabled:cursor-not-allowed disabled:border-dashed',
        )}
        {...root}
      >
        <RadixCheckbox.Indicator>
          <Check aria-hidden="true" className="size-4" strokeWidth={3} />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={id} className="flex cursor-pointer flex-col">
        <span className="font-medium">{label}</span>
        {detail && (
          <span id={detailId} className="text-sm text-steel">
            {detail}
          </span>
        )}
      </label>
    </div>
  )
}
