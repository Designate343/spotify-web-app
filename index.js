import { getJsonResponse } from './http_help.js';

var spotifyTopTracks = new Vue({
    el: '#spotify-top-tracks',
    data: {
        tracks: [
        ],
        tracksCache: {

        },
        genres: [],
        timeframe: 'medium_term',
        playingTrack : null, //todo refactor to own component/vue thing
        trackPlaying: false
    },
    methods: {
        downloadTopTracks: function () {
            var url = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=" + this.timeframe;
            if (this.tracksCache == undefined) {
                this.tracksCache = {}
            } else {
                if (this.timeframe in this.tracksCache) {
                    this.tracks = this.tracksCache[this.timeframe]['processed'];
                    return;
                } else {
                    this.tracksCache[this.timeframe] = {
                        'raw': [],
                        'processed': [],
                        'genreHistogram' : {}
                    }
                }
            }
            this.tracks = [];
            let tracksRaw = [];

            getJsonResponse(url)
                .then(response => response['items'])
                .then(items => items.forEach(element => {
                    tracksRaw.push(element);
                    let name = element['name'];
                    let artists = element['artists'];
                    //only use first artist even if there are 2 (maybe fix in future)
                    let artistName = artists[0]['name'];
                    let albumName = element["album"]["name"];
                    let id = element['id'];

                    //get images
                    let images = element['album']['images']
                    let mediumImage;
                    for (let index = 0; index < images.length; index++) {
                        const image = images[index];
                        if (image['height'] == 300) { //yuck
                            mediumImage = image;
                            break;
                        }
                    }

                    this.tracks.push({
                        'track_name': name,
                        'artist_name': artistName,
                        'album_name': albumName,
                        'track_id': id,
                        'preview_url': element['preview_url'],
                        'image': mediumImage
                    });
                }));
            this.tracksCache[this.timeframe]['processed'] = this.tracks;
            this.tracksCache[this.timeframe]['raw'] = tracksRaw;
        },

        getMostPopularGenres() {
            let artistIds = new Set();

            let tracksResponse = this.tracksCache[this.timeframe]['raw'];
            tracksResponse.forEach(track => {
                let artists = track['artists'];
                artists.forEach(artist => {
                    if (artistIds.size < 50) { //temporary hack as spotify API only allows 50 artist ids
                        artistIds.add(artist['id']);
                    }
                });
            });

            var artistIdsString = "";
            for (let item of artistIds.keys()) {
                artistIdsString += ',';
                artistIdsString += item;
            }

            var urlSearchParams = new URLSearchParams();
            urlSearchParams.set('ids', artistIdsString.substring(1));
            let artistResponse = getJsonResponse('https://api.spotify.com/v1/artists?' + urlSearchParams.toString());

            let artistGenreHistogram = {};
            artistResponse.then(response => response['artists'])
                .then(artists => artists.forEach(
                    artist => {
                        let genres = artist['genres'];
                        genres.forEach(genre => {
                            if (genre in artistGenreHistogram) {
                                artistGenreHistogram[genre] = artistGenreHistogram[genre] + 1;
                            } else {
                                artistGenreHistogram[genre] = 1;
                            }
                        });
                    }
                ))
                .then(() => {
                    let keysSorted = Object.keys(artistGenreHistogram).sort(function (a, b) { return artistGenreHistogram[b] - artistGenreHistogram[a] });
                    let topFifteen = [];

                    keysSorted.slice(0, 15).forEach(key => {
                        let keyValue = {};
                        keyValue['genreName'] = key;
                        keyValue['genreInstances'] = artistGenreHistogram[key];
                        topFifteen.push(keyValue)
                    });
                    this.tracksCache[this.timeframe]['genreHistogram'] = topFifteen;
                    this.genres = topFifteen;
                });
        },

        play(track) {
            if (track.preview_url == null) {
                alert('This track does not have a preview link:(');
                console.error('Track ' + track.trackId + " does not have an mp3 preview url")
                console.error(track);
                return;
            }
            if (this.trackPlaying) {
                alert('Pause or let the current track finish playing before starting another (your ears will thank you)')
                return;
            }
            var trackIndex = findTrackIndex(track, this.tracks);
            var dupTrack = track;
            dupTrack.isPlaying = true;
            var audio;
            if (track.audio != null) {
                //track has been played recently so resume from where it left off
                audio = track.audio;
            } else {
                audio = new Audio(track.preview_url);
                audio.addEventListener("ended", () => this.trackPlaying = false);
            }
            dupTrack.audio = audio;
            audio.play();

            spotifyTopTracks.$set(spotifyTopTracks.tracks, trackIndex, dupTrack);
            this.trackPlaying = true; //global variable to stop many tracks playing at the same time
        },
        pause(track) {
            if (track.preview_url == null) {
                return;
            }
            if (track.isPlaying) {
                var audio = track.audio;
                audio.pause();
                var trackIndex = findTrackIndex(track, this.tracks);
                var dupTrack = track;
                dupTrack.isPlaying = false;
                this.trackPlaying = false;
                spotifyTopTracks.$set(spotifyTopTracks.tracks, trackIndex, dupTrack);
            }
        }
    }
});

function findTrackIndex(trackId, tracks) {
    var trackIndex = -1;
    for (let index = 0; index < tracks.length; index++) {
        const element = tracks[index];
        if (trackId = element.track_id) {
            trackIndex = index;
        }
    }
    return trackIndex;
};
