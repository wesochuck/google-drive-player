import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type MediaFile } from './services/blobService';

const getPrefixFromPath = () => {
  const path = window.location.pathname;
  if (path === '/' || path === '') return '';
  let prefix = path.substring(1);
  if (!prefix.endsWith('/')) {
    prefix += '/';
  }
  return prefix;
};

// Extract the base chorus from the initial URL prefix (e.g., 'lmc/2024/' -> 'lmc/')
const getBaseChorus = (prefix: string) => {
  if (!prefix) return '';
  const parts = prefix.split('/');
  return parts[0] + '/';
};

function App() {
  const initialPrefix = getPrefixFromPath();

  const [currentPrefix, setCurrentPrefix] = useState(() => initialPrefix);
  const [baseChorus] = useState(() => getBaseChorus(initialPrefix));
  const [folderHistory, setFolderHistory] = useState<string[]>(() => initialPrefix ? [initialPrefix] : ['']);
  
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

  const updateUrl = useCallback((prefix: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.pathname = prefix ? `/${prefix}` : '/';
    newUrl.searchParams.delete('prefix');
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleFetch = useCallback(async (prefix: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const files = await fetchPlaylist(prefix);
      
      setPlaylist(files);
      
      const firstAudioIndex = files.findIndex(f => !f.isFolder);
      setCurrentIndex(firstAudioIndex !== -1 ? firstAudioIndex : 0);
      setIsPlaying(false);
      
      setCurrentPrefix(prefix);
      setFolderHistory(prev => {
        if (prev[prev.length - 1] === prefix) return prev;
        return [...prev, prefix];
      });
      updateUrl(prefix);
    } catch (err) {
      setError('Failed to fetch playlist from Vercel Blob.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [updateUrl]);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      handleFetch(initialPrefix);
    }
  }, [initialPrefix, handleFetch]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathPrefix = getPrefixFromPath();
      setCurrentPrefix(pathPrefix);
      handleFetch(pathPrefix);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleFetch]);

  const handleTrackSelect = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const handleFolderSelect = (newPrefix: string) => {
    handleFetch(newPrefix);
  };

  const handleBack = () => {
    if (folderHistory.length <= 1) return;
    const newHistory = [...folderHistory];
    newHistory.pop(); // remove current
    const parentPrefix = newHistory[newHistory.length - 1];
    setFolderHistory(newHistory);
    handleFetch(parentPrefix);
  };

  const isAtRoot = currentPrefix === baseChorus;

  const handleHome = () => {
    if (!isAtRoot) {
      setFolderHistory([baseChorus]);
      handleFetch(baseChorus);
    }
  };

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
            onFolderSelect={handleFolderSelect}
            onBack={handleBack}
            hasParentFolder={folderHistory.length > 1 && !isAtRoot}
            onHome={handleHome}
            isAtRoot={isAtRoot}
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
