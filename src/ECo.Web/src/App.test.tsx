import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/App'

describe('App', () => {
  it('renders the placeholder inside the main landmark', () => {
    render(<App />)

    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { level: 1, name: 'E-co' }))
  })
})
