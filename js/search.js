var HttpClient, current_song, initData, newSong, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, pauseVideo, player, randSong, resize, songDataReady, song_data, startVideo, stopVideo, url_params;

song_data = null;

current_song = null;

player = null;

url_params = ["enablejsapi=1", "origin=http://localhost:8002", "controls=0", "showinfo=0", "modestbranding=0", "autoplay=1", "cc_load_policy=0", "disablekb=1", "iv_load_policy=3", "origin=http://localhost:8002", "playsinline=1", "fs=0", "rel=0", "wmode=transparent"].join("&");

initData = function() {
  var client;
  client = new HttpClient();
  return client.get("http://jombly.com:3000/today", function(result) {
    song_data = JSON.parse(result);
    return songDataReady();
  });
};

onYouTubeIframeAPIReady = function() {
  var ratio, song, width;
  width = $(window).width();
  ratio = 16 / 9;
  song = randSong();
  current_song = song;
  player = new YT.Player('player', {
    width: $(window).width(),
    height: Math.ceil(width / ratio),
    videoId: song.youtubeId,
    playerVars: {
      controls: 0,
      showinfo: 0,
      modestbranding: 1,
      autoplay: 1,
      cc_load_policy: 0,
      disablekb: 1,
      iv_load_policy: 3,
      origin: "http://localhost:8002",
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
  var song, _i, _len;
  for (_i = 0, _len = song_data.length; _i < _len; _i++) {
    song = song_data[_i];
    $("#topList ol").append("<li class='topSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
  }
};

onPlayerReady = function(event) {
  $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
};

onPlayerStateChange = function(event) {
  var duration, progressTimer;
  player = event.target;
  if (event.data === YT.PlayerState.PLAYING) {
    duration = player.getDuration();
    $("#progress").attr("max", duration);
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
  player.loadVideoById(song.youtubeId);
  current_song = song;
  return $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
};

randSong = function() {
  return song_data[Math.floor(Math.random() * song_data.length)];
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

$("#next").on("click", function() {
  return newSong();
});

$("#topListBtn").on("click", function() {
  $("#screen").toggleClass("active");
  $("#topListBtn").toggleClass("active");
  $("#topList").toggleClass("active");
  $("#info").removeClass("active");
  return $("#songInfo").removeClass("active");
});

$('#topList').on("click", ".topSong", function() {
  var id;
  id = this.getAttribute("data-song");
  newSong(song_data[id - 1]);
  $("#screen").toggleClass("active");
  $("#topListBtn").toggleClass("active");
  return $("#topList").toggleClass("active");
});

$('#progress').on("input", function() {
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
  $("#screen").removeClass("active");
  $("#info").toggleClass("active");
  return $("#songInfo").toggleClass("active");
});

$('#progress').on("change", function() {
  return player.seekTo(this.value);
});

$(window).on('resize', function() {
  return resize();
});

$(document).ready(function() {
  initData();
  return resize();
});
