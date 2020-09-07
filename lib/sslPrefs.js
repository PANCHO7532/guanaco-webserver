const fs = require('fs');
var sslCert;
var sslKey;
function getSSL(type) {
    switch(type) {
        case "cert":
            try {
                sslCert = fs.readFileSync('cfg/sslcert.crt');
                return sslCert;
            } catch(error) {
                console.log("[SSL-ERROR] - Error trying to retrieve SSL Certificate! - Code: " + error.code);
                return null;
            }
        case "key":
            try {
                sslKey = fs.readFileSync('cfg/sslkey.pem');
                return sslKey;
            } catch(error) {
                console.log("[SSL-ERROR] - Error trying to retrieve SSL Private Key! - Code: " + error.code);
                return null;
            }
        default:
            console.log("[ERROR] - Unknown type: " + type);
            return null;
    }
}
module.exports.getSSL = function(type) { return getSSL(type); };