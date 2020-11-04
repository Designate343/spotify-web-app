async function getJsonResponse(url) {
    var params = {};
    putAll(params, requestParams);
    params['method'] = 'GET';
    return fetch(url, params)
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

async function post(url, json) {
    var params = {};
    putAll(params, requestParams);
    params['method'] = 'POST';
    params['body'] = JSON.stringify(json);
    var headers = requestParams['headers'];
    headers['content-type'] = 'application/json';
    return fetch(url, params)
        .then(response => {
            if (response.status != 200 && response.status != 201) {
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

function putAll(copyTo, copyFrom) {
    for (var key in copyFrom) {
        copyTo[key] = copyFrom[key];
    }
};

const requestParams = {
    headers: {
        'Authorization': 'Bearer ' + extractSpotifyAuthKeyFromUrl(),
    },
    mode: 'cors',
    cache: 'default',
};

export {getJsonResponse, post};
