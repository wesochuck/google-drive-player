import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { Player } from './components/Player';
import { Playlist } from './components/Playlist';
import { fetchPlaylist, type DriveFile } from './services/driveService';

function App() {
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const urlKey = params.get('key');
  const urlFolder = params.get('folder');

  const [apiKey] = useState(() => urlKey || '');
  const [folderId, setFolderId] = useState(() => urlFolder || '');
  const [folderHistory, setFolderHistory] = useState<string[]>(() => urlFolder ? [urlFolder] : []);
  const [playlist, setPlaylist] = useState<DriveFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateUrl = useCallback((key: string, folder: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('key', key);
    newUrl.searchParams.set('folder', folder);
    window.history.pushState({}, '', newUrl);
  }, []);

  const handleFetch = useCallback(async (activeKey: string, activeFolder: string) => {
    if (!activeKey || !activeFolder) {
      setError('Missing configuration. Please provide ?key=YOUR_API_KEY&folder=YOUR_FOLDER_ID in the URL.');
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
  }, [updateUrl]);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      if (urlKey && urlFolder) {
        handleFetch(urlKey, urlFolder);
      } else {
        setError('Configuration missing. Please provide ?key=YOUR_API_KEY&folder=YOUR_FOLDER_ID in the URL.');
      }
    }
  }, [urlKey, urlFolder, handleFetch]);

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

  const rootFolderId = urlFolder || '';
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
      </header>

      {error && (
        <div className="error-message" style={{ margin: '2rem 0', padding: '1.5rem', background: 'rgba(255, 50, 50, 0.1)', border: '1px solid rgba(255, 50, 50, 0.3)', borderRadius: '8px' }}>
          <h3>Setup Required</h3>
          <p>{error}</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
            Example: <code>{window.location.origin}{window.location.pathname}?key=AIzaSy...&amp;folder=1A2B3C...</code>
          </p>
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
