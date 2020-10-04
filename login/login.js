var login = new Vue({
    el: '#user-login',
    data: {
        link: buildLogin()
    },
    methods: {
        
    }
});

function buildLogin() {
    let clientId = '817cd0c6df9c452ca730bc02d1837073';
    let redirectUrl = 'http://localhost:8000/index.html';
    let loginBaseUrl = 'https://accounts.spotify.com/authorize';

    var urlSearchParams = new URLSearchParams();
    urlSearchParams.set('client_id', clientId);
    urlSearchParams.set('response_type', 'token');
    urlSearchParams.set('redirect_uri', redirectUrl);
    urlSearchParams.set('scope', 'user-top-read')
    //TODO add state query param

    return loginBaseUrl + '?' + urlSearchParams.toString();
}