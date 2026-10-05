import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from '@/app/AppShell'
import { Button, RadioGroup, TextField } from '@/ui'

describe('TextField', () => {
  it('links the hint and the error to the input and marks it invalid', () => {
    render(<TextField label="Postcode" hint="UK postcodes only" error="Enter a full postcode." />)

    const input = screen.getByLabelText('Postcode')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('UK postcodes only Enter a full postcode.')
  })

  it('is not marked invalid without an error', () => {
    render(<TextField label="Email" />)

    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid')
  })
})

describe('RadioGroup machine buttons', () => {
  const sizes = [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M', unavailable: true, unavailableLabel: 'Sold out' },
    { value: 'L', label: 'L' },
  ]

  it('keeps a sold-out size visible, announced and unselectable', async () => {
    render(<RadioGroup legend="Size" variant="buttons" defaultValue="S" options={sizes} />)

    const soldOut = screen.getByRole('radio', { name: 'M, Sold out' })
    expect(soldOut).toBeVisible()
    expect(soldOut).toBeDisabled()

    await userEvent.click(soldOut)
    expect(screen.getByRole('radio', { name: 'S' })).toBeChecked()
  })

  it('is labelled by its legend', () => {
    render(<RadioGroup legend="Size" variant="buttons" options={sizes} />)

    expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument()
  })
})

describe('Button', () => {
  it('blocks repeat presses and announces progress while loading, without losing focus', async () => {
    const onClick = vi.fn()
    render(
      <Button loading loadingLabel="Placing order" onClick={onClick}>
        Place order
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Placing order' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    // Still focusable: disabling would drop keyboard focus mid-press.
    expect(button).not.toBeDisabled()

    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('RadioGroup swatches (the colour dial)', () => {
  it('names each colour and marks a sold-out one unavailable', () => {
    render(
      <RadioGroup
        legend="Colour"
        variant="swatches"
        defaultValue="ink"
        options={[
          { value: 'ink', label: 'Ink', swatch: '#1f2a33' },
          { value: 'rust', label: 'Rust', swatch: '#9a4a2c', unavailable: true, unavailableLabel: 'Sold out' },
        ]}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Ink' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Rust, Sold out' })).toBeDisabled()
  })
})

describe('AppShell', () => {
  function renderShell(bagCount: number) {
    const router = createMemoryRouter(
      [{ element: <AppShell bagCount={bagCount} />, children: [{ index: true, element: <h1>Page</h1> }] }],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
  }

  it('offers a skip link to the main content', () => {
    renderShell(0)

    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })

  it('announces the bag count in words, not just the padded readout', () => {
    renderShell(1)

    expect(screen.getByText('Bag: 1 item')).toBeInTheDocument()
  })

  it('states that the store is a test-mode demo and links the privacy note', () => {
    renderShell(0)

    expect(screen.getByRole('contentinfo')).toHaveTextContent(/fictional demo store/)
    expect(screen.getByRole('link', { name: 'Privacy note' })).toHaveAttribute('href', '/privacy')
  })
})
