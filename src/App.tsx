import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type MediaFile } from './services/blobService';

function App() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const urlPrefix = params.get('prefix') || '';

  const [currentPrefix, setCurrentPrefix] = useState(() => urlPrefix);
  const [folderHistory, setFolderHistory] = useState<string[]>(() => urlPrefix ? [urlPrefix] : ['']);
  const [playlist, setPlaylist] = useState<MediaFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateUrl = useCallback((prefix: string) => {
    const newUrl = new URL(window.location.href);
    if (prefix) {
      newUrl.searchParams.set('prefix', prefix);
    } else {
      newUrl.searchParams.delete('prefix');
    }
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
      handleFetch(urlPrefix);
    }
  }, [urlPrefix, handleFetch]);

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

  const isAtRoot = currentPrefix === '';

  const handleHome = () => {
    if (!isAtRoot) {
      setFolderHistory(['']);
      handleFetch('');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Vercel Audio Player</h1>
      </header>

      {error && (
        <div className="error-message" style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '8px' }}>
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
            hasParentFolder={folderHistory.length > 1}
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
