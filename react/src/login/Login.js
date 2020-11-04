import './Login.css';
import React from 'react';

class Login extends React.Component {
    render() {
        let clientId = 'e997acf50d1b47e0ad1c2d2c22cac1b1';
        let redirectUrl = 'http://localhost:3000/spotify-top-tracks';
        let loginBaseUrl = 'https://accounts.spotify.com/authorize';

        var urlSearchParams = new URLSearchParams();
        urlSearchParams.set('client_id', clientId);
        urlSearchParams.set('response_type', 'token');
        urlSearchParams.set('redirect_uri', redirectUrl);
        urlSearchParams.set('scope', 'user-top-read,user-read-private,playlist-modify-private')

        let loginUrl = loginBaseUrl + '?' + urlSearchParams.toString();
        return (
            <div>
                <h1 class="topTitle">Find out what your top played tracks and genres are on Spotify!</h1>

                <div class="loginLink">
                    <a class="pseudoButton" href={loginUrl}>Please login with spotify</a>
                </div>

                <div class="footer">
                    <h5>About</h5>
                    <p>This website uses a readonly connection to Spotify's public API to find your most played tracks and genres</p>
                    <p>It can also generate recomendations based on those songs</p>
                    <p>And maybe one day export playlists and things</p>
                </div>
            </div>
        );
    }
}

export default Login;
