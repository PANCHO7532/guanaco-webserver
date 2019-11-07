# Guanaco Webserver
## An simple webserver maded with Node.JS

### Features
1) Webserver :o
2) Delivers any type of common media
3) You can pause downloads and resume it later
4) ???

### Install
1) Download this repo by clicking "Download ZIP" or click [here](https://github.com/PANCHO7532/guanaco-webserver/archive/master.zip)
2) Decompress in an empty folder
3) Modify mainPort variable in index.js with the listen port of your choice

3a) If do you want, modify webroot directory with the actual folder that you want to use for store your webcontent
4) Put some content in public_html
5) Open an console in the folder and write "node index.js"
6) Profit?

### Bugs
1) Parent directory actually goes to root instead of previous folder
2) Range header may crash the server due to lack of error handling
3) Media streaming returns an 239 byte content in Chromium based browsers (Chrome, Opera, etc)
4) Title header bugged when displaying the contents of an subfolder without index

### TO-DO
1) Virtual Servers
2) .jscx

### Third-Party software/code
- This webserver contains a file called "mimes.json" extracted from [snekfetch](https://github.com/devsnek/snekfetch)

### License
See LICENSE file for more details, you may not be allowed to modify defualt assets in /data/visualRes

Copyright PANCHO7532 - P7COMunications LLC
