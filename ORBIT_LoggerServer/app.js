const express = require("express");
const bodyParser = require("body-parser");
const initLogger = require("./helpers/serverlogger");
const emailer = require("./routes/emailer");

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

initLogger.configure();

emailer(app, initLogger);

app.listen(7747, function () {
    console.log("App running on port.", 7747);
});

//NOTE: 
//PLDT CARES PORT: 7747
//PLDT HOME PORT: 7746
//PLDT CARES WEBSOCKET PORT: 5001
//PLDT HOME WEBSOCKET PORT: 5000