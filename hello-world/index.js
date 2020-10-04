var spotifyTopTracks = new Vue({
    el: '#spotify-top-tracks',
    data: {
        tracks: [
        ],
        timeframe : 'medium_term'
    },
    methods: {
        downloadTopTracks: function () {
            var url = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=" + this.timeframe;
            this.tracks = [];

            getJsonResponse(url)
                .then(response => response['items'])
                .then(items => items.forEach(element => {
                    let name = element['name'];
                    console.log(element);
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
                        'artist_name' : artistName,
                        'album_name' : albumName,
                        'track_id' : id,
                        'preview_url' : element['preview_url'],
                        'image' : mediumImage
                    });
                }));
        }
    }
});

var getRecomendations = new Vue({
    el: '#get-recomendations',
    data: {
        searchString: '',
        trackId: '',
        tracks: [
        ]
    },
    methods: {
        //initially just do search + get recommendations
        //TODO: needs to clear what has been searched for existingly
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
        },

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

async function getJsonResponse(url) {
    //try and map to reduced object in here?
    return fetch(url, requestParams)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok, response ' + response.status + " " + response.statusText);
            }
            return response.json();
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

const requestParams = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer BQAY8QYNgPy6i-R9bieOsu95TCvssFwg8Xu9SV23c2bjOlwH5jWNAQ_peC2h5ZTFM_1OICeB8fbFJ7Yy6yo0NDRwXmeihDM81bFozLX-5QcjEtNDFJGIjmPf2RGnJRaNEcxcLGnFuaRhad4nthd9vDQWar0SflyUX7nD8z8eAaGIblN3mg'
    },
    mode: 'cors',
    cache: 'default',
};
