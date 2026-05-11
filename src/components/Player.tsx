import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [delaySetting, setDelaySetting] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingNextIndex, setPendingNextIndex] = useState<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to clear countdown state
  const cancelCountdown = useCallback(() => {
    setCountdown(null);
    setPendingNextIndex(null);
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const currentTrack = playlist[currentIndex];
  const isFolder = currentTrack?.isFolder || false;
  const firstAudioIndex = useMemo(() => Math.max(0, playlist.findIndex(t => !t.isFolder)), [playlist]);

  useEffect(() => {
    cancelCountdown();
    setPlayError(null);
    setCurrentTime(0);
  }, [currentIndex, cancelCountdown]);

  // The actual countdown timer effect
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && pendingNextIndex !== null) {
      // Countdown finished! Move to the next track.
      const nextIdx = pendingNextIndex;
      cancelCountdown();
      onTrackChange(nextIdx);
      setIsPlaying(true);
    }
    
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown, pendingNextIndex, onTrackChange, setIsPlaying, cancelCountdown]);

  const safePlay = () => {
    if (audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') {
            setPlayError("Could not play this track. It may be unsupported.");
            setIsPlaying(false);
          }
        });
      }
    }
  };

  const togglePlay = () => {
    // If waiting on a countdown, skip the wait and play next track immediately
    if (countdown !== null && pendingNextIndex !== null) {
      const nextIdx = pendingNextIndex;
      cancelCountdown();
      onTrackChange(nextIdx);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      safePlay();
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    let nextIndexToPlay: number | null = null;

    // Determine what the next track should be
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        safePlay();
      }
      return; 
    } else if (currentIndex < playlist.length - 1) {
      nextIndexToPlay = currentIndex + 1;
    } else if (loopMode === 'all') {
      nextIndexToPlay = firstAudioIndex;
    }

    // Apply the delay or play immediately
    if (nextIndexToPlay !== null) {
      if (delaySetting > 0) {
        setPendingNextIndex(nextIndexToPlay);
        setCountdown(delaySetting);
        setIsPlaying(false); // Pause while waiting
      } else {
        onTrackChange(nextIndexToPlay);
        setIsPlaying(true);
      }
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
    cancelCountdown();
    if (currentIndex > firstAudioIndex) {
      onTrackChange(currentIndex - 1);
    } else if (loopMode === 'all') {
      onTrackChange(playlist.length - 1);
    }
  };

  const handleNext = () => {
    cancelCountdown();
    if (currentIndex < playlist.length - 1) {
      onTrackChange(currentIndex + 1);
    } else if (loopMode === 'all') {
      // Wrap to the first audio file
      onTrackChange(firstAudioIndex);
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
        artist: 'Chorus Audio Player',
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
    if (audioRef.current && !isScrubbing) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeekStart = () => {
    setIsScrubbing(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const time = parseFloat((e.target as HTMLInputElement).value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setIsScrubbing(false);
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
          preload="auto"
          autoPlay={isPlaying}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => {
            setPlayError("Could not load this track. It may be restricted or unsupported.");
            setIsPlaying(false);
          }}
        />
      )}
      
      {playError && <div className="error-message" style={{ margin: '10px 0', padding: '10px', fontSize: '0.9rem' }}>{playError}</div>}
      
      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="countdown-indicator">
          <span>Next track starting in {countdown}s...</span>
          <button 
            onClick={togglePlay} 
            className="skip-wait-button"
          >
            Skip Wait
          </button>
        </div>
      )}

      <div className="progress-container">
        <span>{formatTime(currentTime)}</span>
        <input 
          type="range" 
          min="0" 
          max={duration || 0} 
          step="0.1"
          value={currentTime} 
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeekChange} 
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="seek-bar"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="controls">
        <div className="controls-left"></div>
        <div className="controls-center">
          <button 
            onClick={handlePrev} 
            disabled={isFolder || (currentIndex === firstAudioIndex && loopMode !== 'all')}
            aria-label="Previous"
          >
            <SkipPreviousIcon />
          </button>
          <button 
            className="play-button"
            onClick={togglePlay}
            disabled={isFolder}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button 
            onClick={handleNext} 
            disabled={isFolder || (currentIndex >= playlist.length - 1 && loopMode !== 'all')}
            aria-label="Next"
          >
            <SkipNextIcon />
          </button>
        </div>
        <div className="controls-right">
          <button onClick={cycleLoopMode} className={`repeat-button ${loopMode}`} disabled={isFolder}>
            {loopMode === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
            <span>{getRepeatLabel()}</span>
          </button>
        </div>
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
        
        {/* NEW DELAY SETTING */}
        <div className="delay-setting-container">
          <label htmlFor="delay-select" className="delay-label">Delay:</label>
          <select 
            id="delay-select"
            value={delaySetting} 
            onChange={(e) => setDelaySetting(Number(e.target.value))}
            className="delay-select"
          >
            <option value={0}>None</option>
            <option value={2}>2s</option>
            <option value={5}>5s</option>
            <option value={10}>10s</option>
          </select>
        </div>
      </div>
    </div>
  );
};
