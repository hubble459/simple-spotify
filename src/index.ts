import nodeFetch from 'node-fetch';

export interface SpotifyOptions {
    readonly autoFetchToken: boolean;
    readonly headers: SpotifyHeaders;
    readonly tokenUrl: string;
    readonly trackUrl: string;
    readonly playlistUrl: string;
    readonly albumUrl: string;
    readonly artistUrl: string;
}

export type SpotifyType = 'user' | 'album' | 'artist' | 'playlist' | 'track';

export interface SpotifyHeaders {
    Authorization: string;
    'Accept': 'application/json';
    [key: string]: string;
}

export interface SpotifySharingInfo {
    share_id: string;
    share_url: string;
    uri: string;
}

export interface SpotifyImage {
    height: number | null;
    width: number | number;
    url: string;
}

export interface SpotifyExternalUrl {
    spotify: string;
}

export interface SpotifyArtist {
    external_urls: SpotifyExternalUrl;
    followers?: string[];
    genres?: string[];
    images?: SpotifyImage[];
    popularity?: number;
    href: string;
    id: string;
    name: string;
    type: SpotifyType;
    uri: string;
    albums: (all?: boolean) => Promise<SpotifyAlbum[]>;
}

export type SpotifyAlbumType = 'single' | 'album'

export interface SpotifyAlbum {
    album_group?: string;
    album_type: string;
    artists: SpotifyArtist[];
    available_markets: string[];
    external_urls: SpotifyExternalUrl;
    href: string;
    id: string;
    images: SpotifyImage[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: SpotifyType;
    uri: string;
    tracks: (all?: boolean) => Promise<SpotifyTrack[]>;
}

export interface SpotifyAlbums {
    href: string;
    items: SpotifyAlbum[];
    limit: number;
    next: null | string;
    offset: number;
    previous: null | string;
    total: number;
}

export interface SpotifyTrack {
    album?: SpotifyAlbum;
    artists: SpotifyArtist[];
    available_markets: string[];
    disc_number: number;
    duration_ms: number;
    episode: boolean;
    explicit: boolean;
    external_ids: {
        isrc: string;
    };
    external_urls: SpotifyExternalUrl;
    href: string;
    id: string;
    is_local: boolean;
    name: string;
    popularity: number;
    preview_url: null | string;
    track: boolean;
    track_number: number;
    type: SpotifyType;
    uri: string;
}

export interface SpotifyAlbumTracks {
    href: string;
    items: SpotifyTrack[];
    limit: number;
    next: null | string;
    offset: number;
    previous: null | string;
    total: number;
}

export interface SpotifyPlaylistTracks {
    href: string;
    items: [
        {
            added_at: string;
            added_by: {
                external_urls: SpotifyExternalUrl
                href: string;
                id: string;
                type: SpotifyType;
                uri: string;
            };
            is_local: boolean;
            primary_color: string | null;
            sharing_info: SpotifySharingInfo
            track: SpotifyTrack;
            video_thumbnail: {
                url: string | null;
            };
        }
    ]
    limit: number;
    next: null | string;
    offset: number;
    previous: null | string;
    total: number;
}

export interface SpotifyPlaylist {
    collaborative: boolean;
    description: string;
    external_urls: SpotifyExternalUrl;
    followers: {
        href: null | string;
        total: number;
    };
    href: string;
    id: string;
    images: SpotifyImage[],
    name: string;
    owner: {
        display_name: string;
        external_urls: SpotifyExternalUrl
        href: string;
        id: string;
        type: SpotifyType;
        uri: string;
    };
    primary_color: string | null;
    public: boolean;
    sharing_info: SpotifySharingInfo;
    snapshot_id: string;
    tracks: SpotifyPlaylistTracks;
    type: SpotifyType;
    uri: string;
}

/**
 * Spotify API for Node.js
 */
export class Spotify {
    public readonly playlistRegex = /^https:\/\/open\.spotify\.com\/playlist\/.+$/;
    public readonly albumRegex = /^https:\/\/open\.spotify\.com\/album\/.+$/;
    public readonly trackRegex = /^https:\/\/open\.spotify\.com\/track\/.+$/;
    public readonly artistRegex = /^https:\/\/open\.spotify\.com\/artist\/.+$/;
    // Spotify ID regex
    private readonly idRegex = /^[\d\w]+$/i;
    // Fetch a new token when the old one expires (default: true)
    private readonly autoFetchToken: boolean;
    // Spotify web token
    private readonly headers: SpotifyHeaders;
    // Spotify web token expires after ~30 minutes
    private expires: number = 0;
    // On new token callback
    private onNewTokenCallback?: (token: string) => void
    // ===== Spotify's API endpoints =====
    private readonly tokenUrl: string;
    private readonly trackUrl: string;
    private readonly playlistUrl: string;
    private readonly albumUrl: string;
    private readonly artistUrl: string;

