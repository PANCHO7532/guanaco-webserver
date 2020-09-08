const fs = require('fs');
function parseRemoteAddr(raddr) {
    if(raddr.toString().indexOf("::ffff") != -1) {
        //is IPV4 address
        return raddr.substring(7, raddr.length);
    } else {
        return raddr;
    }
}
function parseHost(requestObject) {
    if(requestObject.headers["host"]) {
        return parseRemoteAddr(requestObject.connection.localAddress);
    } else {
        return requestObject.headers["host"].split(":")[0];
    }
}
function mimeCalc(extension) {
    var mimeFile;
    try {
        mimeFile = JSON.parse(fs.readFileSync("resources/mimes.json").toString());
        response = mimeFile[extension.substring(1, extension.length)];
    } catch(error) {
        console.log("[ERROR] - Error calculating mime extension, " + error);
        return "application/octet-stream";
    }
    if(!mimeFile[extension.substring(1, extension.length)]) {
        return "application/octet-stream";
    } else {
        return mimeFile[extension.substring(1, extension.length)];
    }
}
function parseConfig() {
    var configFile;
    try {
        configFile = JSON.parse(fs.readFileSync("cfg/config.json").toString());
    } catch(error) {
        console.log("[ERROR] - Error loading config file!, " + error);
        return null;
    }
    return configFile;
}
const httpStatusCodes = [200, 206, 404, 500, 501];
module.exports.parseRemoteAddr = function(address) { return parseRemoteAddr(address); };
module.exports.parseHost = function(requestObject) { return parseHost(requestObject); };
module.exports.mimeCalc = function(extension) { return mimeCalc(extension); };
module.exports.configFile = function() { return parseConfig(); };
module.exports.httpStatusCodes = httpStatusCodes;