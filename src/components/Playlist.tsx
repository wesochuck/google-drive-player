import React from 'react';
import type { MediaFile } from '../services/blobService';
import './Playlist.css';

interface PlaylistProps {
  playlist: MediaFile[];
  currentIndex: number;
  onTrackSelect: (index: number) => void;
  onFolderSelect: (folderId: string) => void;
  onBack: () => void;
  hasParentFolder: boolean;
  onHome?: () => void;
  isAtRoot?: boolean;
}

export const Playlist: React.FC<PlaylistProps> = ({ 
  playlist, 
  currentIndex, 
  onTrackSelect,
  onFolderSelect,
  onBack,
  hasParentFolder,
  onHome,
  isAtRoot
}) => {
  if (playlist.length === 0 && !hasParentFolder) return null;

  return (
    <div className="playlist">
      <h3>Playlist</h3>
      <ul>
        {hasParentFolder && (
          <li className="back-item" onClick={onBack}>
            <span className="track-number">⬅️</span>
            <span className="track-name">.. Back to Parent</span>
          </li>
        )}
        {!hasParentFolder && !isAtRoot && onHome && (
          <li className="back-item" onClick={onHome}>
            <span className="track-number">🏠</span>
            <span className="track-name">Home (Root Folder)</span>
          </li>
        )}
        {playlist.map((item, index) => (
          <li 
            key={item.id} 
            className={`${index === currentIndex && !item.isFolder ? 'active' : ''} ${item.isFolder ? 'folder' : ''}`}
            onClick={() => item.isFolder ? onFolderSelect(item.id) : onTrackSelect(index)}
          >
            <span className="track-number">{item.isFolder ? '📁' : '🎵'}</span>
            <span className="track-name">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
