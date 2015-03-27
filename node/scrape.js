var CronJob, YouTube, async, cheerio, date, fs, get_data, http, moment, out_file, pages, request, songDataReady, songs, update_data, youTube;

http = require("http");

request = require("request");

cheerio = require("cheerio");

fs = require("fs");

CronJob = require('cron').CronJob;

YouTube = require('youtube-node');

moment = require('moment');

async = require('async');

youTube = new YouTube();

songs = [];

out_file = "../songs.json";

pages = "http://mwave.interest.me/kpop/chart.m";

date = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ");

youTube.setKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg');

youTube.addParam("type", "video");

youTube.addParam("part", "id");

youTube.addParam("order", "relevance");

youTube.addParam("publishedAfter", date);

youTube.addParam("videoDefinition", "high");

youTube.addParam("videoEmbeddable", "true");

get_data = function(url, callback) {
  return request(url, function(error, response, html) {
    var $, parsedResults;
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(html);
      parsedResults = [];
      $("div.list_song tr").each(function(i, element) {
        var artist, mwave, query, rank, title;
        artist = $(this).find(".tit_artist a:first-child").text().replace("(", "").replace(")", "").replace("'", "");
        title = $(this).find(".tit_song a").text().replace("(", "").replace(")", "").replace("'", "");
        rank = $(this).find(".nb em").text();
        query = artist + " " + title;
        if ((artist != null) && artist !== "") {
          mwave = {
            artist: artist,
            title: title,
            query: query.toLowerCase(),
            rank: rank
          };
          return parsedResults.push(mwave);
        }
      });
      return callback(parsedResults);
    }
  });
};

update_data = function() {
  return get_data(pages, function(data) {
    songs = data;
    return async.each(songs, (function(song, callback) {
      youTube.search(song.query, 50, function(error, result) {
        if (error) {
          console.log(error);
          return callback();
        } else if (result.pageInfo.totalResults < 20) {
          console.log("not enough songs for " + song.query);
          return callback();
        } else if (!result.items[0]) {
          console.log("no matches for " + song.query);
          return callback();
        } else if (result.items[0].id == null) {
          console.log("no id for " + song.query);
          return callback();
        } else {
          song.youtubeId = result.items[0].id.videoId;
          return callback();
        }
      });
      return;
      return console.log("done");
    }), function(err) {
      if (err) {
        console.log('A song failed to process');
      } else {
        console.log('All songs have been processed successfully');
      }
      songDataReady();
    });
  });
};

songDataReady = function() {
  var song;
  songs = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = songs.length; _i < _len; _i++) {
      song = songs[_i];
      if (song.youtubeId != null) {
        _results.push(song);
      }
    }
    return _results;
  })();
  return console.log(JSON.stringify(songs));

  /*
  youTube.getById songs[0].youtubeId, (error, result) ->
    if error
      console.log error
    else
      console.log JSON.stringify(result, null, 2)
    return
   */

  /*
  fs.writeFile out_file, JSON.stringify(songs), (err) ->
    throw err if err
    console.log "JSON saved to #{out_file}"
    return
   */

  /*
  request.post
    url: "http://jombly.com:3000/update"
    body: JSON.stringify data
    headers: {"Content-Type": "application/json;charset=UTF-8"}
  , (error, response, body) ->
    console.log error
    console.log response.statusCode
    return
   */
};

update_data();
