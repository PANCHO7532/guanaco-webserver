/*
* Guanaco WebServer by PANCHO7532
* This program comes with an LICENSE file that you must read!
* Copyright (c) 2019 - P7COMunications LLC
*/
// Note to myself: add comments to review what the fuck i am doing
// 01/11/2019: 206 Partial Content support added with the help of codeproject.com
var http = require('http');
var fs = require('fs');
var path = require('path');
var os = require('os');
var util = require('util'); //for debuggung and all of that things
var mainPort = 80;
var webroot = "public_html";
var server = "Guanaco Webserver/1.7.4";
const mime_types = JSON.parse(fs.readFileSync("data/mimes.json"));
if(process.argv[2] == "-v") {
    var verboose = true;
}
//checking if webroot dir exists, if not, then create.
if(!fs.existsSync(webroot)) {
    fs.mkdirSync(webroot);
}
function parseRemoteAddr(raddr) {
    if(raddr.toString().indexOf("ffff") != -1) {
        //is IPV4 address
        return raddr.substring(7, raddr.length);
    } else {
        return raddr;
    }
}
function parseHost(req) {
    if(!req.headers["host"]) {
        var a01 = parseRemoteAddr(req.connection.localAddress);
        return a01;
    } else {
        return req.headers["host"].split(":")[0];
    }
}
function verbooose(req, sc) {
    var ua = "";
    if(!req.headers["user-agent"]) {
        ua = "(no user agent)";
    } else {
        ua = req.headers["user-agent"];
    }
    console.log(parseRemoteAddr(req.connection.remoteAddress) + ":" + req.connection.remotePort + " - " + req.method + " " + req.url +  " " + sc + " - [" + Date() + "] - " + ua);
}
var allowed_methods = [
    "GET"
];
http.createServer(function(req, res){
    if(req) {
        for(c = 0; c < allowed_methods.length; c++) {
            if(req.method != allowed_methods[c]) {
                if(verboose == true) {
                    verbooose(req, 501);
                }
                res.writeHead(501, {'Content-Type':'text/html','Content-Length':fs.statSync("data/staticPages/501.html")["size"], "Server":server});
                var err1 = fs.readFileSync("data/staticPages/501.html").toString();
                err1 = err1.replace("$serverName$", server);
                err1 = err1.replace("$ostype$", os.type());
                err1 = err1.replace("$osrelease$", os.release());
                err1 = err1.replace("$localaddr$", parseHost(req));
                err1 = err1.replace("$localport$", req.connection.localPort);
                res.end(err1);
                return;
            }
        }
        if(req.url == "/sys-bin/folder.png") {
            if(verboose == true) {
                verbooose(req, 200);
            }
            res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("data/visualRes/folder.png")["size"], 'Server':server});
            fs.createReadStream("data/visualRes/folder.png").pipe(res);
            return;
        } else if(req.url == "/sys-bin/generic_file.png") {
            if(verboose == true) {
                verbooose(req, 200);
            }
            res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("data/visualRes/generic_file.png")["size"], 'Server':server});
            fs.createReadStream("data/visualRes/generic_file.png").pipe(res);
            return;
        } else if(req.url == "/sys-bin/back.png") {
            if(verboose == true) {
                verbooose(req, 200);
            }
            res.writeHead(200, {'Content-Type':'image/png', 'Content-Length':fs.statSync("data/visualRes/back.png")["size"], 'Server':server});
            fs.createReadStream("data/visualRes/back.png").pipe(res);
            return;
        }
        var pa1 = path.parse(req.url);
        if(fs.existsSync(webroot + pa1["dir"] + pa1["base"])) {
            if(!fs.statSync(webroot + pa1["dir"] + pa1["base"]).isDirectory()) {
                if(mime_types[pa1["ext"].substring(1, pa1["ext"].length)]) {
                    var mimexd = mime_types[pa1["ext"].substring(1, pa1["ext"].length)]
                } else {
                    var mimexd = "application/octet-stream";
                }
                if(req.headers["range"]) {
                    var ran_st1 = req.headers["range"].split("-");
                    if(ran_st1[0] == "") {
                        var start_range = parseInt(ran_st1[1]);
                        var bln1 = true;
                    } else {
                        var start_range = parseInt(ran_st1[0].substring(6, ran_st1[0].length));
                    }
                    if(ran_st1[1] == "") {
                        var final_range = fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"];
                    } else {
                        if(bln1 == true) {
                            var final_range = fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"];
                        }
                        var final_range = parseInt(ran_st1[1]);
                    }
                    var cl = final_range - start_range + 1;
                    if(start_range > fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"]) {
                        var sr2 = fs.readFileSync("staticPages/416.html");
                        sr2 = sr2.replace("$serverName$", server);
                        sr2 = sr2.replace("$ostype$", os.type());
                        sr2 = sr2.replace("$osrelease$", os.release());
                        sr2 = sr2.replace("$localaddr$", parseHost(req));
                        sr2 = sr2.replace("$localport$", req.connection.localPort);
                        if(verboose == true) {
                            verbooose(req, 416);
                        }
                        res.writeHead(416, {'Content-Type':'text/html', 'Content-Length': sr2.length, "Server":server});
                        res.end(sr2);
                        return;
                    } else if(final_range > fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"]) {
                        var sr2 = fs.readFileSync("staticPages/416.html");
                        sr2 = sr2.replace("$serverName$", server);
                        sr2 = sr2.replace("$ostype$", os.type());
                        sr2 = sr2.replace("$osrelease$", os.release());
                        sr2 = sr2.replace("$localaddr$", parseHost(req));
                        sr2 = sr2.replace("$localport$", req.connection.localPort);
                        if(verboose == true) {
                            verbooose(req, 416);
                        }
                        res.writeHead(416, {'Content-Type':'text/html', 'Content-Length': sr2.length, "Server":server});
                        res.end(sr2);
                        return;
                    }
                    if(verboose == true) {
                        verbooose(req, 206);
                    }
                    res.writeHead(206, {'Content-Type':mimexd, "Accept-Ranges": "bytes", "Content-Range":"bytes=" + start_range + "-" + final_range + "/" + fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"], "Content-Length": cl, "Server":server});
                    fs.createReadStream(webroot + pa1["dir"] + pa1["base"], {start: start_range, end: final_range}).pipe(res);
                } else {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':mimexd, "Accept-Ranges": "bytes", "Content-Length":fs.statSync(webroot + pa1["dir"] + pa1["base"])["size"], "Server":server});
                    fs.createReadStream(webroot + pa1["dir"] + pa1["base"]).pipe(res);
                }
                return;
            } else {
                if(fs.existsSync(webroot + pa1["dir"] + pa1["base"] + "index.html")) {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Content-Length': fs.statSync(webroot + pa1["dir"] + pa1["base"] + "index.html")["size"],'Server':server});
                    if(fs.existsSync(webroot + pa1["dir"] + pa1["base"] + "index.html")) {
                        fs.createReadStream(webroot + pa1["dir"] + pa1["base"] + "index.html").pipe(res);
                    } else {
                        fs.createReadStream(webroot + pa1["dir"] + pa1["base"] + "/index.html").pipe(res);
                    }
                    return;
                } else if(fs.existsSync(webroot + pa1["dir"] + pa1["base"] + "/index.html")) {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Content-Length': fs.statSync(webroot + pa1["dir"] + pa1["base"] + "/index.html")["size"],'Server':server});
                    if(fs.existsSync(webroot + pa1["dir"] + pa1["base"] + "index.html")) {
                        fs.createReadStream(webroot + pa1["dir"] + pa1["base"] + "index.html").pipe(res);
                    } else {
                        fs.createReadStream(webroot + pa1["dir"] + pa1["base"] + "/index.html").pipe(res);
                    }
                    return;
                } else {
                    var se1 = "";
                    se1 += "<!DOCTYPE HTML>\r\n";
                    se1 += "<html>\r\n<head>\r\n<title>Index of " + pa1["dir"] + pa1["base"] + "</title>\r\n</head>\r\n<body>\r\n";
                    se1 += "<h1>Index of " + pa1["dir"] + pa1["base"] + "</h1>\r\n";
                    se1 += '<fieldset>\r\n<table>\r\n<tr><td><img src="/sys-bin/back.png"/></td><td><a href="..">Parent Directory</a></td></tr>\r\n';
                    var se2 = fs.readdirSync(webroot + pa1["dir"] + pa1["base"]);
                    for(c = 0; c < se2.length; c++) {
                        if(fs.statSync(webroot + pa1["dir"] + pa1["base"] + "/" + se2[c]).isDirectory(webroot + "/" + se2[c])) {
                            if(pa1["base"].length < 1) {
                                se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + pa1["dir"] + pa1["base"] + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            } else {
                                se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + pa1["dir"] + pa1["base"] + "/" + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            }
                        } else {
                            //se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                        }
                    }
                    for(c = 0; c < se2.length; c++) {
                        if(fs.statSync(webroot + pa1["dir"] + pa1["base"] + "/" + se2[c]).isDirectory(webroot + "/" + se2[c])) {
                            //se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                        } else {
                            if(pa1["base"].length < 1) {
                                se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + pa1["dir"] + pa1["base"] + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            } else {
                                se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + pa1["dir"] + pa1["base"] + "/" + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            }
                        }
                    }
                    se1 += "</table>\r\n</fieldset>\r\n<br><i>" + server + " (" + os.type() +  " " + os.release() + ") at " + parseHost(req) + " Port " + req.connection.localPort + "</i>\r\n</body>\r\n</html>";
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':se1.length, 'Server':server});
                    res.end(se1);
                }
            }
        } else if(fs.existsSync(webroot + pa1["dir"] + "/" + pa1["base"])) {
            if(!fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"]).isDirectory()) {
                if(mime_types[pa1["ext"].substring(1, pa1["ext"].length)]) {
                    var mimexd = mime_types[pa1["ext"].substring(1, pa1["ext"].length)]
                } else {
                    var mimexd = "application/octet-stream";
                }
                if(req.headers["range"]) {
                    var ran_st1 = req.headers["range"].split("-");
                    if(ran_st1[0] == "") {
                        var start_range = parseInt(ran_st1[1]);
                        var bln1 = true;
                    } else {
                        var start_range = parseInt(ran_st1[0].substring(6, ran_st1[0].length));
                    }
                    if(ran_st1[1] == "") {
                        var final_range = fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"];
                    } else {
                        if(bln1 == true) {
                            var final_range = fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"];
                        }
                        var final_range = parseInt(ran_st1[1]);
                    }
                    var cl = final_range - start_range + 1;
                    if(start_range > fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"]) {
                        var sr2 = fs.readFileSync("staticPages/416.html");
                        sr2 = sr2.replace("$serverName$", server);
                        sr2 = sr2.replace("$ostype$", os.type());
                        sr2 = sr2.replace("$osrelease$", os.release());
                        sr2 = sr2.replace("$localaddr$", parseHost(req));
                        sr2 = sr2.replace("$localport$", req.connection.localPort);
                        if(verboose == true) {
                            verbooose(req, 416);
                        }
                        res.writeHead(416, {'Content-Type':'text/html', 'Content-Length': sr2.length, "Server":server});
                        res.end(sr2);
                        return;
                    } else if(final_range > fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"]) {
                        var sr2 = fs.readFileSync("staticPages/416.html");
                        sr2 = sr2.replace("$serverName$", server);
                        sr2 = sr2.replace("$ostype$", os.type());
                        sr2 = sr2.replace("$osrelease$", os.release());
                        sr2 = sr2.replace("$localaddr$", parseHost(req));
                        sr2 = sr2.replace("$localport$", req.connection.localPort);
                        if(verboose == true) {
                            verbooose(req, 416);
                        }
                        res.writeHead(416, {'Content-Type':'text/html', 'Content-Length': sr2.length, "Server":server});
                        res.end(sr2);
                        return;
                    }
                    if(verboose == true) {
                        verbooose(req, 206);
                    }
                    res.writeHead(206, {'Content-Type':mimexd, "Accept-Ranges": "bytes", "Content-Range":"bytes=" + start_range + "-" + final_range + "/" + fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"], "Content-Length": cl, "Server":server});
                    fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"], {start: start_range, end: final_range}).pipe(res);
                } else {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':mimexd, "Accept-Ranges": "bytes", "Content-Length":fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"])["size"], "Server":server});
                    fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"]).pipe(res);
                }
                return;
            } else {
                if(fs.existsSync(webroot + pa1["dir"] + "/" + pa1["base"] + "index.html")) {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Server':server});
                    if(fs.existsSync(webroot + pa1["dir"] + "/" + pa1["base"] + "index.html")) {
                        fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"] + "index.html").pipe(res);
                    } else {
                        fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"] + "/index.html").pipe(res);
                    }
                    return;
                } else if(fs.existsSync(webroot + pa1["dir"] + "/" + pa1["base"] + "/index.html")) {
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Server':server});
                    if(fs.existsSync(webroot + pa1["dir"] + "/" + pa1["base"] + "index.html")) {
                        fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"] + "index.html").pipe(res);
                    } else {
                        fs.createReadStream(webroot + pa1["dir"] + "/" + pa1["base"] + "/index.html").pipe(res);
                    }
                    return;
                } else {
                    var se1 = "";
                    se1 += "<!DOCTYPE HTML>\r\n";
                    se1 += "<html>\r\n<head>\r\n<title>Index of " + pa1["dir"] + "/"  + pa1["base"] + "</title>\r\n</head>\r\n<body>\r\n";
                    se1 += "<h1>Index of " + pa1["dir"] + "/" + pa1["base"] + "</h1>\r\n";
                    se1 += '<fieldset>\r\n<table>\r\n<tr><td><img src="/sys-bin/back.png"/></td><td><a href="..">Parent Directory</a></td></tr>\r\n';
                    var se2 = fs.readdirSync(webroot + pa1["dir"] + "/" + pa1["base"]);
                    for(c = 0; c < se2.length; c++) {
                        if(fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"] + "/" + se2[c]).isDirectory(webroot + "/" + se2[c])) {
                            if(pa1["base"].length < 1) {
                                se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + pa1["dir"] + "/" + pa1["base"] + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            } else {
                                se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + pa1["dir"] + "/" + pa1["base"] + "/" + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            }
                        } else {
                            //se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                        }
                    }
                    for(c = 0; c < se2.length; c++) {
                        if(fs.statSync(webroot + pa1["dir"] + "/" + pa1["base"] + "/" + se2[c]).isDirectory(webroot + "/" + se2[c])) {
                            //se1 += '<tr><td><img src="/sys-bin/folder.png"/></td><td><a href="' + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                        } else {
                            if(pa1["base"].length < 1) {
                                se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + pa1["dir"] + "/" + pa1["base"] + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            } else {
                                se1 += '<tr><td><img src="/sys-bin/generic_file.png"/></td><td><a href="' + pa1["dir"] + "/" + pa1["base"] + "/" + se2[c] + '">' + se2[c] + "</a></td></tr>\r\n";
                            }
                        }
                    }
                    se1 += "</table>\r\n</fieldset>\r\n<br><i>" + server + " (" + os.type() +  " " + os.release() + ") at " + parseHost(req) + " Port " + req.connection.localPort + "</i>\r\n</body>\r\n</html>";
                    if(verboose == true) {
                        verbooose(req, 200);
                    }
                    res.writeHead(200, {'Content-Type':'text/html', 'Content-Length':se1.length, 'Server':server});
                    res.end(se1);
                }
            }
        } else {
            //var sr1 = "";
            var sr1 = fs.readFileSync("data/staticPages/404.html").toString();
            //take this on count: <i>$serverName$ ($ostype$ $osrelease$) Server at $localaddr$ Port $localport$</i>
            sr1 = sr1.replace("$serverName$", server);
            sr1 = sr1.replace("$ostype$", os.type());
            sr1 = sr1.replace("$osrelease$", os.release());
            sr1 = sr1.replace("$localaddr$", parseHost(req));
            sr1 = sr1.replace("$localport$", req.connection.localPort);
            /*
            sr1 += "<!DOCTYPE HTML>\r\n<html>\r\n<head>\r\n<title>404 Not Found</title>\r\n</head>\r\n<body>\r\n<h1>404 Not Found</h1>\r\n";
            sr1 += "<p>The requested resource can't be found</p>\r\n<hr>\r\n";
            sr1 += "<i>" + server + " (" + os.type() +  " " + os.release() + ") at " + parseHost(req) + " Port " + req.connection.localPort + "</i>\r\n";
            sr1 += "</body>\r\n</html>";
            */
            if(verboose == true) {
                verbooose(req, 404);
            }
            res.writeHead(404, {'Content-Type':'text/html', 'Content-Length': sr1.length, 'Server':server});
            res.write(sr1);
            res.end();
            return;
        }
    }
}).listen(mainPort);
console.log("[INFO] - Server started on port: " + mainPort);