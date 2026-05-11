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

  test('renders Chorus Audio Player heading', () => {
    render(<App />)
    const headingElement = screen.getByText(/Chorus Audio Player/i)
    expect(headingElement).toBeInTheDocument()
  })

  test('displays access prompt initially', () => {
    render(<App />)
    const promptElement = screen.getByText(/Enter Access Key/i)
    expect(promptElement).toBeInTheDocument()
  })
})
