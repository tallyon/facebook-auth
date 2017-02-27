var express = require("express");
var bodyParser = require("body-parser");

var server = express();
const port = 3001;

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.post("/token/", function(req, res) {
    console.log(req.body);
    res.end();
});

server.listen(port);
