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

  test('displays loading state initially', () => {
    render(<App />)
    const loadingElement = screen.getByText(/Loading playlist/i)
    expect(loadingElement).toBeInTheDocument()
  })
})
