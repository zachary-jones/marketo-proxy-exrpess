var test = {
    munchkin_id: "058-NIT-467",
    client_id: "50966f4b-ce8b-425b-b9c1-282676733428",
    client_secret: "AfO3Ck7BETd5JGsikenPeimpj9fdfgEY",
    grant_type: "client_credentials"
}
var prod = {
    munchkin_id: "058-NIT-467",
    client_id: "50966f4b-ce8b-425b-b9c1-282676733428",
    client_secret: "AfO3Ck7BETd5JGsikenPeimpj9fdfgEY",
    grant_type: "client_credentials"
}

module.exports = function(mode) {
    if (mode === "production" || mode === "prod") { 
        return prod;
    } else {
        return test;
    }
}