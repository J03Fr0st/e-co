import * as Label from '@radix-ui/react-label'
import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { cx } from './cx'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  label: string
  options: SelectOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({ label, options, placeholder = 'Choose…', className, ...root }: SelectProps) {
  const id = useId()

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <Label.Root htmlFor={id} className="font-semibold">
        {label}
      </Label.Root>
      <RadixSelect.Root {...root}>
        <RadixSelect.Trigger
          id={id}
          className={cx(
            'inline-flex min-h-11 w-full items-center justify-between gap-2 rounded-button border border-steel',
            'bg-tile-raised px-3 text-left text-base data-[placeholder]:text-steel',
            'disabled:cursor-not-allowed disabled:bg-panel disabled:text-steel',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown aria-hidden="true" className="size-5 text-steel" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-button border border-grout bg-tile-raised shadow-pop"
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cx(
                    'relative flex min-h-11 cursor-default select-none items-center rounded-sticker py-2 pr-3 pl-9 outline-none',
                    'data-[highlighted]:bg-enamel data-[highlighted]:text-enamel-ink',
                    'data-[disabled]:text-steel data-[disabled]:line-through',
                  )}
                >
                  <RadixSelect.ItemIndicator className="absolute left-2.5 inline-flex">
                    <Check aria-hidden="true" className="size-4" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  )
}
