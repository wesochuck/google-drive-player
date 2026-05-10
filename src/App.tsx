import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [folderHistory, setFolderHistory] = useState<string[]>(() => urlFolder ? [urlFolder] : []);
  const [playlist, setPlaylist] = useState<DriveFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(() => {
    if (urlKey && urlFolder) return false;
    return !apiKey || !folderId;
  });

  const updateUrl = useCallback((key: string, folder: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('key', key);
    newUrl.searchParams.set('folder', folder);
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleFetch = useCallback(async (forcedKey?: string, forcedFolder?: string) => {
    const activeKey = forcedKey !== undefined ? forcedKey : apiKey;
    const activeFolder = forcedFolder !== undefined ? forcedFolder : folderId;

    if (!activeKey || !activeFolder) {
      setError('Please provide both API Key and Folder ID');
      setShowSettings(true);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const files = await fetchPlaylist(activeFolder, activeKey);
      
      setPlaylist(files);
      
      const firstAudioIndex = files.findIndex(f => !f.isFolder);
      setCurrentIndex(firstAudioIndex !== -1 ? firstAudioIndex : 0);
      setIsPlaying(false);
      setShowSettings(false);
      
      setFolderId(activeFolder);
      setFolderHistory(prev => {
        if (prev[prev.length - 1] === activeFolder) return prev;
        return [...prev, activeFolder];
      });
      updateUrl(activeKey, activeFolder);
    } catch (err) {
      setError('Failed to fetch playlist. Check your API key and Folder ID.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, folderId, updateUrl]);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (urlKey && urlFolder && !initialFetchDone.current) {
      initialFetchDone.current = true;
      handleFetch(urlKey, urlFolder);
    }
  }, [urlKey, urlFolder, handleFetch]);

  useEffect(() => {
    setStorageItem(STORAGE_KEY_API, apiKey);
  }, [apiKey]);

  const handleLoadPlaylist = () => {
    setStorageItem(STORAGE_KEY_API, apiKey);
    setStorageItem(STORAGE_KEY_FOLDER, folderId);
    handleFetch();
  };

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleFolderSelect = (newFolderId: string) => {
    handleFetch(apiKey, newFolderId);
  };

  const handleBack = () => {
    if (folderHistory.length <= 1) return;
    const newHistory = [...folderHistory];
    newHistory.pop(); // remove current
    const parentFolderId = newHistory[newHistory.length - 1];
    setFolderHistory(newHistory);
    handleFetch(apiKey, parentFolderId);
  };

  const rootFolderId = getStorageItem(STORAGE_KEY_FOLDER, '');
  const isAtRoot = folderId === rootFolderId;

  const handleHome = () => {
    if (rootFolderId && rootFolderId !== folderId) {
      setFolderHistory([rootFolderId]);
      handleFetch(apiKey, rootFolderId);
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
            onClick={handleLoadPlaylist}
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
          onFolderSelect={handleFolderSelect}
          onBack={handleBack}
          hasParentFolder={folderHistory.length > 1}
          onHome={handleHome}
          isAtRoot={isAtRoot}
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
