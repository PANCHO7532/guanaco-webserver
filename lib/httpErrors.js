const fs = require('fs');
const os = require('os');
const genericUtils = require('./genericUtils');
function generateErrorPage(code, reason, description, requestObject) {
    //load template
    var errorTemplate;
    if(!requestObject) {
        return "<!DOCTYPE HTML>\r\n<html>\r\n<head>\r\n\t<title>500 Internal Server Error</title>\r\n</title>\r\n<body>\r\n\t<h1>500 Internal Server Error</h1>\r\n\t<p>No requestObject provided.</p>\r\n</body>\r\n</html>";
    }
    try {
        errorTemplate = fs.readFileSync("resources/errTemplate.html").toString();
    } catch(error) {
        console.log("[ERROR] - Can't read error template, code: " + error.code);
    }
    if(!code) {
        errorTemplate = errorTemplate.replace("{errCode}", "501");
        errorTemplate = errorTemplate.replace("{errCodeReason}", "Not implemented");
        errorTemplate = errorTemplate.replace("{errBodyCode}", "501");
        errorTemplate = errorTemplate.replace("{errBodyCodeReason}", "Not implemented");
        errorTemplate = errorTemplate.replace("{errDesc}", "Invalid status code provided! Re-check httpErrors.js implementation for changes.");
        errorTemplate = errorTemplate.replace("{serverName}", "Guanaco Webserver v/2.1b");
        errorTemplate = errorTemplate.replace("{osType}", os.type());
        errorTemplate = errorTemplate.replace("{osRelease}", os.release());
        errorTemplate = errorTemplate.replace("{hostName}", genericUtils.parseHost(requestObject));
        errorTemplate = errorTemplate.replace("{localPort}", requestObject.connection.localPort);
    } else {
        if(!reason) { reason = "NO_REASON"}
        if(!description) { description = "NO_DESCRIPTION"}
        errorTemplate = errorTemplate.replace("{errCode}", code);
        errorTemplate = errorTemplate.replace("{errCodeReason}", reason);
        errorTemplate = errorTemplate.replace("{errBodyCode}", code);
        errorTemplate = errorTemplate.replace("{errBodyCodeReason}", reason);
        errorTemplate = errorTemplate.replace("{errDesc}", description);
        errorTemplate = errorTemplate.replace("{serverName}", "Guanaco Webserver v/2.1b");
        errorTemplate = errorTemplate.replace("{osType}", os.type());
        errorTemplate = errorTemplate.replace("{osRelease}", os.release());
        errorTemplate = errorTemplate.replace("{hostName}", genericUtils.parseHost(requestObject));
        errorTemplate = errorTemplate.replace("{localPort}", requestObject.connection.localPort);
    }
    return errorTemplate;
}
module.exports.generateErrorPage = function(errorCode, reason, description, requestObject) { return generateErrorPage(errorCode, reason, description, requestObject) };