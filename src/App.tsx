import { useState, useEffect } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type DriveFile } from './services/driveService';

const STORAGE_KEY_API = 'gdrive_player_api_key';
const STORAGE_KEY_FOLDER = 'gdrive_player_folder_id';

function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY_API) || '');
  const [folderId, setFolderId] = useState(() => localStorage.getItem(STORAGE_KEY_FOLDER) || '');
  const [playlist, setPlaylist] = useState<DriveFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(!apiKey || !folderId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FOLDER, folderId);
  }, [folderId]);

  const handleFetch = async () => {
    if (!apiKey || !folderId) {
      setError('Please provide both API Key and Folder ID');
      setShowSettings(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const files = await fetchPlaylist(folderId, apiKey);
      if (files.length === 0) {
        setError('No MP3 files found in the specified folder.');
      } else {
        setPlaylist(files);
        setCurrentIndex(0);
        setShowSettings(false);
      }
    } catch (err) {
      setError('Failed to fetch playlist. Check your API key and Folder ID.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Google Drive Player</h1>
        <button 
          className="settings-toggle" 
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Toggle Settings"
        >
          {showSettings ? '✕' : '⚙️'}
        </button>
      </header>
      
      {showSettings && (
        <div className="setup card">
          <h2>Configuration</h2>
          <div className="input-group">
            <label htmlFor="api-key">Google API Key</label>
            <input 
              id="api-key"
              type="password" 
              placeholder="Enter your API Key" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <label htmlFor="folder-id">Folder ID</label>
            <input 
              id="folder-id"
              type="text" 
              placeholder="Enter Google Drive Folder ID" 
              value={folderId} 
              onChange={(e) => setFolderId(e.target.value)} 
            />
          </div>
          <button 
            className="primary-button" 
            onClick={handleFetch}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load Playlist'}
          </button>
          <p className="help-text">
            Your settings are saved locally in your browser.
          </p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <main>
        <Player 
          playlist={playlist} 
          currentIndex={currentIndex} 
          onTrackChange={setCurrentIndex} 
        />

        <Playlist 
          playlist={playlist} 
          currentIndex={currentIndex} 
          onTrackSelect={setCurrentIndex} 
        />
      </main>

      {playlist.length === 0 && !showSettings && !isLoading && (
        <div className="empty-state">
          <p>No playlist loaded.</p>
          <button onClick={() => setShowSettings(true)}>Open Settings</button>
        </div>
      )}
    </div>
  );
}

export default App;
