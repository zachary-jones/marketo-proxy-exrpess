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

        function setMktoTrk(form) {
            var trackers = form.querySelectorAll('*[name="_mkto_trk"]');
            if (trackers && trackers.length) {
                for (var i = 0; i < trackers.length; i++) {
                    var trk = trackers[i];
                    trk.value = "";
                }
            } else {
                var element = document.createElement("input");
                element.type = "hidden";
                element.value = "";
                element.name = "_mkto_trk";
                form.appendChild(element);
            }
        }

        var repo = {
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
            getLeadByEmail: function(email, callback) {
                    var options = {
                        type: 'GET',
                        path: 'getLeadsByEmail/' + email,
                        data: undefined
                    };
                    makeRequest(options, callback);
                },            
            upsertLead: function(serializedData, callback) {
                var options = {
                    type: 'POST',
                    path: 'upsertLead/',
                    data: serializedData
                };
                makeRequest(options, callback);
            },
            prepopForm: function(data) {
                latestRecord = {};
                if (data && data.target && data.target.responseText) {
                    var results =JSON.parse(data.target.responseText).result;
                    results = results.sort(function(a,b){
                        return new Date(b.updatedAt) - new Date(a.updatedAt);
                    });
                    latestRecord = {
                        firstName: results[0].firstName,
                        lastName: results[0].lastName,
                        email: results[0].email,
                        phone: results[0].phone,
                    };
                }
                var allForms = document.querySelectorAll('form');
                for (var i = 0; i < allForms.length; i++) {
                    var form = allForms[i];
                    setMktoTrk(form);
                    var allInputFields = form.querySelectorAll('input');
                    for (var y = 0; y < allInputFields.length; y++) {
                        var input = allInputFields[y];
                        for (var property in latestRecord) {
                            if (latestRecord.hasOwnProperty(property)) {
                                if (input.name.toLowerCase() === property.toLowerCase()) {
                                    input.value = latestRecord[property];
                                }
                            }
                        }                        
                    }
                }
            }
        };
        return repo;
    };
})();