import React from 'react';
import './../index.css';

class PreviewPlayer extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        let track = this.props.track;
        const trackPlaying = track.isPlaying;
        let button;
        if (trackPlaying) {
            button = <button class="play-pause-button" onClick={() => this.props.pause(track)}>Pause track</button>
        } else {
            button = <button class="play-pause-button" onClick={() => this.props.play(track)}>Play preview</button>
        }
        return (
            <div>
                {button}
            </div>
        );
    }
}

export default PreviewPlayer;
