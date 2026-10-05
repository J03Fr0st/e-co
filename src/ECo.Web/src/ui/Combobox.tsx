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
  /** Spoken and shown under the field when nothing matches; the popup stays closed. */
  emptyText?: string
  /** Suggestions appear once this many characters are typed (AC-005: two). */
  minChars?: number
  maxSuggestions?: number
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
  const nothingFound = ready && matches.length === 0

  return (
    <Ariakit.ComboboxProvider
      // Expanded only when a popup with options can show: a listbox must never be empty.
      open={open && ready && !nothingFound}
      setOpen={setOpen}
      // No enter/leave animation: closing must hide at once, never wait for an animation end.
      animated={false}
      inputValue={value}
      setInputValue={(next) => {
        setValue(next)
        onInputChange?.(next)
      }}
      // Held empty so each pick is a change; otherwise choosing the same suggestion twice reports once.
      selectedValue=""
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
        <p aria-live="polite" className="min-h-5 text-sm text-steel">
          {nothingFound ? emptyText : ''}
        </p>
      </div>
      {/* Always rendered and hidden (not unmounted) when closed: Ariakit owns the lifecycle
          through `open`. Unmounting, from outside or via unmountOnHide, raced with a quick reopen
          after a selection and left the popup visible but inert. */}
      <Ariakit.ComboboxPopover
        gutter={6}
        sameWidth
        className="z-50 max-h-80 overflow-y-auto rounded-button border border-grout bg-tile-raised p-1 shadow-pop"
      >
        {matches.map((match) => (
          <Ariakit.ComboboxItem
            key={match}
            value={match}
            className="flex min-h-11 cursor-default items-center rounded-sticker px-3 data-[active-item]:bg-enamel data-[active-item]:text-enamel-ink"
          />
        ))}
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  )
}
