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
const configFile = require('./lib/genericUtils').configFile();

const mainServer = http.createServer(function(req, res) { httpHandler.main(configFile["webrootPath"], req, res); });
const mainServer2 = https.createServer({cert: sslPrefs.getSSL("cert"), key: sslPrefs.getSSL("key")}, function(req, res) { httpHandler.main(configFile["webrootPath"], req, res, true); });

mainServer.listen(configFile["httpPort"], function() {
    console.log("[INFO] - Server running on port: " + configFile["httpPort"]);
});
mainServer2.listen(configFile["httpsPort"], function() {
    console.log("[INFO] - SSL Server running on port: " + configFile["httpsPort"]);
});