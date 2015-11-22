var app, bodyParser, express, fs, out_file, server, songs;
var path = require('path');

express = require("express");

bodyParser = require("body-parser");

fs = require("fs");

app = express();

out_file = "./songs.json";
index = __dirname+"\\index.html";
console.log(index);

songs = [];

app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));

app.all("/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET,PUT");
  next();
});

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  extended: false
}));

app.post("/update", function(req, res) {
  songs = req.body;
  res.sendStatus(200);
  return console.log("Updated songs!");
});

app.post("/getSong", function(req, res) {
  var query;
  query = req.body.query;
  if (songs === void 0 || songs.length <= 0) {
    return fs.readFile(out_file, "utf8", "w", function(err, in_file) {
      if (err) {
        throw err;
      }
      if (!err) {
        songs = JSON.parse(in_file);
      }
      return res.send(songs.filter(function(q) {
        return q.query === query;
      }));
    });
  } else {
    return res.send(songs.filter(function(q) {
      return q.query === query;
    }));
  }
});

app.get("/today", function(req, res) {
  if (songs.length <= 0) {
    console.log("sending from JSON: " + out_file);
    return fs.readFile(out_file, "utf8", "w", function(err, in_file) {
      if (err) {
        throw err;
      }
      if (!err) {
        songs = JSON.parse(in_file);
        console.log(songs);
        return res.send(songs);
      }
    });
  } else {
    console.log("sending existing from memory");
    return res.send(songs);
  }
});

app.get("/", function(req, res) {
    return res.sendFile(index)
});

server = app.listen(5000, function() {
  var host, port;
  host = "127.0.0.1";//server.address().address;
  port = server.address().port;
  return console.log("App listening at http://" + host + ":" + port);
});
