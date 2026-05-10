import { render, screen, cleanup } from '@testing-library/react'
import App from './App'
import { expect, test, beforeEach, afterEach, describe, vi } from 'vitest'

describe('App component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders Google Drive Player heading', () => {
    render(<App />)
    const headingElement = screen.getByText(/Google Drive Player/i)
    expect(headingElement).toBeInTheDocument()
  })

  test('displays error message when URL parameters are missing', () => {
    render(<App />)
    const errorElement = screen.getByText(/Configuration missing/i)
    expect(errorElement).toBeInTheDocument()
  })
})
