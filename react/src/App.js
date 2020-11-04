import './App.css';
import Login from './login/Login';
import MostPopularTracks from './most-popular-tracks/MostPopularTracks';
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    let uri = window.location.hash; 
    let params = new URLSearchParams(uri.substring(1));
    let accessToken = params.get('access_token');

    this.state = {
      accessToken: accessToken
    }
  }
  render() {
    if (this.state.accessToken == null) {
      return (
        <div class="App">
          <Login/>
        </div>
      );
    } else {
      return (
        <div class="App">
          <MostPopularTracks/>
        </div>
      );
    }
  }
}

export default App;
