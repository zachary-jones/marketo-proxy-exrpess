var mktoHelper = require('../helpers/mkto')
const url = require('url');
const http = require('https');
var access_token;


function reqObject() {
    this.protocol = 'https:',
    this.hostname = mktoHelper.munchkin_id + ".mktorest.com",
    this.path = "/rest/v1/leads.json",
    this.headers = {},
    this.query = {
        fields: "firstName,lastName,email,updatedAt,id,phone"
    }
};

function upsertLead(data, callback) {
    var requestObject = new reqObject();
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
    var requestObject = new reqObject();
    
    console.dir(requestObject);
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
    console.dir(requestObject.path);
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


module.exports = function() {
    return mkto;
}
