var CronJob, YouTube, async, blacklist, checkWhitelist, cheerio, date, fs, get_data, has_korean, http, moment, out_file, pages, request, songDataReady, songs, update_data, whitelist, youTube,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

blacklist = ["simply k-pop", "tease", "teaser", "phone", "iPhone", "iPad", "Gameplay", "cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr"];

whitelist = ["mnet", "full audio", "kpop", "k pop", "k-pop", "korean", "korea", "kor", "kor pop", "korean pop", "korean-pop", "kor-pop", "korean version", "kr", "kr ver", "official", "mv", "m/v", "music video"];

has_korean = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;

youTube.setKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg');

youTube.addParam("type", "video");

youTube.addParam("part", "id");

youTube.addParam("order", "relevance");

youTube.addParam("publishedAfter", date);

youTube.addParam("videoDefinition", "high");

youTube.addParam("videoEmbeddable", "true");

checkWhitelist = function(song, query) {
  var cleaned_description, cleaned_query, cleaned_title, description, descriptionCount, description_array, goodDescription, goodTitle, query_array, query_count, score, term, title, titleCount, title_array, word, _i, _j, _len, _len1;
  title = song.snippet.title;
  description = song.snippet.description;
  score = 0;
  query_count = 0;
  cleaned_title = title.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
  cleaned_description = description.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
  cleaned_query = query.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim();
  if (has_korean.test(title) === true) {
    score++;
  }
  if (has_korean.test(description) === true) {
    score++;
  }
  goodTitle = 0;
  goodDescription = 0;
  for (_i = 0, _len = whitelist.length; _i < _len; _i++) {
    term = whitelist[_i];
    if (title.indexOf(term) !== -1) {
      goodTitle++;
    }
    if (description.indexOf(term) !== -1) {
      goodDescription++;
    }
  }
  if (goodTitle > 0) {
    score++;
  }
  if (goodDescription > 0) {
    score++;
  }
  title_array = cleaned_title.split(" ");
  description_array = cleaned_description.split(" ");
  query_array = cleaned_query.split(" ");
  titleCount = 0;
  descriptionCount = 0;
  for (_j = 0, _len1 = query_array.length; _j < _len1; _j++) {
    word = query_array[_j];
    if (__indexOf.call(title_array, word) >= 0) {
      titleCount++;
    }
    if (__indexOf.call(description_array, word) >= 0) {
      descriptionCount++;
    }
  }
  if (titleCount = query_array.length || (descriptionCount = query_array.length)) {
    score += 3;
  }
  return score;
};

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
      youTube.search(song.query, 50, function(error, r1) {
        if (error) {
          console.log(error);
          return callback();
        } else if (r1.pageInfo.totalResults < 10) {
          console.log("not enough songs for " + song.query);
          return callback();
        } else if (!r1.items[0]) {
          console.log("no matches for " + song.query);
          return callback();
        } else if (r1.items[0].id == null) {
          console.log("no id for " + song.query);
          return callback();
        } else {

          /*
          ids = (i.id.videoId for i,key in r1.items).join(",")
          
           * Get additional stats for those 5 matches
          youTube.getById ids, (error, r2) ->
            if error
              console.log error
              callback()
          
            else
               * Check for black and white list, push into acceptable array
              acceptable = []
              for j in r2.items
                title = j.snippet.title
                description = j.snippet.description
                bad = 0
                for term in blacklist
                  if title.indexOf(term) isnt -1 then bad++
                  if description.indexOf(term) isnt -1 then bad++
          
                j.score = checkWhitelist(j,song.query)
                if bad is 0 and j.score > 2 then acceptable.push j
          
               * Sort by score and then viewCount
              acceptable.sort (x, y) ->
                n = y.score - x.score
                return n unless n is 0
                y.statistics.viewCount - x.statistics.viewCount
          
              best = acceptable[0]
          
              song.youtubeId = best.id
              callback()
           */
          song.youtubeId = r1.items[0].id.videoId;
          return callback();
        }
      });
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
  return fs.writeFile(out_file, JSON.stringify(songs), function(err) {
    if (err) {
      throw err;
    }
    console.log("JSON saved to " + out_file);
  });

  /*
  request.post
    url: "http://jombly.com:3000/update"
    body: JSON.stringify songs
    headers: {"Content-Type": "application/json;charset=UTF-8"}
  , (error, response, body) ->
    console.log "error code: #{error}"
    console.log "status code: #{response.statusCode}"
    return
   */
};

update_data();
