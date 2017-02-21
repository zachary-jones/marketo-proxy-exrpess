(function() {
    var baseUrl = atob('aHR0cHM6Ly9tYXJrZXRvLXByb3h5Lmhlcm9rdWFwcC5jb20vbWt0by9sZWFkcy8=');
    mktoLeads = function(options) {
        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) === 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }    

        function makeRequest(options, callback) {
            var Options = {
                type: 'GET || POST', 
                url: '',
                data: {}
            }
            if (!options) {
                console.log('expected options: ' + console.dir(Options));
                return false;
            }       
                 
            var request = new XMLHttpRequest();
            if (!options.type) {
                options.type = 'GET';
            } else if (options.type === 'POST') {
                request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }
            if (options.path) {
                options.url = baseUrl + options.path;
            }
            request.open(options.type, options.url , true);
            request.onload = callback;
            request.onerror = xHrError;
            if (options.data) {
                request.send(data);
            } else {
                request.send();
            }
        }

        function xHrError(data) {
            //TODO: err handler
            debugger;
        }

        var repo = {
            //mktoLeads().getLeadByCookie(callback);
            getLeadByCookie: function(callback) {
                cookie = getCookie('_mkto_trk');
                    if (cookie) {
                    var options = {
                        type: 'GET',
                        path: 'getLeadsByCookie/' + cookie,
                        data: undefined
                    };
                    makeRequest(options, callback);
                } else {
                    console.log('no tracking cookie found');
                }
            },
            //mktoLeads().upsertLead('email@email.com', callback);
            getLeadByEmail: function(email, callback) {
                    var options = {
                        type: 'GET',
                        path: 'getLeadsByEmail/' + email,
                        data: undefined
                    };
                    makeRequest(options, callback);
                },            
            //mktoLeads().upsertLead({email: email@email.com, first_name: test, last_name: test}, callback);
            upsertLead: function(serializedData, callback) {
                var options = {
                    type: 'POST',
                    path: 'upsertLead/',
                    data: serializedData
                };
                makeRequest(options, callback);
            },
            prepopForm: function(formValues) {
                //loop through each form
                    //loop through each field
                        //set/insert _mkto_trk to ""
                        //prepop matching fields
            }
        };
        return repo;
    };
})();
mktoLeads().getLeadByCookie(function(data){
    if (data && data.target && data.target.responseText) {
        var results =JSON.parse(data.target.responseText).result;
        results = results.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        //update prepop
        mktoLeads().prepopForm({
            firstName: results[0].firstName,
            lastName: results[0].lastName,
            email: results[0].email,
            phone: results[0].phone,
        });
    }
});
mktoLeads().getLeadByEmail('zachary-jones123mad@bisk.com', function(data){
    if (data && data.target && data.target.responseText) {
        var results =JSON.parse(data.target.responseText).result;
        results = results.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        //update prepop
        mktoLeads().prepopForm({
            firstName: results[0].firstName,
            lastName: results[0].lastName,
            email: results[0].email,
            phone: results[0].phone,
        });
    }
});
