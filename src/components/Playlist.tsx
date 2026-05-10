import React from 'react';
import type { DriveFile } from '../services/driveService';
import './Playlist.css';

interface PlaylistProps {
  playlist: DriveFile[];
  currentIndex: number;
  onTrackSelect: (index: number) => void;
}

export const Playlist: React.FC<PlaylistProps> = ({ playlist, currentIndex, onTrackSelect }) => {
  if (playlist.length === 0) return null;

  return (
    <div className="playlist">
      <h3>Tracks</h3>
      <ul>
        {playlist.map((track, index) => (
          <li 
            key={track.id} 
            className={index === currentIndex ? 'active' : ''}
            onClick={() => onTrackSelect(index)}
          >
            <span className="track-number">{index + 1}.</span>
            <span className="track-name">{track.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
