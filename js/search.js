var HttpClient, firstScriptTag, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, plr, randSong, songDataReady, song_data, stopVideo, tag, url_params;

song_data = null;

plr = null;

url_params = ["enablejsapi=1", "controls=0", "autoplay=1", "cc_load_policy=0", "disablekb=1", "iv_load_policy=3", "autohide=1", "origin=http://localhost:8002", "playsinline=1", "fs=0", "rel=0"].join("&");

tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';

firstScriptTag = document.getElementsByTagName('script')[0];

firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

onYouTubeIframeAPIReady = function() {
  var client, player;
  player = new YT.Player('player', {
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  plr = player;
  if (song_data === null) {
    console.log("data null");
    client = new HttpClient();
    client.get("http://jombly.com:3000/today", function(result) {
      var ajaxCallsRemaining;
      song_data = JSON.parse(result);
      ajaxCallsRemaining = song_data.length - 1;
      return songDataReady();
    });
  } else {
    console.log("data exists");
    songDataReday();
  }
};

songDataReady = function() {
  console.log(song_data);
  return player.src = "http://www.youtube.com/embed/" + (randSong().youtubeId) + "?" + url_params;
};

onPlayerReady = function(event) {};

onPlayerStateChange = function(event) {
  var duration, player, progressTimer;
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
    player.src = "http://www.youtube.com/embed/" + (randSong().youtubeId) + "?" + url_params;
    player.playVideo();
  }
  if (event.data === YT.PlayerState.PAUSED) {
    clearTimeout(progressTimer);
  }
};

stopVideo = function() {
  player.stopVideo();
};

randSong = function() {
  return song_data[Math.floor(Math.random() * song_data.length)];
};

HttpClient = function() {
  this.get = function(aUrl, aCallback) {
    var anHttpRequest;
    anHttpRequest = new XMLHttpRequest;
    anHttpRequest.onreadystatechange = function() {
      if (anHttpRequest.readyState === 4 && anHttpRequest.status === 200) {
        aCallback(anHttpRequest.responseText);
      }
    };
    anHttpRequest.open('GET', aUrl, true);
    anHttpRequest.send(null);
  };
};

$("#next").on("click", function() {
  var song;
  song = randSong();
  console.log(song.query);
  return player.src = "http://www.youtube.com/embed/" + song.youtubeId + "?" + url_params;
});

$('#progress').on("input", function() {
  return plr.seekTo(this.value);
});

$('#progress').on("change", function() {
  return plr.seekTo(this.value);
});
