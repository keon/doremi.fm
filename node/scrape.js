var CronJob, YouTube, async, blacklist, checkWhitelist, cheerio, date, fs, get_data, has_korean, http, mnet_kor_url, mnet_url, mnet_vote_url, moment, out_file, request, songDataReady, songs, update_data, urls, whitelist, youTube,
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

mnet_url = "http://mwave.interest.me/kpop/chart.m";

mnet_kor_url = "";

mnet_vote_url = "http://mwave.interest.me/mcountdown/voteState.m";

urls = [mnet_url, mnet_vote_url, mnet_kor_url];

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
    var $;
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(html);
      if (url = mnet_url) {
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
            return songs.push(mwave);
          }
        });
        callback();
      }
      if (url = mnet_vote_url) {
        songs.push("hahaha");
        return callback();
      }
    }
  });
};

update_data = function() {
  return async.eachSeries(urls, (function(url, callback) {
    get_data(url, function() {
      console.log(songs);
      return callback();
    });
  }), function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('All files have been processed successfully');
    }
  });

  /*
  get_data mnet_url, (data) ->
    songs = data
    async.each songs, ((song, callback) ->
      youTube.search(song.query, 50, (error, r1) ->
  
        if error
          console.log error
          callback()
  
        else if r1.pageInfo.totalResults < 10
          console.log "not enough songs for #{song.query}"
          callback()
  
        else if not r1.items[0]
          console.log "no matches for #{song.query}"
          callback()
  
        else if not r1.items[0].id?
          console.log "no id for #{song.query}"
          callback()
  
        else
          s = r1.items[0].id.videoId
          youTube.getById s, (error, r2) ->
            if error
              console.log error
              callback()
  
            else
              j = r2.items[0]
              title = j.snippet.title
              description = j.snippet.description
              viewCount = j.statistics.viewCount
              bad = 0
              for term in blacklist
                if title.indexOf(term) isnt -1 then bad++
                if description.indexOf(term) isnt -1 then bad++
  
              score = checkWhitelist(j,song.query)
  
              if bad > 1 or score < 3 or viewCount < 5000
                console.log "#{song.query} doesn't pass checks: score: #{score}, bad: #{bad}"
                callback()
  
              else
                song.youtubeId = s
                song.statistics = j.statistics
                callback()
  
      )
      return
    ), (err) ->
      if err then console.log err
      else
        console.log 'All songs have been processed successfully'
        songDataReady()
   */
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
