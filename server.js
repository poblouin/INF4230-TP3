var http = require("http");
var fs = require("fs");

var mime = require("mime");

var express = require("express");

var generateurHoraire = require(__dirname + "/generateur-horaire.js");

//middlewares
var logger = require("morgan");
var serveStatic = require("serve-static");
var favicon = require("serve-favicon");
var bodyParser = require("body-parser");

var PORT = 3000;

var app = express();

app.use(favicon(__dirname + "/app/favicon.ico"));
app.use(logger(":method :url"));
app.use(serveStatic(__dirname + "/app"));

var api = express();

//Les services offerts
api.post("/createCSP", generateurHoraire.postCSP);
api.get("/CSP", generateurHoraire.getGenerer);
api.get("/CSPs/:index", generateurHoraire.getCSPIndex);

app.use(bodyParser.json());

app.use("/api", api);

http.createServer(app).listen(PORT);

console.log("Serveur demarre sur le port " + PORT);
