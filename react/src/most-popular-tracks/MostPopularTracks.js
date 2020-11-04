import React from 'react';
import './../index.css';
import TimeframeSelector from './TimeframeSelector';
import { getJsonResponse, post} from './../HttpHelper';
import TracksDisplay from './TracksDisplay';
import AddPlaylist from './AddPlaylist';

class MostPopularTracks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeframe: 'short_term',
            tracksCache: {},
            tracks: [],
            hasFetchedTracks: false,
            trackPlaying: false,
            createdPlaylists : [],
            hasCreatedPlaylist : false
        };
        this.onTimeframeSelect = this.onTimeframeSelect.bind(this);
        this.play = this.play.bind(this);
        this.pause = this.pause.bind(this);
        this.exportToPlaylist = this.exportToPlaylist.bind(this);
    };

    doDownload() {
        var cache = this.state.tracksCache;
        if (cache == undefined) {
            cache = {}
        } else {
            if (this.state.timeframe in cache) {
                this.setState({ tracks: cache[this.state.timeframe]['processed'] });
                return;
            } else {
                cache[this.state.timeframe] = {
                    'raw': [],
                    'processed': [],
                    'genreHistogram': {}
                }
            }
        }
        let tracksRaw = [];
        let tracksProcessed = [];

        var url = "https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=" + this.state.timeframe;
        var trackIndex = 0;
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
                    if (image['height'] == 300) { //yuck hack to get mid sized image from array
                        mediumImage = image;
                        break;
                    }
                }

                //mapping stuff not working at all, probably just don't do this
                tracksProcessed.push({
                    'track_name': name,
                    'artist_name': artistName,
                    'album_name': albumName,
                    'track_id': id,
                    'preview_url': element['preview_url'],
                    'image': mediumImage,
                    'index': trackIndex
                });
                trackIndex++;
            }))
            .finally(() => {
                var cacheForTimeRange = cache[this.state.timeframe];
                if (cacheForTimeRange === undefined) {
                    cacheForTimeRange = {};
                }
                cacheForTimeRange['processed'] = tracksProcessed;
                cacheForTimeRange['raw'] = tracksProcessed;
                this.setState(
                    {
                        hasFetchedTracks: true,
                        tracks: tracksProcessed,
                        tracksCache: cache
                    }
                );
            });
    };

    exportToPlaylist() {
        let name = 'most popular tracks in ' + this.state.timeframe;
        if (this.state.createdPlaylists.includes(name)) {
            return; //simple way of not creating many duplicate playlists
        }
        this.state.createdPlaylists.push(name);
        
        const getMyProfilePath = 'https://api.spotify.com/v1/me';
        let profileResponse = getJsonResponse(getMyProfilePath);
        profileResponse.then(profile => {
            let profileId = profile['id'];
            const playlistsPath = 'https://api.spotify.com/v1/users/' + profileId + '/playlists';

            let playlistRequest = {
                'name': name,
                'public': false
            };
            let playlist = post(playlistsPath, playlistRequest);
            playlist.then(playlistJson => {
                let playlistId = playlistJson['id'];
                const playlistPath = 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks';
                var tracksRequest = [];
                for (let index = 0; index < this.state.tracks.length; index++) {
                    const track = this.state.tracks[index];
                    if (track['track_id'] != null) {
                        tracksRequest.push('spotify:track:' + track['track_id']);
                    }
                }
                let fullPlaylistRequest = {
                    'uris': tracksRequest
                };
                //then add all tracks
                post(playlistPath, fullPlaylistRequest);
                this.setState({hasCreatedPlaylist : true});
            });

        });
    };

    onTimeframeSelect(event) {
        this.setState({ timeframe: event.target.value });
    };

    play(track) {
        if (track.preview_url === null) {
            alert('This track does not have a preview link:(');
            console.error('Track ' + track.trackId + " does not have an mp3 preview url")
            console.error(track);
            return;
        }
        if (this.state.trackPlaying !== undefined && this.state.trackPlaying) {
            alert('Pause or let the current track finish playing before starting another (your ears will thank you)')
            return;
        }
        var dupTrack = track;
        dupTrack.isPlaying = true;
        var audio;
        if (track.audio != null) {
            //track has been played recently so resume from where it left off
            audio = track.audio;
        } else {
            audio = new Audio(track.preview_url);
            audio.addEventListener("ended", () => this.state.trackPlaying = false);
        }
        dupTrack.audio = audio;
        audio.play();

        const tracksCopy = this.state.tracks.slice();
        tracksCopy[track.index] = dupTrack;
        this.setState({
            tracks: tracksCopy,
            trackPlaying: true
        });
    };

    pause(track) {
        if (track.preview_url == null) {
            return;
        }
        if (track.isPlaying) {
            var audio = track.audio;
            audio.pause();
            var dupTrack = track;
            dupTrack.isPlaying = false;

            const tracksCopy = this.state.tracks.slice();
            tracksCopy[track.index] = dupTrack;
            this.setState({
                tracks: tracksCopy,
                trackPlaying: false
            });
        }
    };

    render() {
        return (
            <div>
                <h1 class="topTitle">Find out what your top played tracks and genres are on Spotify!</h1>
                <h3>Find your most played tracks</h3>
                {/* This is how you pass props, oml I'm a fool and a dreamer */}
                <TimeframeSelector
                    timeframe={this.state.timeframe}
                    onTimeframeSelect={this.onTimeframeSelect}
                />
                <button class="nice-button" onClick={() => this.doDownload(this.state.timeframe)}>Go</button>
                <AddPlaylist 
                    exportToPlaylist = {this.exportToPlaylist}
                    hasFetchedTracks = {this.state.hasFetchedTracks}
                    hasCreatedPlaylist = {this.state.hasCreatedPlaylist}
                />
                <TracksDisplay
                    tracks = {this.state.tracks}
                    play = {this.play}
                    pause = {this.pause}
                />
            </div>
        );
    }
}

export default MostPopularTracks;
