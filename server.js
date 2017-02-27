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

// Configure passport-facebook
passport.use(new Strategy(
    {
        clientID: facebookClientID,
        clientSecret: facebookSecret,
        callbackURL: facebookCallbackUrl
    }, function(accessToken, refreshToken, profile, cb) {
        OnSuccess(accessToken, profile);
        console.log("access token:", accessToken, "profile", profile);
        return cb(null, profile);
    }
    ));

var server = express();

server.use(require("body-parser").urlencoded({ extended: true }));
server.use(passport.initialize());

// GET /auth will start authentication and show facebook dialog
server.get("/auth", passport.authenticate("facebook", { session: false }));

// GET /redirect will check if user is authenticated and either redirect to GET /success or GET /err
server.get("/redirect",
    passport.authenticate("facebook", { session: false, successRedirect: "/success", failureRedirect: "/err" }));

server.get("/err", function(req, res) {
    res.status(401).json({message:"ERROR"}).end();
});

// GET /success will redirect to path provided in command line argument redirectUrl
server.get("/success", function(req, res) {
    res.redirect(redirectPath.fullPath);
});

server.listen(3000, function() {
    console.log("Listening on port", port);
    console.log("Token will be sent via POST to", tokenPath.fullPath);
    console.log("User will be redirected to", redirectPath.fullPath);
});

function OnError() {
    err = new Error("failed to authenticate");
    console.log(err);
}

// Sends authentication token via POST method to url provided in command line argument sendTokenUrl
function OnSuccess(token, profile) {
    var sendSuccess = {
        "token": token,
        // "timestamp": Date.now(),
        // "profile": profile
    };

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
    console.log("sending token via POST to", tokenPath.fullPath);
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
        fullPath: "http://" + hostname + ":" + port + path
    }
    return retVal;
}
