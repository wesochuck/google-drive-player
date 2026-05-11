import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type MediaFile } from './services/blobService';

const parseUrlParams = () => {
  const path = window.location.pathname.replace(/^\//, ''); // Remove leading slash
  if (!path) return { guid: '', encodedSubPath: '' };
  
  const parts = path.split('/');
  const guid = parts[0];
  const encodedSubPath = parts[1] || '';
  
  return { guid, encodedSubPath };
};

const buildObscuredUrl = (guid: string, rawSubPath: string) => {
  if (!rawSubPath) return `/${guid}`;
  const encoded = btoa(rawSubPath);
  return `/${guid}/${encoded}`;
};

function App() {
  const initialParams = parseUrlParams();
  
  const [activeGuid, setActiveGuid] = useState(initialParams.guid);
  // Store raw subpaths in history, encode them only for the URL
  const [pathHistory, setPathHistory] = useState<string[]>(() => {
    return initialParams.encodedSubPath ? [atob(initialParams.encodedSubPath)] : [''];
  });
  
  const [playlist, setPlaylist] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateUrl = useCallback((guid: string, rawSubPath: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.pathname = buildObscuredUrl(guid, rawSubPath);
    newUrl.searchParams.delete('prefix'); // Clean up old URLs
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleFetch = useCallback(async (guid: string, rawSubPath: string) => {
    if (!guid) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const encodedSubPath = rawSubPath ? btoa(rawSubPath) : '';
      const files = await fetchPlaylist(guid, encodedSubPath);
      
      setPlaylist(files);
      
      const firstAudioIndex = files.findIndex(f => !f.isFolder);
      setCurrentIndex(firstAudioIndex !== -1 ? firstAudioIndex : 0);
      setIsPlaying(false);
      
      setActiveGuid(guid);
      setPathHistory(prev => {
        if (prev[prev.length - 1] === rawSubPath) return prev;
        return [...prev, rawSubPath];
      });
      updateUrl(guid, rawSubPath);
    } catch (err) {
      setError('Failed to fetch playlist or invalid access key.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateUrl]);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current && initialParams.guid) {
      initialFetchDone.current = true;
      const rawSubPath = initialParams.encodedSubPath ? atob(initialParams.encodedSubPath) : '';
      handleFetch(initialParams.guid, rawSubPath);
    }
  }, [initialParams.guid, initialParams.encodedSubPath, handleFetch]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = parseUrlParams();
      setActiveGuid(params.guid);
      const rawSubPath = params.encodedSubPath ? atob(params.encodedSubPath) : '';
      handleFetch(params.guid, rawSubPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleFetch]);

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleBack = () => {
    if (pathHistory.length <= 1) return;
    const newHistory = [...pathHistory];
    newHistory.pop(); // remove current
    const parentSubPath = newHistory[newHistory.length - 1];
    setPathHistory(newHistory);
    handleFetch(activeGuid, parentSubPath);
  };

  const isAtRoot = pathHistory[pathHistory.length - 1] === '';



  if (!activeGuid) {
    return (
      <div className="container">
        <header>
          <h1>Chorus Audio Player</h1>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>
        <div className="access-prompt card">
          <h2>Enter Access Key</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('guid') as HTMLInputElement;
            const newGuid = input.value.trim();
            if (newGuid) {
              setActiveGuid(newGuid);
              window.history.pushState({}, '', `/${newGuid}`);
              handleFetch(newGuid, '');
            }
          }}>
            <div className="input-group">
              <input type="text" name="guid" placeholder="e.g., 912baeb0..." required />
            </div>
            <button type="submit" className="primary-button">Access Player</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Chorus Audio Player</h1>
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {isLoading && <div className="loading-state">Loading playlist...</div>}

      {!error && playlist.length > 0 && (
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
            onFolderSelect={(id) => {
              // Extract the relative name from the playlist item
              const item = playlist.find(p => p.id === id);
              if (item) {
                const currentSubPath = pathHistory[pathHistory.length - 1] || '';
                const newSubPath = currentSubPath + item.name + '/';
                handleFetch(activeGuid, newSubPath);
              }
            }}
            onBack={handleBack}
            hasParentFolder={pathHistory.length > 1 && !isAtRoot}
          />
        </main>
      )}

      {playlist.length === 0 && !error && !isLoading && (
        <div className="empty-state">
          <p>No audio files found in this folder.</p>
        </div>
      )}
    </div>
  );
}

export default App;
