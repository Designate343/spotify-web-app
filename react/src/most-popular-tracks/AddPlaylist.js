import React from 'react';
import './../index.css';

class AddPlaylist extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        let button;
        let playlistCreatedMessage;
        if (this.props.hasFetchedTracks) {
            button = <button class="nice-button" onClick={() => this.props.exportToPlaylist()}>Export playlist to your Spotify</button>
            if (this.props.hasCreatedPlaylist) {
                playlistCreatedMessage = <h3>Playlist created!</h3>
            }
        }

        return (
            <div>
                {button}
                {playlistCreatedMessage}
            </div>
        );
    }
}

export default AddPlaylist;
