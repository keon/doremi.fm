var HttpClient, ReplaceNumberWithCommas, addToHistory, current_song, dont_play, isPlaying, newSong, onPlayerReady, onPlayerStateChange, onYouTubeIframeAPIReady, pauseVideo, player, randSong, resize, songDataReady, song_data, song_history, startVideo, stopVideo, url_params,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

song_data = null;

dont_play = JSON.parse(localStorage.getItem("dontPlay")) || [];

current_song = null;

player = null;

isPlaying = false;

song_history = [];

url_params = ["enablejsapi=1", "controls=0", "showinfo=0", "modestbranding=0", "autoplay=1", "cc_load_policy=0", "iv_load_policy=3", "origin=http://doremi.fm", "playsinline=1", "disablekb=1", "fs=0", "rel=0", "wmode=transparent"].join("&");

ReplaceNumberWithCommas = function(yourNumber) {
  var components;
  components = yourNumber.toString().split(".");
  components[0] = components[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return components.join(".");
};

onYouTubeIframeAPIReady = function() {
  var client;
  client = new HttpClient();
  client.get("http://doremi.fm/today", function(result) {
    var ratio, song, width;
    song_data = JSON.parse(result);
    // console.log("song_data:" + song_data);
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
        origin: "http://doremi.fm/",
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
  var counter = 1;
  for (_i = 0, _len = song_data.length; _i < _len; _i++) {
    song = song_data[_i];
    if (_ref = song.query, __indexOf.call(dont_play, _ref) < 0) {
      // $("#topList ol").append("<li class='topSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
      $("#archive").append("<div id=\"song-pick\" data-song=\""+song.rank+"\" class=\"box small back"+counter+"\"><span>"+song.title+"</span></div>");
      if(counter < 11){
        counter++;
      }else{
        counter = 1;
      }
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
    // console.log("SONG:  "+song);
    //$("#badList ol").append("<li class='badSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
  }
};

onPlayerReady = function(event) {
  player.setVolume(0);
  event.target.playVideo();
  $("#about").append("<div><span>"+current_song.title+"</span><br/>"+current_song.artist+"<br/><br/><br/><br/>doremi</div>");
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
  // console.log(song);
  if (song == null) {
    song = randSong();
  }
  // console.log(song);
  if (song === current_song) {
    newSong();
  }
  player.loadVideoById(song.youtubeId);
  current_song = song;
  // $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
  //
  $("#about").html("<div><span>"+current_song.title+"</span><br/>"+current_song.artist+"<br/><br/><br/><br/>doremi</div>");
  // $("#about").text("" + current_song.artist + " - " + current_song.title);
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
  
  songs = song_data;
  // song_data.filter(function(x) {
  //   var _ref;
  //   return _ref = x.query, __indexOf.call(dont_play, _ref) < 0;
  // }).filter(function(y) {
  //   var _ref;
  //   return _ref = y.query, __indexOf.call(song_history, _ref) < 0;
  // });
  // console.log("SONGS after: ",songs);
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

$("#mc-embedded-subscribe").on("click", function(){
  $("#mc_embed_signup").addClass("hide");
  $("#appstore").addClass("hide");
  $("#socialmedia").removeClass("hide");

  // $("socialmedia").addClass("show");
})

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

var topListBtnClick = false;
$("#topListBtn").on("click", function() {
  $("#screen").toggle();
  $("#topListBtn").toggleClass("active");
  $("#topList").toggleClass("active");
  $("#badList").toggleClass("active");
  $("#info").removeClass("active");
  $("#songInfo").removeClass("active");
  // $("#volumeBar").removeClass("active");
  // $("#volume").removeClass("active");
  $('#playerControls').addClass("show");

        $("#menu li").removeClass("show");
        $(".pages").addClass("hide");

        setTimeout(function(){


          $(".pages").removeClass("hide");
          $(".page").removeClass("show");
          $(".page").addClass("hide");

          if(topListBtnClick){
              console.log("latest");
              $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
              $("#menu li").eq(0).addClass("show");
              $("#latest").removeClass("hide");
              $("#latest").addClass("show");
              topListBtnClick = false;
              infoClick = false;
          }else{
              console.log("archive");
              $("#menu").css("transform","translate3d("+getItemX(2)+"px,0,0)");
              $("#menu li").eq(2).addClass("show");
              $("#archive").removeClass("hide");
              $("#archive").addClass("show");
              topListBtnClick = true;
              infoClick = false;
          }
        },1000);



  return $('#playerControls').addClass("squareTop");
});

$('#song-pick').on("click", function() {
  console.log("PICKED");
  var id;
  id = this.getAttribute("data-song");
  newSong(song_data[id - 1]);
  $("#screen").hide();
  $("#topListBtn").toggleClass("active");
  $("#topList").toggleClass("active");
  $("#badList").toggleClass("active");
  return $('#playerControls').addClass("show");
});

$('#controlsContainer').hover((function() {
  $('#playerControls').addClass("show");
}), function() {
  if ($("#topListBtn").hasClass("active") === false) {
    // $('#playerControls').removeClass("show");
    $("#info").removeClass("active");
    $("#songInfo").removeClass("active");
    // $("#volumeBar").removeClass("active");
    // $("#volume").removeClass("active");
    // $('#playerControls').removeClass("squareTop");
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

var infoClick = false;
$('#info').on("click", function() {
  $("#topListBtn").removeClass("active");
  $("#topList").removeClass("active");
  $("#badList").removeClass("active");
  $("#screen").hide();
  // $("#volumeBar").removeClass("active");
  // $("#volume").removeClass("active");
  $("#info").toggleClass("active");
  // $("#songInfo").toggleClass("active");
        $("#menu li").removeClass("show");
        // $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
        // $(".reload i").removeClass("anim");

        $(".pages").addClass("hide");
        setTimeout(function(){


          $(".pages").removeClass("hide");
          $(".page").removeClass("show");
          $(".page").addClass("hide");

          if(infoClick){
              console.log("latest");
              $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
              $("#menu li").eq(0).addClass("show");
              $("#latest").removeClass("hide");
              $("#latest").addClass("show");
              infoClick = false;
              topListBtnClick = false;
          }else{
              console.log("about");
              $("#menu").css("transform","translate3d("+getItemX(3)+"px,0,0)");
              $("#menu li").eq(3).addClass("show");
              $("#about").removeClass("hide");
              $("#about").addClass("show");
              infoClick = true;
              topListBtnClick = false;
          }
        },1000);


return $("#playerControls").addClass("squareTop");
  // if ($("#volume").hasClass("active") === true || $("#info").hasClass("active") === true) {
    
  // } else {
  //   return $("#playerControls").removeClass("squareTop");
  // }
});
// setTimeout(function(){
//   player.setVolume(0);
// },1000)

var volumeClick = false;
$('#volume').on("click", function() {
  // $("#topListBtn").removeClass("active");
  $("#topList").removeClass("active");
  $("#badList").removeClass("active");
  $("#screen").hide();
  // $("#info").removeClass("active");
  // $("#songInfo").removeClass("active");
  
  // $("#volumeBar").toggleClass("active");
  $("#playerControls").toggleClass("squareTop");
  // player.setVolume(100);
  if(volumeClick){
    volumeClick = false;
    $("#volume").removeClass("active");
    $("#volumeIcon").removeClass("fa-volume-up")
    $("#volumeIcon").addClass("fa-volume-off")
    return player.setVolume(0);
  }else{
    volumeClick = true;
    $("#volume").addClass("active");
    $("#volumeIcon").removeClass("fa-volume-off")
    $("#volumeIcon").addClass("fa-volume-up")
    return player.setVolume(100);  
  }
  
  // if ($("#volume").hasClass("active") === true || $("#info").hasClass("active") === true) {
  //   return $("#playerControls").addClass("squareTop");
  // } else {
  //   return $("#playerControls").removeClass("squareTop");
  // }
});

$('#volumeBar').on("change input", function() {
  console.log(this.value);
  return player.setVolume(this.value);
});

$(window).on('resize', function() {
  return resize();
});
$("#playerControls").addClass("show");
// $(window).on('focus load', function() {
//   var timeout;
//   $("#playerControls").addClass("show");
//   return timeout = setTimeout((function() {
//     if ($('#controlsContainer').is(":hover") !== true) {
//       return $("#playerControls").removeClass("show");
//     }
//   }), 5000);
// });

$(document).ready(function() {
  resize();
  $.getJSON("http://graph.facebook.com/?id=http://doremi.fm", function(fbdata) {
    $("#facebook-count").text(ReplaceNumberWithCommas(fbdata.shares));
  });
  $.getJSON("http://cdn.api.twitter.com/1/urls/count.json?url=http://doremi.fm&callback=?", function(twitdata) {
    $("#twitter-count").text(ReplaceNumberWithCommas(twitdata.count));
  });
  if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
    return $("#iosWarning").addClass("show");
  }
});


/*****************************************************************************/

//sorry for the mess
var current_index = 0, 
    index, 
    menu, 
    menu_items_count, 
    mouse_down, 
    mouse_start_y, 
    pull_step, 
    total_pull = 80, 
    release = 40,
    pull_release = total_pull + release;

$(document).on('selectstart', false);

$(document).ready(function(){
  $("#menu li").each(function(i,e){
    $(this).attr("data-index",i) 
  });
  
  //
  menu = $("#menu").html();
  menu_items_count = $("#menu li").length;
  pull_step = total_pull/(menu_items_count-1);
  //
  

  $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
  $("#menu li").removeClass("show");
  $("#menu li").eq(0).addClass("show");
});

$("#header").mousedown(function(e){
  
  //
  mouse_down = true;
  mouse_start_y = e.pageY;
  //
  
  if(index == menu_items_count-1) {
    index = 0;
  } else {
    var $item = $("#menu li").eq(index);
    $("#menu").html(menu);
    $("#menu li").eq($item.attr("data-index")).remove();
    $item.prependTo($("#menu"));
    $("#menu li").eq(0).addClass("show");
    $("#menu").addClass("notrans");
    $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
    }
});

$(document).mouseup(function(e){
  if(mouse_down) {
  //
  mouse_down = false;
  $("#header").animate({height: 46},300);
  $("#menu").removeClass("show");
  $(".pullmenu-icon").removeClass("hide");
  //
  
  
  
  if(index>0) {

    if(index==menu_items_count-1) {
      
        $(".reload i").addClass("anim");
      
        setTimeout(function(){
        $("#menu li").removeClass("show");
        $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
        $(".reload i").removeClass("anim");
        newSong();
        
        setTimeout(function(){
          
          $("#menu li").eq(0).addClass("show");
        },500);
      },1000);
    
      } else {

        current_index = index;

        $(".pages").addClass("hide");

        setTimeout(function(){


          $(".pages").removeClass("hide");
          $(".page").removeClass("show");
          $(".page").addClass("hide");

          switch($("#menu li").eq(index).attr("data-index")) {
            case '0': 
              console.log("latest");
              $("#latest").removeClass("hide");
              $("#latest").addClass("show"); 
              break;
            case '1': 
              console.log("best");
              $("#best").removeClass("hide");
              $("#best").addClass("show"); 
              break;
            case '2': 
              console.log("archive");
              $("#archive").removeClass("hide");
              $("#archive").addClass("show"); 
              break;
            case '3': 
              console.log("about");
              $("#about").removeClass("hide");
              $("#about").addClass("show"); 
              break;
            }
        },1000);
    }
  }
  }
});

$(document).mousemove(function(e){
  
  $("#menu").removeClass("notrans");
  
  if(mouse_down) {
    
    var diff = Math.max(0, e.pageY - mouse_start_y);
    if(diff>pull_release) diff = pull_release + (diff-pull_release)/(diff*0.01);
  
    $("#header").height(46+diff);

    index = Math.max(0,Math.min(menu_items_count-2, Math.floor((diff-release)/pull_step)));
    if(diff>pull_release+pull_step*2) index = menu_items_count-1;
    
    if(diff>release) {
      $("#menu").addClass("show");
      $(".pullmenu-icon").addClass("hide");
    } else {
        $("#menu").removeClass("show");
      $(".pullmenu-icon").removeClass("hide");
    }
    
    $("#menu").css("transform","translate3d("+getItemX(index)+"px,0,0)");
    $("#menu li").removeClass("show");
    $("#menu li").eq(index).addClass("show");
    
    $(".loader-icon").css("transform", "rotate("+(diff*20)+"deg)");
  }
});

var getItemX = function(index){
  var $item = $("#menu li").eq(index);
  var item_offset = $item.offset().left;
  var item_width = $item.outerWidth();
  var menu_offset = $("#menu").offset().left;
  var screen_width = $("#mobile-screen").width();
  return (menu_offset-item_offset)+(screen_width-item_width)/2;
};
