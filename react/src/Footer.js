import './Footer.css';

function Footer() {
    return (
        <div>
            <div class="footer">
                <h5>About</h5>
                <p>This website uses a readonly connection to Spotify's public API to find your most played tracks and genres</p>
                <p>It can also generate recomendations based on those songs</p>
                <p>And maybe one day export playlists and things</p>
            </div>
        </div>
    );
}

export default Footer;