var express = require("express");
var passport = require("passport");
var Strategy = require("passport-facebook").Strategy;
var http = require("http");
var config = require("config");
var argv = require("yargs").argv;

// Get config from /config/default.json
const port = config.get("App").port;
const facebookClientID = config.get("Facebook").facebookAPPClientID;
const facebookSecret = config.get("Facebook").facebookAPPSecret;
const facebookCallbackUrl = config.get("Facebook").facebookCallbackUrl;

// sendTokenUrl should be url to call and post token data: localhost:3001/token
var tokenPath = SplitPath(argv.sendTokenUrl);

// redirectUrl should be redirect url to provide to passport
var redirectPath = SplitPath(argv.redirectUrl);

// callbackPath is url that is provided to passport-facebook as callback url
var callbackPath = SplitPath(facebookCallbackUrl);

// Configure passport-facebook
passport.use(new Strategy(
    {
        clientID: facebookClientID,
        clientSecret: facebookSecret,
        callbackURL: facebookCallbackUrl
    }, function(accessToken, refreshToken, profile, cb) {
        SendToken(accessToken, profile);
        return cb(null, profile);
    }
    ));

var server = express();

server.use(require("body-parser").urlencoded({ extended: true }));
server.use(passport.initialize());

// GET /auth will start authentication and show facebook dialog
server.get("/auth", passport.authenticate("facebook", { session: false }));

// On successull authentication redirect to url provided in command line argument redirectUrl
server.get(callbackPath.path, passport.authenticate("facebook", { session: false, successRedirect: redirectPath.fullPath, failureRedirect: "/auth" }));

server.listen(3000, function() {
    console.log("Listening on port", port);
    console.log("Token will be sent via POST to", tokenPath.fullPath);
    console.log("User will be redirected to", redirectPath.fullPath);
});

// Sends authentication token via POST method to url provided in command line argument sendTokenUrl
function SendToken(token, profile) {

    var sendSuccess = {};

    // Check if token is null
    if(token == null || token.length < 1) {
        sendSuccess.error = "error while authenticating, no token received"
    }
    else {
        sendSuccess.token = token;
    }

    var r = http.request({
        host: tokenPath.host,
        method: "POST",
        port: tokenPath.port,
        path: tokenPath.path,
        headers: {
            "Content-Type": "application/json"
        }
    }, function(res) {

    });
    r.write(JSON.stringify(sendSuccess));
    r.end();
}

// Takes string "http://hostname:8080/path/to/resource" and converts it to object with fields:
//  {
//      host,
//      port,
//      path,
//      fullPath
//  }
function SplitPath(arg) {

    // Remove http:// / https:// from start of url
    var removedProtocolString = "";

    if(arg.search("http://") == 0) {
        removedProtocolString = "http://";
    }
    else if(arg.search("https://") == 0) {
        removedProtocolString = "https://";
    }
    
    // Trim removed http/https protocol string from the beginning of the string
    arg = arg.substr(removedProtocolString.length);

    var hostname = arg.split(":")[0];
    var port = arg.split(":")[1].split("/")[0];
    var splitPath = arg.split("/");
    var path = "";

    for(var i = 1; i < splitPath.length; i++) {
        path += "/" + splitPath[i];
    }

    var retVal = {
        host: hostname,
        port: port,
        path: path,
        fullPath: ((removedProtocolString.length > 0) ? removedProtocolString : "http://") + hostname + ":" + port + path
    }
    return retVal;
}
