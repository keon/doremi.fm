var HttpClient, initData, newSong, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, player, randSong, resize, songDataReady, song_data, startVideo, stopVideo, url_params;

song_data = null;

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
  var ratio, width;
  width = $(window).width();
  ratio = 16 / 9;
  player = new YT.Player('player', {
    width: $(window).width(),
    height: Math.ceil(width / ratio),
    videoId: randSong().youtubeId,
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

songDataReady = function() {};

onPlayerReady = function(event) {};

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

newSong = function() {
  var song;
  song = randSong();
  return player.loadVideoById(song.youtubeId);
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

$('#progress').on("input", function() {
  player.seekTo(this.value);
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
