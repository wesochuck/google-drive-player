import React from 'react';
import type { MediaFile } from '../services/blobService';
import './Playlist.css';

const MusicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

interface PlaylistProps {
  playlist: MediaFile[];
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
            <span className="track-number">
              <ChevronLeftIcon />
            </span>
            <span className="track-name">Back to Parent</span>
          </li>
        )}
        {playlist.map((item, index) => (
          <li 
            key={item.id} 
            className={`${index === currentIndex && !item.isFolder ? 'active' : ''} ${item.isFolder ? 'folder' : ''}`}
            onClick={() => item.isFolder ? onFolderSelect(item.id) : onTrackSelect(index)}
          >
            <span className="track-number">
              {item.isFolder ? <FolderIcon /> : <MusicIcon />}
            </span>
            <span className="track-name">{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
