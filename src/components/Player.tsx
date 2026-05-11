import React, { useState, useRef, useEffect } from 'react';
import type { MediaFile } from '../services/blobService';
import './Player.css';

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const SkipNextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

const SkipPreviousIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const RepeatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
  </svg>
);

const RepeatOneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z" />
  </svg>
);

type LoopMode = 'none' | 'all' | 'one';

interface PlayerProps {
  playlist: MediaFile[];
  currentIndex: number;
  onTrackChange: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  playlist, 
  currentIndex, 
  onTrackChange,
  isPlaying,
  setIsPlaying
}) => {
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const currentTrack = playlist[currentIndex];
  const isFolder = currentTrack?.isFolder || false;

  useEffect(() => {
    setPlayError(null);
  }, [currentIndex]);

  const safePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Playback error:", err);
          setPlayError("Could not play this track. It may be unsupported.");
          setIsPlaying(false);
        }
      });
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      safePlay();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        safePlay();
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

  const getRepeatLabel = () => {
    switch (loopMode) {
      case 'one': return 'Repeat One';
      case 'all': return 'Repeat All';
      default: return 'No Repeat';
    }
  };

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

  useEffect(() => {
    if (audioRef.current && !isFolder) {
      if (isPlaying) {
        safePlay();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, isFolder]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: 'Vercel Audio Player',
      });

      navigator.mediaSession.setActionHandler('play', () => {
        safePlay();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
      navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    }
  }, [currentTrack, handlePrev, handleNext, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
      {!isFolder && (
        <audio 
          ref={audioRef} 
          src={currentTrack.streamUrl} 
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={(e) => {
            console.error("Audio playback error:", e);
            setPlayError("Could not load this track. It may be restricted or unsupported.");
            setIsPlaying(false);
          }}
        />
      )}
      
      {playError && <div className="error-message" style={{ margin: '10px 0', padding: '10px', fontSize: '0.9rem' }}>{playError}</div>}
      
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
        <button 
          onClick={handlePrev} 
          disabled={isFolder || (currentIndex === 0 && loopMode !== 'all')}
          aria-label="Previous"
        >
          <SkipPreviousIcon />
        </button>
        <button 
          onClick={togglePlay}
          disabled={isFolder}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button 
          onClick={handleNext} 
          disabled={isFolder || (currentIndex === playlist.length - 1 && loopMode !== 'all')}
          aria-label="Next"
        >
          <SkipNextIcon />
        </button>
        <button onClick={cycleLoopMode} className={`repeat-button ${loopMode}`} disabled={isFolder}>
          {loopMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          <span>{getRepeatLabel()}</span>
        </button>
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
          disabled={isFolder}
        />
      </div>
    </div>
  );
};
