const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./helpers/logger");

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

logger.configure();

app.listen(7746, function () {
    console.log("App running on port.", 7746);
});