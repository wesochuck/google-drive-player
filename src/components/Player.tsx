import React, { useState, useRef, useEffect } from 'react';
import type { DriveFile } from '../services/driveService';
import './Player.css';

type LoopMode = 'none' | 'all' | 'one';

interface PlayerProps {
  playlist: DriveFile[];
  currentIndex: number;
  onTrackChange: (index: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ playlist, currentIndex, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = playlist[currentIndex];

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (currentIndex < playlist.length - 1) {
      onTrackChange(currentIndex + 1);
    } else if (loopMode === 'all') {
      onTrackChange(0);
    } else {
      setIsPlaying(false);
    }
  };

  const cycleLoopMode = () => {
    const modes: LoopMode[] = ['none', 'all', 'one'];
    const next = modes[(modes.indexOf(loopMode) + 1) % modes.length];
    setLoopMode(next);
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      onTrackChange(currentIndex - 1);
    } else if (loopMode === 'all') {
      onTrackChange(playlist.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < playlist.length - 1) {
      onTrackChange(currentIndex + 1);
    } else if (loopMode === 'all') {
      onTrackChange(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return <div className="player empty">No track selected</div>;

  return (
    <div className="player">
      <h2>{currentTrack.name}</h2>
      <audio 
        ref={audioRef} 
        src={currentTrack.streamUrl} 
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      
      <div className="progress-container">
        <span>{formatTime(currentTime)}</span>
        <input 
          type="range" 
          min="0" 
          max={duration || 0} 
          step="0.1"
          value={currentTime} 
          onChange={handleSeek} 
          className="seek-bar"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <button onClick={handlePrev} disabled={currentIndex === 0 && loopMode !== 'all'}>Prev</button>
        <button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleNext} disabled={currentIndex === playlist.length - 1 && loopMode !== 'all'}>Next</button>
        <button onClick={cycleLoopMode}>Loop: {loopMode}</button>
      </div>

      <div className="volume-container">
        <label>Volume</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={volume} 
          onChange={handleVolumeChange} 
        />
      </div>
    </div>
  );
};
