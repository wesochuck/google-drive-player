import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from './App'
import { expect, test, beforeEach, afterEach, describe, vi } from 'vitest'

describe('App component', () => {
  beforeEach(() => {
    localStorage.clear();
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

  test('saves and loads apiKey and folderId from localStorage', () => {
    const { unmount } = render(<App />)
    
    const apiKeyInput = screen.getByLabelText(/Google API Key/i)
    const folderIdInput = screen.getByLabelText(/Folder ID/i)

    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })
    fireEvent.change(folderIdInput, { target: { value: 'test-folder-id' } })

    const loadButton = screen.getByRole('button', { name: /Load Playlist/i })
    fireEvent.click(loadButton)

    expect(localStorage.getItem('gdrive_player_api_key')).toBe('test-api-key')
    expect(localStorage.getItem('gdrive_player_folder_id')).toBe('test-folder-id')

    unmount()

    render(<App />)
    
    // Toggle settings to show them
    const settingsToggle = screen.getByLabelText(/Toggle Settings/i)
    fireEvent.click(settingsToggle)

    expect(screen.getByLabelText(/Google API Key/i)).toHaveValue('test-api-key')
    expect(screen.getByLabelText(/Folder ID/i)).toHaveValue('test-folder-id')
  })
})
