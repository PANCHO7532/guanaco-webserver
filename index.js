#!/usr/bin/node
/*
* Guanaco Webserver
* Copyright (c) PANCHO7532 - P7COMunications LLC 2020
*/
const http = require('http');
const https = require('https');
const fs = require('fs');
const sslPrefs = require('./lib/sslPrefs');
const httpHandler = require('./lib/httpHandler');
const mainPort = 80;
const mainSSLPort = 443;
const mainServer = http.createServer(function(req, res) { httpHandler.main(req, res); });
const mainServer2 = https.createServer({cert: sslPrefs.getSSL("cert"), key: sslPrefs.getSSL("key")}, function(req, res) { httpHandler.main(req, res, true); });

mainServer.listen(mainPort, function() {
    console.log("[INFO] - Server running on port: " + mainPort);
});
mainServer2.listen(mainSSLPort, function() {
    console.log("[INFO] - SSL Server running on port: " + mainSSLPort);
});