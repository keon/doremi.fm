var CronJob, LD, YouTube, add_to_query, async, blacklist, cheerio, date, fs, gaon_kor_url, gapi_key, get_data, has_english, has_korean, http, kbs_eng_url, mnet_kor_url, mnet_url, moment, out_file, request, scrape, songDataReady, songs, superlist, urls, whitelist, youTube,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

gapi_key = "AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg";

http = require("http");

request = require("request");

cheerio = require("cheerio");

fs = require("fs");

CronJob = require("cron").CronJob;

YouTube = require("youtube-node");

moment = require("moment");

async = require("async");

youTube = new YouTube();

songs = [];

out_file = "../songs.json";

mnet_url = "http://mwave.interest.me/mcountdown/vote/mcdChart";

mnet_kor_url = "http://www.mnet.com/chart/Kpop/all/";

gaon_kor_url = "http://gaonchart.co.kr/main/section/chart/online.gaon?serviceGbn=&termGbn=week&hitYear=&targetTime=&nationGbn=K";

kbs_eng_url = "http://world.kbs.co.kr/english/program/program_musictop10.htm";

urls = [mnet_url, kbs_eng_url, gaon_kor_url, mnet_kor_url];

date = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ");

blacklist = ["simply k-pop", "tease", "teaser", "phone", "iphone", "ipad", "gameplay", "cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr", "inkigayo", "reaction", "highlight", "medley", "dorito", "english version", "japanese version", "vietnamese version", "chinese version", "student", "college", "highschool", "tribute", "nom", "fame", "fame us", "fameus", "famous", "trailer", "music bank", "music core", "show", "exodus", "funny", "mama", "event", "fail", "fails", "full album", "mix", "megamix", "compilation", "one direction", "stage", "comeback", "comeback stage"];

whitelist = ["kpop", "k pop", "k-pop", "korea", "kr"];

superlist = ["mv", "m v", "m/v", "musicvideo", "music video", "full audio", "fullaudio", "complete audio", "completeaudio", "official"];

has_korean = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g;

has_english = /[A-Za-z]/g;

add_to_query = " korean MV";

youTube.setKey(gapi_key);

youTube.addParam("type", "video");

youTube.addParam("part", "id");

youTube.addParam("order", "relevance");

youTube.addParam("publishedAfter", date);

youTube.addParam("videoDefinition", "high");

youTube.addParam("videoEmbeddable", "true");

youTube.addParam("videoCategoryId", 10);

LD = function(s, t) {
  var c1, c2, cost, d, i, j, m, n, _i, _j, _k, _l, _len, _len1, _m;
  n = s.length;
  m = t.length;
  if (n === 0) {
    return m;
  }
  if (m === 0) {
    return n;
  }
  d = [];
  for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
    d[i] = [];
  }
  for (i = _j = 0; 0 <= n ? _j <= n : _j >= n; i = 0 <= n ? ++_j : --_j) {
    d[i][0] = i;
  }
  for (j = _k = 0; 0 <= m ? _k <= m : _k >= m; j = 0 <= m ? ++_k : --_k) {
    d[0][j] = j;
  }
  for (i = _l = 0, _len = s.length; _l < _len; i = ++_l) {
    c1 = s[i];
    for (j = _m = 0, _len1 = t.length; _m < _len1; j = ++_m) {
      c2 = t[j];
      cost = c1 === c2 ? 0 : 1;
      d[i + 1][j + 1] = Math.min(d[i][j + 1] + 1, d[i + 1][j] + 1, d[i][j] + cost);
    }
  }
  return d[n][m];
};

