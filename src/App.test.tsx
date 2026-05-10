import { render, screen } from '@testing-library/react'
import App from './App'
import { expect, test } from 'vitest'

test('renders Google Drive Player heading', () => {
  render(<App />)
  const headingElement = screen.getByText(/Google Drive Player/i)
  expect(headingElement).toBeInTheDocument()
})
