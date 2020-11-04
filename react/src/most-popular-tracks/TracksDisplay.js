import React from 'react';
import './../index.css';
import PreviewPlayer from './PreviewPlayer';

class TracksDisplay extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <ul class="inline-list">
                {this.props.tracks.map(track => (
                    <li key={track.track_id}>
                        <div>
                            <div class="track-info-in-list">
                                <p>Track name: {track.track_name}</p>
                                <p>Artist: {track.artist_name}</p>
                            </div>
                            <div class="audio-player-in-image">
                                <img src={track.image.url}></img>
                                <PreviewPlayer
                                    track={track}
                                    play={this.props.play}
                                    pause={this.props.pause}
                                />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }
}

export default TracksDisplay;
