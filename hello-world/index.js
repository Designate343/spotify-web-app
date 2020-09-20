var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue.js!'
    },
    methods: {
        reverseMessage: function () {
            this.message = this.message.split('').reverse().join('');
        }
    }
});

var app6 = new Vue({
    el: '#app-6',
    data: {
        message: 'Hello Vue!'
    }
});

var spotifyTopTracks = new Vue({
    el: '#spotify-top-tracks',
    data: {
        tracks: [
        ]
    },
    methods: {
        downloadTopTracks: function () {
            var url = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term";
            this.tracks = [];

            fetch(url, requestParams)
                .then(response => response.json())
                .then(response => response['items'])
                .then(items => items.forEach(element => {
                    let name = element['name'];
                    console.log(element);
                    let artists = element['artists'];
                    //only use first artist even if there are 2
                    let artistName = artists[0]['name'];
                    let albumName = element["album"]["name"];
                    let id = element['id'];

                    let trackString = name + " " + artistName + " " + albumName + " " + id;
                    this.tracks.push({
                        'text': trackString
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
        searchForTrackName: function () {
            var url = 'https://api.spotify.com/v1/search';
            let type = 'track';

            var urlSearchParams = new URLSearchParams('market=GB');
            urlSearchParams.set('type', type);
            //TODO: not updating if search is replaced
            urlSearchParams.set('q', this.searchString);
            urlSearchParams.set('limit', 10);

            getTrackList(url + '?' + urlSearchParams.toString())
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

        generateRecomendations(trackId) {
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

            fetch(url + '?' + urlSearchParams.toString(), requestParams)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok, response ' + response.status + " " + response.statusText);
                    }
                    return response.json();
                })
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
                        console.log(trackString);

                        //component does not update, probably because of https://forum.vuejs.org/t/nested-list-not-updating-when-pushing-to-the-nested-array/81996/2
                        //would probably work if recomendations loaded for every track pre-emptively
                        // this.tracks[trackIndex].recomendations.push({
                        //     'text': trackString,
                        //     'id': id
                        // });

                        recomendations.push({
                                'text': trackString,
                                'id': id
                            });
                    });
                    var newValue = this.tracks[trackIndex];
                    newValue.recomendations = recomendations;
                    //needs to do this special setting https://vuejs.org/v2/guide/reactivity.html#For-Arrays
                    getRecomendations.$set(getRecomendations.tracks, trackIndex, newValue);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        }
    }
});

async function getTrackList(url) {
    //try and map to reduced object in here?
    return fetch(url, requestParams)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok, response ' + response.status + " " + response.statusText);
            }
            return response.json();
        })
        .then(json => json['tracks'])
        .then(tracks => tracks['items'])
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

const requestParams = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer BQA8IUtEAOHADFthQUKi9x1c0iK6LO8YCJpIqPJqm1eaaQ8kNIkvM-aDNyswGQGhCE-LsIhEuy1WYgq-7D7Pntp1pBCmgUowBiZqufqqEqUpDi-M3y5_81sAYKdyVYuHiJ6REBKB-XIvZk8cxICU68JvWkIp9SY0mPK_9LLvEhE82cKR0Q'
    },
    mode: 'cors',
    cache: 'default',
};
