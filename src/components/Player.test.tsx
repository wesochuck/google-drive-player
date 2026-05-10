import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Player } from './Player';

const mockPlaylist = [
  { id: '1', name: 'Track 1', streamUrl: 'url1' },
  { id: '2', name: 'Track 2', streamUrl: 'url2' },
];

describe('Player', () => {
  it('calls onTrackChange with next index when track ends and loopMode is none', () => {
    const onTrackChange = vi.fn();
    render(
      <Player 
        playlist={mockPlaylist} 
        currentIndex={0} 
        onTrackChange={onTrackChange} 
      />
    );

    const audio = document.querySelector('audio');
    if (!audio) throw new Error('Audio element not found');

    fireEvent.ended(audio);

    expect(onTrackChange).toHaveBeenCalledWith(1);
  });

  it('replays the current track when loopMode is one', () => {
    const onTrackChange = vi.fn();
    render(
      <Player 
        playlist={mockPlaylist} 
        currentIndex={0} 
        onTrackChange={onTrackChange} 
      />
    );

    const audio = document.querySelector('audio');
    if (!audio) throw new Error('Audio element not found');

    const playSpy = vi.spyOn(audio, 'play').mockImplementation(() => Promise.resolve());

    // Cycle to 'all' then to 'one'
    const loopButton = screen.getByText(/Loop: none/i);
    fireEvent.click(loopButton); // now 'all'
    fireEvent.click(loopButton); // now 'one'

    fireEvent.ended(audio);

    expect(onTrackChange).not.toHaveBeenCalled();
    expect(playSpy).toHaveBeenCalled();
  });

  it('cycles to the first track when loopMode is all and current track is last', () => {
    const onTrackChange = vi.fn();
    render(
      <Player 
        playlist={mockPlaylist} 
        currentIndex={1} 
        onTrackChange={onTrackChange} 
      />
    );

    const audio = document.querySelector('audio');
    if (!audio) throw new Error('Audio element not found');

    // Cycle to 'all'
    const loopButton = screen.getByText(/Loop: none/i);
    fireEvent.click(loopButton);

    fireEvent.ended(audio);

    expect(onTrackChange).toHaveBeenCalledWith(0);
  });

  describe('manual navigation', () => {
    it('wraps around to the first track when Next is clicked at the end and loopMode is all', () => {
      const onTrackChange = vi.fn();
      render(
        <Player 
          playlist={mockPlaylist} 
          currentIndex={1} 
          onTrackChange={onTrackChange} 
        />
      );

      const loopButton = screen.getByText(/Loop: none/i);
      fireEvent.click(loopButton); // now 'all'

      const nextButton = screen.getByText('Next');
      expect(nextButton).not.toBeDisabled();
      fireEvent.click(nextButton);

      expect(onTrackChange).toHaveBeenCalledWith(0);
    });

    it('wraps around to the last track when Prev is clicked at the beginning and loopMode is all', () => {
      const onTrackChange = vi.fn();
      render(
        <Player 
          playlist={mockPlaylist} 
          currentIndex={0} 
          onTrackChange={onTrackChange} 
        />
      );

      const loopButton = screen.getByText(/Loop: none/i);
      fireEvent.click(loopButton); // now 'all'

      const prevButton = screen.getByText('Prev');
      expect(prevButton).not.toBeDisabled();
      fireEvent.click(prevButton);

      expect(onTrackChange).toHaveBeenCalledWith(1);
    });

    it('disables Prev at the beginning and Next at the end when loopMode is none', () => {
      const { rerender } = render(
        <Player 
          playlist={mockPlaylist} 
          currentIndex={0} 
          onTrackChange={vi.fn()} 
        />
      );

      expect(screen.getByText('Prev')).toBeDisabled();
      expect(screen.getByText('Next')).not.toBeDisabled();

      rerender(
        <Player 
          playlist={mockPlaylist} 
          currentIndex={1} 
          onTrackChange={vi.fn()} 
        />
      );

      expect(screen.getByText('Prev')).not.toBeDisabled();
      expect(screen.getByText('Next')).toBeDisabled();
    });
  });
});
