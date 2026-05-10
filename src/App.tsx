import { useState, useEffect } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type DriveFile } from './services/driveService';

const STORAGE_KEY_API = 'gdrive_player_api_key';
const STORAGE_KEY_FOLDER = 'gdrive_player_folder_id';

const getStorageItem = (key: string, defaultValue: string): string => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

const setStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
};

function App() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const urlKey = params.get('key');
  const urlFolder = params.get('folder');

  const [apiKey, setApiKey] = useState(() => urlKey || getStorageItem(STORAGE_KEY_API, ''));
  const [folderId, setFolderId] = useState(() => urlFolder || getStorageItem(STORAGE_KEY_FOLDER, ''));
  const [playlist, setPlaylist] = useState<DriveFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(() => {
    // If we have URL params, don't show settings immediately
    if (urlKey && urlFolder) return false;
    return !apiKey || !folderId;
  });

  const handleFetch = async (forcedKey?: string, forcedFolder?: string) => {
    const activeKey = forcedKey || apiKey;
    const activeFolder = forcedFolder || folderId;

    if (!activeKey || !activeFolder) {
      setError('Please provide both API Key and Folder ID');
      setShowSettings(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const files = await fetchPlaylist(activeFolder, activeKey);
      if (files.length === 0) {
        setError('No MP3 files found in the specified folder.');
      } else {
        setPlaylist(files);
        setCurrentIndex(0);
        setIsPlaying(false);
        setShowSettings(false);
      }
    } catch (err) {
      setError('Failed to fetch playlist. Check your API key and Folder ID.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch if params are present on mount
    if (urlKey && urlFolder) {
      handleFetch(urlKey, urlFolder);
    }
  }, [urlKey, urlFolder]); // Added dependencies for clarity

  useEffect(() => {
    setStorageItem(STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_FOLDER, folderId);
  }, [folderId]);

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
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
            onClick={() => handleFetch()}
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
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <Playlist 
          playlist={playlist} 
          currentIndex={currentIndex} 
          onTrackSelect={handleTrackSelect} 
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
