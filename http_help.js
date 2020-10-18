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
};

function extractSpotifyAuthKeyFromUrl() {
    let uri = window.location.hash; 
    let params = new URLSearchParams(uri.substring(1));
    return params.get('access_token');
};

const requestParams = {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + extractSpotifyAuthKeyFromUrl()
    },
    mode: 'cors',
    cache: 'default',
};

export {getJsonResponse};
