var mktoHelper = require('../helpers/mkto')
const url = require('url');
const http = require('https');
var access_token;

var requestObject = {
    protocol: 'https:',
    hostname: mktoHelper.munchkin_id + ".mktorest.com",
    path: "/rest/v1/leads.json",
    headers: {},
    query: {
        fields: "firstName,lastName,email,updatedAt,id"
    }
};

function upsertLead(data, callback) {
    var postData = JSON.stringify({   
        action: "createOrUpdate",
        lookupField: "email",
        input:[data.body]
    });

    requestObject.method = 'POST';
    requestObject.headers['Authorization'] = 'Bearer ' + data.access_token;
    requestObject.headers['Content-Type'] = 'application/json';
    requestObject.headers['Content-Length'] = Buffer.byteLength(postData);

    var req = http.request(requestObject, function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(JSON.parse(str));
        });       
    });
    req.write(postData);
    req.end();
}

function getLeadBy(data, filterType, filterValue, callback) {
    requestObject.query.filterType = filterType;
    requestObject.query.filterValues = filterValue;
    requestObject.headers['Authorization'] = 'Bearer ' + data.access_token;
    if (data.custumFields) {
        for (var index = 0; index < data.custumFields.length; index++) {
            var field = custumFields[index];
            urlObject.query.fields += ',' + field;
        }
    }

    var parsedUrl = url.parse(url.format(requestObject));
    requestObject.path += parsedUrl.path;

    var req = http.request(requestObject, function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });
        response.on('end', function () {
            callback(JSON.parse(str));
        });
    })
    req.end();
}

var mkto = {
    getLeadById: function(id, callback) {
        mktoHelper.access_token(function(data) {
            getLeadBy(data, 'id', id, callback);
        });
    },    
    getLeadsByCookie: function(cookie, callback) {
        mktoHelper.access_token(function(data) {
            getLeadBy(data, 'cookie', cookie, callback);
        });
    },
    getLeadsByEmail: function(email, callback) {
        mktoHelper.access_token(function(data) {
            getLeadBy(data, 'email', email, callback);
        });
    },
    upsertLead: function(body, callback){
        mktoHelper.access_token(function(data) {
            data.body = body;
            upsertLead(data, callback);
        });
    }
}

module.exports = mkto;