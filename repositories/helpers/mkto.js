const url = require('url');
const http = require('https');
var mktoConfig = require('../../config/mkto')();

function get_access_token(callback) {
    var urlObject = {
        protocol: 'https:',
        host: mktoConfig.munchkin_id +'.mktorest.com/',
        pathname: "identity/oauth/token",
        query: {
            munchkin_id: mktoConfig.munchkin_id,
            client_id: mktoConfig.client_id,
            client_secret: mktoConfig.client_secret,
            grant_type: mktoConfig.grant_type
        }
    };
    
    http.get(encodeURI(url.format(urlObject)), function(response) {
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            callback(JSON.parse(data));
        });
    }).end();
}

var mkto = {
    munchkin_id: mktoConfig.munchkin_id,
    access_token: get_access_token
}

module.exports = mkto;


