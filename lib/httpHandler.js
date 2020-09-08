const fs = require('fs');
const os = require('os');
const path = require('path');
const querystring = require('querystring');
const generateErrorPage = require('./httpErrors').generateErrorPage;
const genericUtils = require("./genericUtils");
/*
* TODO:
* - Implementation of http code 206
* - (not so important probably), Parent directory is incorrectly leading two dirs behind actual path
* - Filename that contains emojis are throwing 404
* - Fix traversal path vulnerability
*/
function generateIndex(path1, requestObject) {
    //return "<h1>Index generation point xd</h1>";
    var indexTemplate;
    var dirContentTemplate;
    var dirContent = fs.readdirSync(path1);
    var parsedDirList = "";
    try {
        indexTemplate = fs.readFileSync("resources/indexTemplate.html").toString();
        dirContentTemplate = fs.readFileSync("resources/dirContentTemplate.html").toString();
        dirContentTemplate = dirContentTemplate.substring(dirContentTemplate.indexOf("[start]") + 7);
    } catch(error) {
        console.log("[ERROR] - " + error);
    }
    // alright, so, for sort first directories, then files, it's simple, we do on separate for loops
    // unless there's an more nicely way
    for(c = 0; c < dirContent.length; c++) {
        //dir loop
        if(fs.existsSync(path1 + dirContent[c]) && fs.statSync(path1 + dirContent[c]).isDirectory()) {
            parsedDirList+=dirContentTemplate + "\r\n\t\t\t";
            parsedDirList=parsedDirList.replace("{imageObject}", "<img src=\"/rsrcfs/visualRes/folder.png\"/>");
            parsedDirList = parsedDirList.replace("{modifiedDate}", fs.statSync(path1 + dirContent[c])["mtime"]);
            parsedDirList = parsedDirList.replace("{sizeValue}", fs.statSync(path1 + dirContent[c])["size"]);
            //parsedDirList = parsedDirList.replace("{fileObject}", dirContent[c]);
            parsedDirList = parsedDirList.replace("{fileObject}", "<a href=\"" + requestObject.url + dirContent[c] + "\">" + dirContent[c] + "</a>");
        } else if(fs.existsSync(path1 + "/" + dirContent[c]) && fs.statSync(path1 + "/" + dirContent[c]).isDirectory()) {
            parsedDirList+=dirContentTemplate + "\r\n\t\t\t";
            parsedDirList=parsedDirList.replace("{imageObject}", "<img src=\"/rsrcfs/visualRes/folder.png\"/>");
            parsedDirList = parsedDirList.replace("{modifiedDate}", fs.statSync(path1 + "/" + dirContent[c])["mtime"]);
            parsedDirList = parsedDirList.replace("{sizeValue}", fs.statSync(path1 + "/" + dirContent[c])["size"]);
            //parsedDirList = parsedDirList.replace("{fileObject}", dirContent[c]);
            parsedDirList = parsedDirList.replace("{fileObject}", "<a href=\"" + requestObject.url + "/" + dirContent[c] + "\">" + dirContent[c] + "</a>");
        }
    }
    for(d = 0; d < dirContent.length; d++) {
        //file loop
        if(fs.existsSync(path1 + dirContent[d]) && fs.statSync(path1 + dirContent[d]).isFile()) {
            parsedDirList+=dirContentTemplate + "\r\n\t\t\t";
            parsedDirList=parsedDirList.replace("{imageObject}", "<img src=\"/rsrcfs/visualRes/generic_file.png\"/>");
            parsedDirList = parsedDirList.replace("{modifiedDate}", fs.statSync(path1 + dirContent[d])["mtime"]);
            parsedDirList = parsedDirList.replace("{sizeValue}", fs.statSync(path1 + dirContent[d])["size"]);
            //parsedDirList = parsedDirList.replace("{fileObject}", dirContent[d]);
            parsedDirList = parsedDirList.replace("{fileObject}", "<a href=\"" + requestObject.url + dirContent[d] + "\">" + dirContent[d] + "</a>");
        } else if(fs.existsSync(path1 + "/" + dirContent[d]) && fs.statSync(path1 + "/" + dirContent[d]).isFile()) {
            parsedDirList+=dirContentTemplate + "\r\n\t\t\t";
            parsedDirList=parsedDirList.replace("{imageObject}", "<img src=\"/rsrcfs/visualRes/generic_file.png\"/>");
            parsedDirList = parsedDirList.replace("{modifiedDate}", fs.statSync(path1 + "/" + dirContent[d])["mtime"]);
            parsedDirList = parsedDirList.replace("{sizeValue}", fs.statSync(path1 + "/" + dirContent[d])["size"]);
            //parsedDirList = parsedDirList.replace("{fileObject}", dirContent[d]);
            parsedDirList = parsedDirList.replace("{fileObject}", "<a href=\"" + requestObject.url + "/" + dirContent[d] + "\">" + dirContent[d] + "</a>");
        }
    }
    //index parsing
    indexTemplate = indexTemplate.replace("{serverName}", "Guanaco Webserver v/2.1b");
    indexTemplate = indexTemplate.replace("{osType}", os.type());
    indexTemplate = indexTemplate.replace("{osRelease}", os.release());
    indexTemplate = indexTemplate.replace("{hostName}", genericUtils.parseHost(requestObject));
    indexTemplate = indexTemplate.replace("{localPort}", requestObject.connection.localPort);
    indexTemplate = indexTemplate.replace("{currentDir}", requestObject.url);
    indexTemplate = indexTemplate.replace("{currentBodyDir}", requestObject.url);
    indexTemplate = indexTemplate.replace("{dirContent}", parsedDirList);
    return indexTemplate;
}
function mainFunction(webrootPath, req, res, isSSL) {
    console.log(req.method + " " + req.url + " - " + req.headers["user-agent"]);
    if(webrootPath == "/") { webrootPath = "" }
    // This function here will control basically every request on the server.
    /* FIRST, WE CHECK RESOURCE FILES, IF RSRCFS EXISTS IN PUBLIC_HTML, WE SKIP IT */
    if(req.url == "/rsrcfs/visualRes/generic_file.png" && !fs.existsSync(webrootPath + req.url)) {
        res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("resources/visualRes/generic_file.png")["size"]});
        fs.createReadStream("resources/visualRes/generic_file.png").pipe(res);
        return;
    }
    if(req.url == "/rsrcfs/visualRes/back.png" && !fs.existsSync(webrootPath + req.url)) {
        res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("resources/visualRes/back.png")["size"]});
        fs.createReadStream("resources/visualRes/back.png").pipe(res);
        return;
    }
    if(req.url == "/rsrcfs/visualRes/folder.png" && !fs.existsSync(webrootPath + req.url)) {
        res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("resources/visualRes/folder.png")["size"]});
        fs.createReadStream("resources/visualRes/folder.png").pipe(res);
        return;
    }
    //end resource handling, start with some folder logic
    if(fs.existsSync(webrootPath + querystring.unescape(req.url)) && fs.statSync(webrootPath + querystring.unescape(req.url)).isFile()) {
        //is a file, ok, we retrieve it
        res.writeHead(200, {'Accept-Ranges':'bytes','Content-Type':genericUtils.mimeCalc(path.extname(querystring.unescape(req.url))), "Content-Length":fs.statSync(webrootPath + querystring.unescape(req.url))["size"], "Server":"guanacoWebserver/2.1b"});
        fs.createReadStream(webrootPath + querystring.unescape(req.url)).pipe(res);
        return;
    } else if(fs.existsSync(webrootPath + querystring.unescape(req.url)) && fs.statSync(webrootPath + querystring.unescape(req.url)).isDirectory()) {
        //is a directory, fine, we have more options here
        switch(path.parse("req.url")["base"]) {
            case "":
                //is root dir
                if(fs.existsSync(querystring.unescape(webrootPath + "/index.html"))) {
                    //check if we have an index
                    res.writeHead(200, {"Content-Type":"text/html", "Content-Length":fs.statSync(querystring.unescape(webrootPath + "/index.html"))["size"], "Server": "guanacoWebserver/2.1b"});
                    fs.createReadStream(querystring.unescape(webrootPath + "/index.html")).pipe(res);
                    return;
                } else {
                    //there isn't an index? We generate an index with the files
                    const indexResponse = generateIndex(querystring.unescape(webrootPath + req.url), req);
                    res.writeHead(200, {"Content-Type":"text/html", "Content-Length": indexResponse.length, "Server": "guanacoWebserver/v2.1b"});
                    res.end(indexResponse);
                    return;
                }
            default:
                //is another dir or whatever
                if(fs.existsSync(querystring.unescape(webrootPath + req.url + "/index.html"))) {
                    //there's an index on that directory?
                    res.writeHead(200, {"Content-Type":"text/html", "Content-Length":fs.statSync(querystring.unescape(webrootPath + req.url + "/index.html"))["size"], "Server": "guanacoWebserver/2.1b"});
                    fs.createReadStream(querystring.unescape(webrootPath + req.url + "/index.html")).pipe(res);
                    return;
                } else {
                    //no index? We generate it with the files there too.
                    const indexResponse = generateIndex(querystring.unescape(webrootPath + req.url), req);
                    res.writeHead(200, {"Content-Type":"text/html", "Content-Length": indexResponse.length, "Server": "guanacoWebserver/v2.1b"});
                    res.end(indexResponse);
                    return;
                }
        }
    } else {
        //well, isn't an dir, nor a directory, and it doesn't exists "physically", well, 404!
        const errorResponse = generateErrorPage(404, "Not Found", "The requested resource does not exist, lol xd", req);
        res.writeHead(404, {"Content-Type":"text/html", "Content-Length":errorResponse.length, "Server":"guanacoWebserver/2.1b"});
        res.end(errorResponse);
        return;
    }
}
module.exports.main = function(requestObject, responseObject, isSSL) { mainFunction(requestObject, responseObject, isSSL); };