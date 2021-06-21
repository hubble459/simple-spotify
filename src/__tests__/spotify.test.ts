import { Spotify } from '../';

const spotify = new Spotify();

describe('spotify', () => {
    test('#playlist', async () => {
        await expect(spotify.playlist(<string><unknown>undefined)).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.playlist('https://google.com/')).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.playlist('')).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.playlist('https://open.spotify.com/album/0jDXcSgqZXQBIogbvRtkpj?si=1g_LzVanQKywqUdNG0NZhg&dl_branch=1')).rejects.toThrow('Not a Spotify url or id');
    });

    test('#album', async () => {
        await expect(spotify.album(<string><unknown>undefined)).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.album('3294-3202-KMDMF')).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.album('https://open.spotify.com/playlist/6HRzf0g90fAS9KVcIYkfiN?si=44e0766334a54c6f')).rejects.toThrow('Not a Spotify url or id'); 
    });

    test('#track', async () => {
        await expect(spotify.track(<string><unknown>undefined)).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.track('')).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.track('https://open.spotify.com/playlist/6HRzf0g90fAS9KVcIYkfiN?si=44e0766334a54c6f')).rejects.toThrow('Not a Spotify url or id');
    });

    test('#artist', async () => {
        await expect(spotify.artist(<string><unknown>undefined)).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.artist('')).rejects.toThrow('Not a Spotify url or id');
        await expect(spotify.artist('https://open.spotify.com/playlist/6HRzf0g90fAS9KVcIYkfiN?si=44e0766334a54c6f')).rejects.toThrow('Not a Spotify url or id');
    });
})