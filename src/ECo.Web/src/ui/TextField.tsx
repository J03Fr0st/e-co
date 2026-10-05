import * as Label from '@radix-ui/react-label'
import { CircleAlert } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'
import { cx } from './cx'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  hint?: string
  /** Plain-language problem and fix. Sets aria-invalid and is read with the field. */
  error?: string
  id?: string
}

export function TextField({ label, hint, error, id, className, ...input }: TextFieldProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <Label.Root htmlFor={fieldId} className="font-semibold">
        {label}
      </Label.Root>
      {hint && (
        <p id={hintId} className="text-sm text-steel">
          {hint}
        </p>
      )}
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={cx(
          'min-h-11 w-full rounded-button border bg-tile-raised px-3 text-base text-ink placeholder:text-steel',
          'disabled:cursor-not-allowed disabled:bg-panel disabled:text-steel',
          error ? 'border-red border-2' : 'border-steel',
        )}
        {...input}
      />
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-red">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
