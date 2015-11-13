var HttpClient, ReplaceNumberWithCommas, addToHistory, current_song, dont_play, isPlaying, newSong, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, pauseVideo, player, randSong, resize, songDataReady, song_data, song_history, startVideo, stopVideo, url_params,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

song_data = null;

dont_play = JSON.parse(localStorage.getItem("dontPlay")) || [];

current_song = null;

player = null;

isPlaying = false;

song_history = [];

url_params = ["enablejsapi=1", "controls=0", "showinfo=0", "modestbranding=0", "autoplay=1", "cc_load_policy=0", "iv_load_policy=3", "origin=http://127.0.0.1/", "playsinline=1", "disablekb=1", "fs=0", "rel=0", "wmode=transparent"].join("&");

ReplaceNumberWithCommas = function(yourNumber) {
  var components;
  components = yourNumber.toString().split(".");
  components[0] = components[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return components.join(".");
};

onYouTubeIframeAPIReady = function() {
  var client;
  client = new HttpClient();
  client.get("http://127.0.0.1:3000/today", function(result) {
    var ratio, song, width;
    song_data = JSON.parse(result);
    songDataReady();
    width = $(window).width();
    ratio = 16 / 9;
    song = randSong();
    current_song = song;
    return player = new YT.Player('player', {
      width: $(window).width(),
      height: Math.ceil(width / ratio),
      videoId: song.youtubeId,
      playerVars: {
        controls: 0,
        showinfo: 0,
        modestbranding: 1,
        disablekb: 1,
        autoplay: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        origin: "http://127.0.0.1/",
        playsinline: 1,
        fs: 0,
        rel: 0,
        wmode: "transparent"
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  });
};

resize = function() {
  var height, pHeight, pWidth, plr, ratio, width;
  width = $(window).width();
  height = $(window).height();
  plr = $("#player");
  ratio = 16 / 9;
  if (width / ratio < height) {
    pWidth = Math.ceil(height * ratio);
    return plr.width(pWidth).height(height).css({
      left: (width - pWidth) / 2,
      top: 0
    });
  } else {
    pHeight = Math.ceil(width / ratio);
    return plr.width(width).height(pHeight).css({
      left: 0,
      top: (height - pHeight) / 2
    });
  }
};

songDataReady = function() {
  var query, song, _i, _j, _len, _len1, _ref;
  for (_i = 0, _len = song_data.length; _i < _len; _i++) {
    song = song_data[_i];
    if (_ref = song.query, __indexOf.call(dont_play, _ref) < 0) {
      $("#topList ol").append("<li class='topSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
    }
  }
  for (_j = 0, _len1 = dont_play.length; _j < _len1; _j++) {
    query = dont_play[_j];
    song = ((function() {
      var _k, _len2, _results;
      _results = [];
      for (_k = 0, _len2 = song_data.length; _k < _len2; _k++) {
        song = song_data[_k];
        if (song.query === query) {
          _results.push(song);
        }
      }
      return _results;
    })())[0];
    $("#badList ol").append("<li class='badSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
  }
};

onPlayerReady = function(event) {
  event.target.playVideo();
  $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
};

onPlayerStateChange = function(event) {
  var duration, progressTimer;
  player = event.target;
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    duration = player.getDuration();
    $("#progress").attr("max", duration);
    $("#play").addClass("hidden");
    $("#pause").removeClass("hidden");
    progressTimer = setInterval(function() {
      var currentTime, timeDiff;
      currentTime = player.getCurrentTime();
      timeDiff = (currentTime / duration) * 100;
      return $("#progress").val(currentTime);
    }, 1000);
  }
  if (event.data === YT.PlayerState.ENDED) {
    clearTimeout(progressTimer);
    newSong();
  }
  if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    $("#play").removeClass("hidden");
    $("#pause").addClass("hidden");
    clearTimeout(progressTimer);
  }
};

stopVideo = function() {
  player.stopVideo();
};

startVideo = function() {
  player.playVideo();
};

pauseVideo = function() {
  player.pauseVideo();
};

newSong = function(song) {
  if (song == null) {
    song = randSong();
  }
  if (song === current_song) {
    newSong();
  }
  player.loadVideoById(song.youtubeId);
  current_song = song;
  $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
  return addToHistory(song);
};

addToHistory = function(song) {
  var len, max;
  len = song_history.length;
  max = 19;
  song_history.unshift(song.query);
  if (len > max) {
    song_history.splice(max + 1, len - max);
  }
};

randSong = function() {
  var songs;
  songs = song_data.filter(function(x) {
    var _ref;
    return _ref = x.query, __indexOf.call(dont_play, _ref) < 0;
  }).filter(function(y) {
    var _ref;
    return _ref = y.query, __indexOf.call(song_history, _ref) < 0;
  });
  return songs[Math.floor(Math.random() * song_data.length)];
};

HttpClient = function() {
  this.get = function(url, callback) {
    var req;
    req = new XMLHttpRequest;
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        callback(req.responseText);
      }
    };
    req.open('GET', url, true);
    req.send(null);
  };
};

$("#dontPlay").on("click", function() {
  var _ref;
  if (_ref = current_song.query, __indexOf.call(dont_play, _ref) < 0) {
    dont_play.push(current_song.query);
    localStorage.setItem("dontPlay", JSON.stringify(dont_play));
    $("#badList ol").append("<li class='badSong' data-song=" + current_song.rank + "> <strong>" + current_song.artist + "</strong> / <em>" + current_song.title + "</em> </li>");
    $("#topList ol > li:nth-child(" + current_song.rank + ")").remove();
    return newSong();
  }
});

$('#badList').on("click", ".badSong", function() {
  var id, q, song;
  id = this.getAttribute("data-song");
  $(this).remove();
  song = song_data[id - 1];
  dont_play = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = dont_play.length; _i < _len; _i++) {
      q = dont_play[_i];
      if (q !== song.query) {
        _results.push(q);
      }
    }
    return _results;
  })();
  localStorage.setItem("dontPlay", JSON.stringify(dont_play));
  return $("#topList ol > li:nth-child(" + id + ")").before("<li class='topSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
});

