import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Playlist } from './Playlist';

const mockPlaylist = [
  { id: '1', name: 'Track 1', streamUrl: 'url1' },
  { id: '2', name: 'Track 2', streamUrl: 'url2' },
];

describe('Playlist', () => {
  it('renders nothing when playlist is empty', () => {
    const { container } = render(
      <Playlist 
        playlist={[]} 
        currentIndex={0} 
        onTrackSelect={vi.fn()} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all tracks in the playlist', () => {
    render(
      <Playlist 
        playlist={mockPlaylist} 
        currentIndex={0} 
        onTrackSelect={vi.fn()} 
      />
    );

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
  });

  it('highlights the current track', () => {
    render(
      <Playlist 
        playlist={mockPlaylist} 
        currentIndex={1} 
        onTrackSelect={vi.fn()} 
      />
    );

    const tracks = screen.getAllByRole('listitem');
    expect(tracks[0]).not.toHaveClass('active');
    expect(tracks[1]).toHaveClass('active');
  });

  it('calls onTrackSelect when a track is clicked', () => {
    const onTrackSelect = vi.fn();
    render(
      <Playlist 
        playlist={mockPlaylist} 
        currentIndex={0} 
        onTrackSelect={onTrackSelect} 
      />
    );

    fireEvent.click(screen.getByText('Track 2'));
    expect(onTrackSelect).toHaveBeenCalledWith(1);
  });
});