get_data = function(url, callback) {
  return request(url, function(error, response, html) {
    var $;
    if (error) {
      console.log(error);
    }
    if (!error && response.statusCode === 200) {
      $ = cheerio.load(html);
      if (url === mnet_url) {
        $("div.voteWeekListResult li").each(function(i, element) {
          var artist, mwave, rank, title;
          artist = $(this).find(".artist").text().replace(/[\,\(\)\[\]\\\/\<\>\;\"\r\n\t]/ig, " ").trim().toLowerCase();
          title = $(this).find(".title").text().replace(/[\,\(\)\[\]\\\/\<\>\;\"\r\n\t]/ig, " ").trim().toLowerCase();
          rank = $(this).find(".rank").text();
          if ((artist != null) && artist !== "") {
            mwave = {
              artist: artist,
              title: title,
              rank: rank
            };
            return songs.push(mwave);
          }
        });
      }
      if (url === gaon_kor_url) {
        $(".chart tr").each(function(i, element) {
          var artist, gaon, rank, title;
          artist = $(this).find(".subject p:nth-child(2)").text().split("|")[0].replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ");
          title = $(this).find(".subject p:first-child").text().replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ");
          rank = $(this).find(".ranking span").text();
          if (rank === "") {
            rank = $(this).find(".ranking").text();
          }
          if ((artist != null) && artist !== "") {
            gaon = {
              artist: artist,
              title: title,
              rank: rank
            };
            return songs.push(gaon);
          }
        });
      }
      if (url === mnet_kor_url) {
        $(".MnetMusicList tr").each(function(i, element) {
          var artist, mnet_kor, rank, title;
          artist = $(this).find(".MMLIInfo_Artist").text().replace(/\s*\(.*?\)\s*/g, '');
          title = $(this).find(".MMLI_Song").text().replace(/\s*\(.*?\)\s*/g, '').replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ");
          rank = $(this).find(".MMLI_RankNum").text().replace(/\D/g, '');
          if ((artist != null) && artist !== "") {
            mnet_kor = {
              artist: artist,
              title: title,
              rank: rank
            };
            return songs.push(mnet_kor);
          }
        });
      }
      if (url === kbs_eng_url) {
        $(".top10_list_1 ul").each(function(i, element) {
          var artist, kbs_eng, rank, title;
          artist = $(this).find(".tit span").text().replace(/\s*\(.*?\)\s*/g, '');
          title = $(this).find(".tit strong").text().replace(/\s*\(.*?\)\s*/g, '').replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ");
          rank = $(this).find(".num img").attr("alt").replace(/\D/g, '');
          if ((artist != null) && artist !== "") {
            kbs_eng = {
              artist: artist,
              title: title,
              rank: rank
            };
            return songs.push(kbs_eng);
          }
        });
      }
      return callback();
    } else {
      return callback();
    }
  });
};

scrape = function() {
  return async.series([
    (function(callback) {
      async.each(urls, (function(url, done) {
        get_data(url, function() {
          console.log("in get data " + url);
          return done();
        });
      }), function() {
        console.log("done scraping");
        return callback(null, 'scraping succeeded');
      });
    }), (function(callback) {
      var song, _i, _len;
      for (_i = 0, _len = songs.length; _i < _len; _i++) {
        song = songs[_i];
        song.artist = song.artist.toLowerCase().replace(/feat.\s*([^\n\r]*)/ig, "").replace(/ft.\s*([^\n\r]*)/ig, "").replace(/prod.\s*([^\n\r]*)/ig, "").replace(/\s+/g, " ").trim();
        song.title = song.title.toLowerCase().replace(/feat.\s*([^\n\r]*)/ig, "").replace(/ft.\s*([^\n\r]*)/ig, "").replace(/prod.\s*([^\n\r]*)/ig, "").replace(/\s+/g, " ").trim();
      }
      console.log("done cleaning songs");
      return callback(null, 'cleaning songs succeeded');
    }), (function(callback) {
      var song, _i, _len;
      for (_i = 0, _len = songs.length; _i < _len; _i++) {
        song = songs[_i];
        song.query = "" + song.artist + " - " + song.title + add_to_query;
      }
      console.log("done adding queries");
      return callback(null, 'query adding succeeded');
    }), (function(callback) {
      var match_query, q, song, u, unique, unique_queries, _i, _len;
      unique = [];
      for (_i = 0, _len = songs.length; _i < _len; _i++) {
        song = songs[_i];
        unique_queries = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = unique.length; _j < _len1; _j++) {
            u = unique[_j];
            _results.push(u.query);
          }
          return _results;
        })();
        match_query = (function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = unique_queries.length; _j < _len1; _j++) {
            q = unique_queries[_j];
            if (LD(song.query, q) <= 6) {
              _results.push(q);
            }
          }
          return _results;
        })();
        if (match_query.length === 0) {
          unique.push(song);
        }
      }
      songs = unique;
      console.log("done deDuping");
      callback(null, 'deDupe succeeded');
    }), (function(callback) {
      var s;
      songs = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = songs.length; _i < _len; _i++) {
          s = songs[_i];
          if (s.title.length > 2 && s.artist.length > 2) {
            _results.push(s);
          }
        }
        return _results;
      })();
      console.log("done removing too short");
      callback(null, 'too short removal succeeded');
    })
  ], function(err, results) {
    var s;
    console.log((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = songs.length; _i < _len; _i++) {
        s = songs[_i];
        _results.push(s.query);
      }
      return _results;
    })());
    async.each(songs, (function(song, callback) {
      return youTube.search(song.query, 50, function(error, r1) {
        var item, key;
        if (error) {
          console.log(error);
          return callback();
        } else if (r1.pageInfo.totalResults < 20) {
          console.log("not enough songs for " + song.query);
          return callback();
        } else if (!r1.items[0]) {
          console.log("no matches for " + song.query);
          return callback();
        } else if (r1.items[0].id == null) {
          console.log("no id for " + song.query);
          return callback();
        } else {
          s = (function() {
            var _i, _len, _ref, _results;
            _ref = r1.items;
            _results = [];
            for (key = _i = 0, _len = _ref.length; _i < _len; key = ++_i) {
              item = _ref[key];
              _results.push(item.id.videoId);
            }
            return _results;
          })();
          return youTube.getById(s.join(","), (function(error, r2) {
            var acceptable, badCount, duration, j, likeCount, min, min_pos, query_arr, sec, sec_pos, title, titleCount, title_arr, viewCount, w, _i, _len, _ref;
            if (error) {
              console.log(error);
              return callback();
            } else {
              acceptable = [];
              _ref = r2.items;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                j = _ref[_i];
                if (!(j.status.publicStatsViewable === true)) {
                  continue;
                }
                title = j.snippet.title.toLowerCase().toLowerCase().replace(/[\!\@\#\$\%\^\&\*\(\)\-\_\;\:\"\\\/\[\]\{\}\<\>\|\,\+\=]/g, "").replace(/feat.\s*([^\n\r]*)/ig, "").replace(/ft.\s*([^\n\r]*)/ig, "").replace(/prod.\s*([^\n\r]*)/ig, "").replace(/\s+/g, " ").trim();
                duration = j.contentDetails.duration.replace("PT", "");
                min_pos = duration.indexOf("M");
                sec_pos = duration.indexOf("S");
                min = duration.substring(0, min_pos);
                sec = duration.substring(min_pos + 1, sec);
                viewCount = j.statistics.viewCount;
                likeCount = j.statistics.likeCount;
                title_arr = title.split(" ");
                query_arr = song.query.split(" ");
                titleCount = ((function() {
                  var _j, _len1, _results;
                  _results = [];
                  for (_j = 0, _len1 = title_arr.length; _j < _len1; _j++) {
                    w = title_arr[_j];
                    if (__indexOf.call(query_arr, w) >= 0) {
                      _results.push(w);
                    }
                  }
                  return _results;
                })()).length;
                badCount = ((function() {
                  var _j, _len1, _results;
                  _results = [];
                  for (_j = 0, _len1 = title_arr.length; _j < _len1; _j++) {
                    w = title_arr[_j];
                    if (__indexOf.call(blacklist, w) >= 0) {
                      _results.push(w);
                    }
                  }
                  return _results;
                })()).length;
                if (viewCount > 200000 && likeCount > 2000 && badCount === 0 && min < 4) {
                  acceptable.push(j);
                }
              }
              if (acceptable.length > 0) {
                console.log("PASS: " + song.query);
                song.youtubeId = acceptable[0].id;
                song.statistics = acceptable[0].statistics;
                return callback();
              } else {
                console.log("FAIL: " + song.query);
                return callback();
              }
            }
          }));
        }
      });
    }), function(err) {
      if (err) {
        return console.log(err);
      } else {
        console.log('All songs have been processed successfully');
        return songDataReady();
      }
    });
  });
};

songDataReady = function() {
  var i, key, song, _i, _len;
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
  songs.sort(function(x, y) {
    return x.rank - y.rank;
  });
  for (key = _i = 0, _len = songs.length; _i < _len; key = ++_i) {
    i = songs[key];
    i.rank = key + 1;
  }
  fs.writeFile(out_file, JSON.stringify(songs), function(err) {
    if (err) {
      throw err;
    }
    console.log("JSON saved to " + out_file);
  });
  return request.post({
    url: "http://jombly.com:3000/update",
    body: JSON.stringify(songs),
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    }
  }, function(error, response, body) {
    console.log("error code: " + error);
    console.log("status code: " + response.statusCode);
  });
};

new CronJob("0 0 * * *", function() {
  return scrape();
}, null, true);