$("#next").on("click", function() {
  return newSong();
});

$("#topListBtn").on("click", function() {
  $("#screen").toggle();
  $("#topListBtn").toggleClass("active");
  $("#topList").toggleClass("active");
  $("#badList").toggleClass("active");
  $("#info").removeClass("active");
  $("#songInfo").removeClass("active");
  $("#volumeBar").removeClass("active");
  $("#volume").removeClass("active");
  $('#playerControls').addClass("show");
  return $('#playerControls').removeClass("squareTop");
});

$('#topList').on("click", ".topSong", function() {
  var id;
  id = this.getAttribute("data-song");
  newSong(song_data[id - 1]);
  $("#screen").hide();
  $("#topListBtn").toggleClass("active");
  $("#topList").toggleClass("active");
  $("#badList").toggleClass("active");
  return $('#playerControls').removeClass("show");
});

$('#controlsContainer').hover((function() {
  $('#playerControls').addClass("show");
}), function() {
  if ($("#topListBtn").hasClass("active") === false) {
    $('#playerControls').removeClass("show");
    $("#info").removeClass("active");
    $("#songInfo").removeClass("active");
    $("#volumeBar").removeClass("active");
    $("#volume").removeClass("active");
    $('#playerControls').removeClass("squareTop");
  }
});

$('#progressContainer').hover((function() {
  $('#progress').addClass("show");
}), function() {
  $('#progress').removeClass("show");
});

$('#progress').on("input", function() {
  return player.seekTo(this.value);
});

$('#progress').on("change", function() {
  return player.seekTo(this.value);
});

$('#play').on("click", function() {
  $("#play").toggleClass("hidden");
  $("#pause").toggleClass("hidden");
  return startVideo();
});

$('#pause').on("click", function() {
  $("#play").toggleClass("hidden");
  $("#pause").toggleClass("hidden");
  return pauseVideo();
});

$('#info').on("click", function() {
  $("#topListBtn").removeClass("active");
  $("#topList").removeClass("active");
  $("#badList").removeClass("active");
  $("#screen").hide();
  $("#volumeBar").removeClass("active");
  $("#volume").removeClass("active");
  $("#info").toggleClass("active");
  $("#songInfo").toggleClass("active");
  if ($("#volume").hasClass("active") === true || $("#info").hasClass("active") === true) {
    return $("#playerControls").addClass("squareTop");
  } else {
    return $("#playerControls").removeClass("squareTop");
  }
});

$('#volume').on("click", function() {
  $("#topListBtn").removeClass("active");
  $("#topList").removeClass("active");
  $("#badList").removeClass("active");
  $("#screen").hide();
  $("#info").removeClass("active");
  $("#songInfo").removeClass("active");
  $("#volume").toggleClass("active");
  $("#volumeBar").toggleClass("active");
  $("#playerControls").toggleClass("squareTop");
  if ($("#volume").hasClass("active") === true || $("#info").hasClass("active") === true) {
    return $("#playerControls").addClass("squareTop");
  } else {
    return $("#playerControls").removeClass("squareTop");
  }
});

$('#volumeBar').on("change input", function() {
  return player.setVolume(this.value);
});

$(window).on('resize', function() {
  return resize();
});

$(window).on('focus load', function() {
  var timeout;
  $("#playerControls").addClass("show");
  return timeout = setTimeout((function() {
    if ($('#controlsContainer').is(":hover") !== true) {
      return $("#playerControls").removeClass("show");
    }
  }), 5000);
});

$(document).ready(function() {
  resize();
  $.getJSON("http://graph.facebook.com/?id=http://127.0.0.1", function(fbdata) {
    $("#facebook-count").text(ReplaceNumberWithCommas(fbdata.shares));
  });
  $.getJSON("http://cdn.api.twitter.com/1/urls/count.json?url=http://127.0.0.1&callback=?", function(twitdata) {
    $("#twitter-count").text(ReplaceNumberWithCommas(twitdata.count));
  });
  if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
    return $("#iosWarning").addClass("show");
  }
});
