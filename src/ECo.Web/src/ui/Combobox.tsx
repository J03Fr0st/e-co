import * as Ariakit from '@ariakit/react'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cx } from './cx'

export interface ComboboxProps {
  label: string
  /** Suggestions to offer; filtering happens here unless `filter` is false. */
  suggestions: string[]
  placeholder?: string
  /** Called with the chosen suggestion (Enter or click). */
  onSelect?: (value: string) => void
  /** Called on every keystroke, for callers that fetch suggestions themselves. */
  onInputChange?: (value: string) => void
  filter?: boolean
  /** Suggestions appear once this many characters are typed (AC-005: two). */
  minChars?: number
  maxSuggestions?: number
  emptyText?: string
  className?: string
}

/** Search-with-suggestions input: the ARIA combobox pattern via Ariakit (Radix has none). */
export function Combobox({
  label,
  suggestions,
  placeholder,
  onSelect,
  onInputChange,
  filter = true,
  minChars = 2,
  maxSuggestions = 6,
  emptyText = 'No matches',
  className,
}: ComboboxProps) {
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)

  const matches = useMemo(() => {
    if (value.trim().length < minChars) return []
    const needle = value.trim().toLocaleLowerCase()
    const list = filter ? suggestions.filter((s) => s.toLocaleLowerCase().includes(needle)) : suggestions
    return list.slice(0, maxSuggestions)
  }, [value, suggestions, filter, minChars, maxSuggestions])

  const ready = value.trim().length >= minChars

  return (
    <Ariakit.ComboboxProvider
      // Expanded only when a popup can actually show, so aria-expanded never claims a missing listbox.
      open={open && ready}
      setOpen={setOpen}
      // No enter/leave animation: closing must hide at once, never wait for an animation end.
      animated={false}
      inputValue={value}
      setInputValue={(next) => {
        setValue(next)
        onInputChange?.(next)
      }}
      setSelectedValue={(selected) => {
        if (typeof selected === 'string' && selected) onSelect?.(selected)
      }}
    >
      <div className={cx('flex flex-col gap-1.5', className)}>
        <Ariakit.ComboboxLabel className="font-semibold">{label}</Ariakit.ComboboxLabel>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-steel" />
          <Ariakit.Combobox
            placeholder={placeholder}
            autoSelect
            className="min-h-11 w-full rounded-button border border-steel bg-tile-raised pr-3 pl-10 text-base text-ink placeholder:text-steel"
          />
        </div>
      </div>
      {/* Always rendered and hidden (not unmounted) when closed: Ariakit owns the lifecycle
          through `open`. Unmounting, from outside or via unmountOnHide, raced with a quick reopen
          after a selection and left the popup visible but inert. */}
      <Ariakit.ComboboxPopover
        gutter={6}
        sameWidth
        className="z-50 max-h-80 overflow-y-auto rounded-button border border-grout bg-tile-raised p-1 shadow-pop"
      >
        {matches.length > 0 ? (
          matches.map((match) => (
            <Ariakit.ComboboxItem
              key={match}
              value={match}
              className="flex min-h-11 cursor-default items-center rounded-sticker px-3 data-[active-item]:bg-enamel data-[active-item]:text-enamel-ink"
            />
          ))
        ) : (
          <div className="px-3 py-3 text-steel">{emptyText}</div>
        )}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  )
}
