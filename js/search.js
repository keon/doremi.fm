var HttpClient, firstScriptTag, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, plr, randSong, songDataReady, song_data, stopVideo, tag, url_params, ytQuerySearch;

song_data = null;

plr = null;

url_params = ["enablejsapi=1", "controls=0", "autoplay=1", "cc_load_policy=0", "disablekb=1", "iv_load_policy=3", "modestbranding=1", "showinfo=0", "autohide=1", "origin=http://localhost:8001", "playsinline=1", "fs=0", "rel=0"].join("&");

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
      var ajaxCallsRemaining, song, _i, _len, _results;
      song_data = JSON.parse(result);
      ajaxCallsRemaining = song_data.length - 1;
      _results = [];
      for (_i = 0, _len = song_data.length; _i < _len; _i++) {
        song = song_data[_i];
        _results.push(ytQuerySearch(song, function(song) {
          --ajaxCallsRemaining;
          if (ajaxCallsRemaining <= 0) {
            return songDataReady();
          }
        }));
      }
      return _results;
    });
  } else {
    console.log("data exists");
    songDataReday();
  }
};

songDataReady = function() {
  localStorage.setItem("song_data", JSON.stringify(song_data));
  return player.src = "http://www.youtube.com/embed/" + (randSong().ytId) + "?" + url_params;
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
    player.src = "http://www.youtube.com/embed/" + (randSong().ytId) + "?" + url_params;
    player.playVideo();
  }
  if (event.data === YT.PlayerState.PAUSED) {
    clearTimeout(progressTimer);
  }
};

stopVideo = function() {
  player.stopVideo();
};

ytQuerySearch = function(song, callback) {
  gapi.client.setApiKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg');
  gapi.client.load('youtube', 'v3', function() {
    var date, requestIds;
    date = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ");
    requestIds = gapi.client.youtube.search.list({
      type: "video",
      q: "" + song.query + " m/v",
      part: 'id',
      maxResults: 50,
      order: "relevance",
      publishedAfter: date,
      videoEmbeddable: "true"
    });
    requestIds.execute(function(response) {
      var video_id;
      if (response.result.items.length > 0) {
        video_id = response.result.items[0].id.videoId;
        if (video_id != null) {
          song.ytId = video_id;
        }
        callback(song);
      }
    });
  });
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
  return player.src = "http://www.youtube.com/embed/" + (randSong().ytId) + "?" + url_params;
});

$('#progress').on("input", function() {
  return plr.seekTo(this.value);
});

$('#progress').on("change", function() {
  return plr.seekTo(this.value);
});
