import {getJsonResponse} from './http_help.js';


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