    /**
     * Create an instance of the Spotify API class
     * 
     * @param options SpotifyOptions
     * @example
     * const spotify = new Spotify();
     */
    public constructor(options: Partial<SpotifyOptions> = {}) {
        this.autoFetchToken = options.autoFetchToken || true;
        this.headers = options.headers || <SpotifyHeaders>{
            Authorization: '',
            'Accept': 'application/json'
        };
        this.tokenUrl = options.tokenUrl || 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player';
        this.trackUrl = options.trackUrl || 'https://api.spotify.com/v1/tracks/';
        this.playlistUrl = options.playlistUrl || 'https://api.spotify.com/v1/playlists/';
        this.albumUrl = options.albumUrl || 'https://api.spotify.com/v1/albums/';
        this.artistUrl = options.artistUrl || 'https://api.spotify.com/v1/artists/';
    };

    /**
     * Get a playlist
     * 
     * @param urlOrId Playlist url or id
     */
    public async playlist(urlOrId: string, all: boolean = true) {
        const id = this.getId(urlOrId, this.playlistRegex);

        await this.ensureToken();
        let url: string | null = this.playlistUrl + id;
        const playlist = <SpotifyPlaylist>await this.fetch(url);
        while (all && (url = playlist.tracks.next)) {
            const newPage = <SpotifyPlaylist>await this.fetch(url);
            playlist.tracks.next = newPage.tracks.next;
            playlist.tracks.items.push(...newPage.tracks.items);
        }

        return playlist;
    }

    /**
     * Get an album
     * 
     * @param urlOrId Album url or id
     */
    public async album(urlOrId: string) {
        const id = this.getId(urlOrId, this.albumRegex);

        await this.ensureToken();
        const album = <SpotifyAlbum>await this.fetch(this.albumUrl + id);
        album.tracks = this.trackGetter(id);
        return album;
    }

    private trackGetter(albumId: string) {
        return async (all: boolean = true) => {
            let url: string | null = this.albumUrl + albumId + '/tracks?limit=50';
            const trackList: SpotifyTrack[] = [];
            let tracks = <SpotifyAlbumTracks>await this.fetch(url);
            trackList.push(...tracks.items);
            while (all && (url = tracks.next)) {
                tracks = <SpotifyAlbumTracks>await this.fetch(url);
                trackList.push(...tracks.items);
            }
            return trackList;
        }
    }

    /**
    * Get a track
    * 
    * @param urlOrId Track url or id
    */
    public async track(urlOrId: string) {
        const id = this.getId(urlOrId, this.trackRegex);

        await this.ensureToken();
        return <SpotifyTrack>await this.fetch(this.trackUrl + id);
    }

    /**
    * Get an artist
    * 
    * @param urlOrId Artist url or id
    */
    public async artist(urlOrId: string) {
        const id = this.getId(urlOrId, this.artistRegex);

        await this.ensureToken();
        const artist = <SpotifyArtist>await this.fetch(this.artistUrl + id);
        artist.albums = async (all: boolean = true) => {
            let url: string | null = this.artistUrl + id + '/albums?limit=50';
            const albumList: SpotifyAlbum[] = [];
            let albums: SpotifyAlbums;
            do {
                albums = await this.fetch(url);
                albumList.push(...albums.items);
            } while (all && (url = albums.next));
            albumList.map((album) => {
                album.tracks = this.trackGetter(album.id);
                return album;
            })
            return albumList;
        }
        return artist;
    }

    /**
     * Ensure that there is a valid token in the header
     * 
     * @returns true if no error
     */
    private async ensureToken() {
        if (this.autoFetchToken && Date.now() >= this.expires) {
            const response = await this.fetch(this.tokenUrl);
            const token = response['accessToken'];
            this.headers.Authorization = 'Bearer ' + token;
            this.expires = Number.parseInt(response['accessTokenExpirationTimestampMs']);
            if (this.onNewTokenCallback) {
                this.onNewTokenCallback(token);
            }
        }
    }

    private async fetch(url: string) {
        const response = await nodeFetch(url, {
            method: 'GET',
            headers: this.headers
        });
        const contentType = response.headers.get('content-type');
        const isJson = contentType ? contentType.includes('application/json') : false;

        if (isJson) {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw json;
            }
        } else {
            throw new Error('Spotify did not return a \'application/json\' response');
        }
    }

    private getId(urlOrId: string, regex: RegExp) {
        let id: string;
        if (urlOrId && regex.test(urlOrId)) {
            if (urlOrId.endsWith('/')) urlOrId = urlOrId.slice(0, urlOrId.length - 1);
            const urlQ = urlOrId.indexOf('?');
            id = urlOrId.substring(urlOrId.lastIndexOf('/') + 1, urlQ === -1 ? undefined : urlQ);
            if (!this.idRegex.test(id)) {
                throw new Error('Not a Spotify url or id');
            }
        } else if (urlOrId && this.idRegex.test(urlOrId)) {
            id = urlOrId;
        } else {
            throw new Error('Not a Spotify url or id');
        }
        return id;
    }

    public onNewToken(callback: (token: string) => void) {
        this.onNewTokenCallback = callback;
    }
}