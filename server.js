var http = require("http");
var config = require("config");
var argv = require("yargs").argv;
var request = require("request");
var simpleOauth2 = require("simple-oauth2");
var url = require("url");

// Get config from /config/default.json
const port = config.get("App").port;
// If port was not provided in config assume port 3117
if(port == null) {
    port = 3117;
    console.log("Port was not provided in config file! Using default: " + port);
}

const facebookClientID = config.get("Facebook").facebookAPPClientID;
if(facebookClientID == null || facebookClientID.length < 1) {
    console.error("No facebook client ID provided in config file!");
    process.exit(1);
}
const facebookSecret = config.get("Facebook").facebookAPPSecret;
if(facebookSecret == null || facebookSecret.length < 1) {
    console.error("No facebook secret provided in config file!");
    process.exit(1);
}
const facebookCallbackUrl = config.get("Facebook").facebookCallbackUrl;

// redirectUrl should be redirect url to provide to passport
var redirectPath = null;
if(argv.redirectUrl != null) {
    redirectPath = SplitPath(argv.redirectUrl);
}
// If command line argument redirectUrl was not provided assume that callback should be to this server on GET /callback
else {
    redirectPath = SplitPath("localhost:" + port + "/callback");
    console.log("redirectUrl argument was not provided! Assuming " + redirectPath.fullPath + " as callback url");
}

var oauth2 = simpleOauth2.create({
    // Facebook app details
    client: {
        id: facebookClientID,
        secret: facebookSecret
    },
    // Facebook token uri
    auth: {
        tokenHost: "https://www.facebook.com",
        tokenPath: "/v2.8/dialog/oauth",
        authorizePath: "/v2.8/dialog/oauth"
    }
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: redirectPath.fullPath,
    scope: "",
    state: ""
});

var server = http.createServer((req, res) => {
    var parsedUrl = url.parse(req.url, true);

    if(parsedUrl.pathname == "/auth") {
        req.setEncoding("utf8");

        // Redirect to Facebook auth dialog
        res.writeHead(301, { Location: authorizationUri });
        res.end();
    }
    else if(parsedUrl.pathname == "/callback") {
        res.writeHead(200, {"Content-Type": "text/plain"});

        // Returned token should be "code" in url query
        var authToken = {
            token: parsedUrl.query.code
        };

        if(authToken.token != null) {
            res.write(authToken.token);
        }
        else {
            res.write("error: no token received");
        }
        res.end();

        // After getting token redirect to provided uri
    }
    else {
        // Handle errors?
        // path mismatch, access restriction?
        // 404?
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("not found");
    }
});

// Start the server
server.listen(port, () => {
    console.log("Listening on port", port);
    console.log("User will be redirected to", redirectPath.fullPath);
});

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
