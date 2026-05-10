import React from 'react';
import type { DriveFile } from '../services/driveService';
import './Playlist.css';

interface PlaylistProps {
  playlist: DriveFile[];
  currentIndex: number;
  onTrackSelect: (index: number) => void;
  onFolderSelect: (folderId: string) => void;
  onBack: () => void;
  hasParentFolder: boolean;
}

export const Playlist: React.FC<PlaylistProps> = ({ 
  playlist, 
  currentIndex, 
  onTrackSelect,
  onFolderSelect,
  onBack,
  hasParentFolder
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
        {playlist.map((item, index) => (
          <li 
            key={item.id} 
            className={`${index === currentIndex && !item.isFolder ? 'active' : ''} ${item.isFolder ? 'folder' : ''}`}
            onClick={() => item.isFolder ? onFolderSelect(item.id) : onTrackSelect(index)}
          >
            <span className="track-number">{item.isFolder ? '📁' : (index + 1 + '.')}</span>
            <span className="track-name">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
