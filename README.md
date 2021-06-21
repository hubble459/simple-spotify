<div align="center">
  <br />
  <p>
    <a href="https://www.npmjs.com/package/simple-spotify"><img src="https://img.shields.io/npm/dt/simple-spotify.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.npmjs.com/package/simple-spotify"><img alt="npm" src="https://img.shields.io/npm/v/simple-spotify"></a>
    <a href="https://www.npmjs.com/package/simple-spotify"><img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/simple-spotify"></a>
  </p>
</div>

# A library for interacting with [Spotify](https://spotify.com)
## Install
```
npm install simple-spotify
```
## Usage
### Require/ import
```js
const { Spotify } = require('simple-spotify');
// or
import { Spotify } from 'simple-spotify';

// Create an instance of the Spotify class
const spotify = new Spotify();
// Specify special options
const spotify = new Spotify({
  /*
  * Here you can define the api endpoints which are used
  * Should only be necessary when Spotify changes it's API
  * and I neglect to update this package
  */
});
```

### Playlist
```js

// await can only be used in an async functions
const playlist = await spotify.playlist('https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM?si=c809d19fc04440af');
// or
/* 
* The seconds argument is to fetch 'all' tracks from this playlist
* Spotify only returns 100 tracks as a maximum, so to get all tracks
* you will have to collect them by 'GET'-requesting more links
*/
const playlist = await spotify.playlist('0vvXsWCC9xrXsKd4FyS8kM', true);

// Use songs
for (const item of playlist.tracks.items) {
  const song = item.track;
  console.log(song.name);
  console.log(song.artists[0].name);
}
```

### Album
```js
const album = await spotify.album('https://open.spotify.com/album/3iTOoFTl3JWm4jZx9sK7R8');
// or
const album = await spotify.album('0vvXsWCC93iTOoFTl3JWm4jZx9sK7R8xrXsKd4FyS8kM');

// get songs
const songs = await album.tracks(true); // <- true for all tracks (default: true)
for (const song of songs) {
  console.log(song.name);
  console.log(song.artists[0].name);
}
```

### Track
```js
const track = await spotify.track('https://open.spotify.com/track/3KriJcc1OwpynDFQtzGNZN');
// or
const track = await spotify.track('3KriJcc1OwpynDFQtzGNZN');

console.log(track.name);
console.log(track.artists[0].name);
```