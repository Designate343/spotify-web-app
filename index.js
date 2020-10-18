import { getJsonResponse } from './http_help.js';

var spotifyTopTracks = new Vue({
    el: '#spotify-top-tracks',
    data: {
        tracks: [
        ],
        tracksCache: {

        },
        genres: [],
        timeframe: 'medium_term'
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
            //need to lookup artists to get most popular genres of these popular tracks
            let artistIds = new Set();

            let tracksResponse = this.tracksCache[this.timeframe]['raw'];
            console.log(tracksResponse);
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
        }
    }
});

//TODO: sort all this stuff
var search = new Vue({
    el: '#do-search',
    data: {
        searchString: "",
        tracks: []
    },
    methods: {
        searchForTrackName: function () {
            var url = 'https://api.spotify.com/v1/search';
            let type = 'track';

            var urlSearchParams = new URLSearchParams('market=GB');
            urlSearchParams.set('type', type);
            //TODO: not updating if search is replaced
            urlSearchParams.set('q', this.searchString);
            urlSearchParams.set('limit', 10);

            //reset tracks
            this.tracks = [];

            getJsonResponse(url + '?' + urlSearchParams.toString())
                .then(json => json['tracks'])
                .then(tracks => tracks['items'])
                .then(items => items.forEach(element => {
                    let name = element['name'];
                    let artists = element['artists'];
                    //only use first artist even if there are 2
                    let artistName = artists[0]['name'];
                    let albumName = element["album"]["name"];
                    let id = element['id'];

                    let trackString = name + " " + artistName + " " + albumName;
                    this.tracks.push({
                        'text': trackString,
                        'id': id
                    });
                    //each item must be clickable to generate some recomendations based on it
                }));
        }
    }
});

var getRecomendations = new Vue({
    el: '#get-recomendations',
    data: {
        trackId: '',
        tracks: [
        ]
    },
    methods: {
        //slightly strange that this adds the recomendations tracks in place - makes more sense to 
        //search just for one track surely - and display results somewhere else? 
        generateRecomendationsForTrack(trackId) {
            var url = 'https://api.spotify.com/v1/recommendations';
            console.log(trackId);

            var urlSearchParams = new URLSearchParams('market=GB');
            urlSearchParams.set('seed_tracks', trackId);
            urlSearchParams.set('limit', 20);

            var trackIndex = 0;
            for (let index = 0; index < this.tracks.length; index++) {
                const track = this.tracks[index];
                if (trackId === track['id']) {
                    if (this.tracks[index].recomendations === undefined) {
                        this.tracks[index].recomendations = []
                    }
                    trackIndex = index;
                }
            }

            getJsonResponse(url + '?' + urlSearchParams.toString(), requestParams)
                .then(json => json['tracks'])
                .then(items => {
                    var recomendations = []
                    items.forEach(element => {
                        let name = element['name'];
                        let artists = element['artists'];
                        let artistName = artists[0]['name'];
                        let albumName = element["album"]["name"];
                        let id = element['id'];

                        let trackString = name + " " + artistName + " " + albumName;

                        recomendations.push({
                            'text': trackString,
                            'id': id
                        });
                    });
                    var newValue = this.tracks[trackIndex];
                    newValue.recomendations = recomendations;
                    //needs to do this special setting to update component https://vuejs.org/v2/guide/reactivity.html#For-Arrays 
                    getRecomendations.$set(getRecomendations.tracks, trackIndex, newValue);
                });
        }
    }
});
