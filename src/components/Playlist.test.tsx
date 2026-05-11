import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Playlist } from './Playlist';

const mockPlaylist = [
  { id: '1', name: 'Track 1', streamUrl: 'url1', isFolder: false },
  { id: '2', name: 'Track 2', streamUrl: 'url2', isFolder: false },
];

describe('Playlist', () => {
  it('renders nothing when playlist is empty', () => {
    const { container } = render(
      <Playlist 
        playlist={[]} 
        currentIndex={0} 
        onTrackSelect={vi.fn()}
        onFolderSelect={vi.fn()}
        onBack={vi.fn()}
        hasParentFolder={false}
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
        onFolderSelect={vi.fn()}
        onBack={vi.fn()}
        hasParentFolder={false}
      />
    );

    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });

  it('highlights the current track', () => {
    render(
      <Playlist 
        playlist={mockPlaylist} 
        currentIndex={1} 
        onTrackSelect={vi.fn()}
        onFolderSelect={vi.fn()}
        onBack={vi.fn()}
        hasParentFolder={false}
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
        onFolderSelect={vi.fn()}
        onBack={vi.fn()}
        hasParentFolder={false}
      />
    );

    fireEvent.click(screen.getByText('Track 2'));
    expect(onTrackSelect).toHaveBeenCalledWith(1);
  });
});
