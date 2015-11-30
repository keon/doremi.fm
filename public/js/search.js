var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

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

if(isMobile)
{
   console.log('You are using a mobile device!');
}
else
{
   console.log('You are not using a mobile device!');
}

onYouTubeIframeAPIReady = function() {
  var client;
  client = new HttpClient();
  client.get("http://doremi.fm/today", function(result) {
    var ratio, song, width;
    song_data = JSON.parse(result);
    // console.log("song_data:" + song_data);
    
    width = $(window).width();
    ratio = 16 / 9;
    song = randSong();
    current_song = song;
    songDataReady();
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
  $("#archive #song-list").html("");
  for (_i = 0, _len = song_data.length; _i < _len; _i++) {
    song = song_data[_i];
    if (_ref = song.query, __indexOf.call(dont_play, _ref) < 0) {
      if(song.title == current_song.title){
        $("#archive #song-list").append("<div id=\"song-pick\" data-song=\""+song.rank+"\" class=\"box small active\"><span>"+song.title+"</span><span> - "+song.artist+"</span></div>");
        // $("#song-list #song-pick span").text()
      } else {
        $("#archive #song-list").append("<div id=\"song-pick\" data-song=\""+song.rank+"\" class=\"box small\"><span>"+song.title+"</span><span> - "+song.artist+"</span></div>");

      }
      // $("#topList ol").append("<li class='topSong' data-song=" + song.rank + "> <strong>" + song.artist + "</strong> / <em>" + song.title + "</em> </li>");
      
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
  $("#songInfo").text("Now Playing: " + current_song.artist + " - " + current_song.title);
  // $("#about").html("<div><span>"+current_song.title+"</span><br/>"+current_song.artist+"<br/><br/><br/><br/>doremi</div>");
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

isStop = false;
$("#stopstart").on("click",function(){
  console.log("ok");
  if(isStop){
    startVideo();
    isStop = false;
  }else{
    pauseVideo();
    isStop = true;
  }
});

stopVideo = function() {
  isStop = true;
  player.stopVideo();
};

startVideo = function() {
  isStop = false;
  player.playVideo();
};

pauseVideo = function() {
  isStop = true;
  player.pauseVideo();
};

newSong = function(song) {
  // var a = $("#song-list #song-pick").text();

  // 
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
  $("#song-list #song-pick span:first-child").each(function(i, obj) {
    if(current_song.title && $(this).text() === current_song.title){
      $(this).parent().addClass("active"); 
    }else{
      $(this).parent().removeClass("active");
    }
  });
  $("#songInfo").text("" + current_song.artist + " - " + current_song.title);
  //
  // $("#about").html("<div><span>"+current_song.title+"</span><br/>"+current_song.artist+"<br/><br/><br/><br/>doremi</div>");
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

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}


$("#inputGroup input").keypress(function (e) {

    if (e.which == 13) {
    var email = $('#inputGroup input').val();
    if(validateEmail(email)){
    $.ajax({
      method: "POST",
      url: "/subscribe",
      data: { email:email}
    })
      .done(function( msg ) {
        console.log( msg.message );
      });

    $("#inputGroup").addClass("hide");
    $("#appstore").addClass("hide");
    $("#invalid").addClass("hide");
    $("#socialmedia").removeClass("hide");
    $("#thankyou").removeClass("hide");

    }else{
      console.log("invalid")
      $("#invalid").removeClass("hide");
    }
    }
});

$("#emailButton").on("click", function(){
    window.localStorage.setItem("subscribed", "true");
    var email = $('#inputGroup input').val();
    if(validateEmail(email)){
    $.ajax({
      method: "POST",
      url: "/subscribe",
      data: { email:email}
    })
      .done(function( msg ) {
        console.log( msg.message );
      });

    $("#inputGroup").addClass("hide");
    $("#appstore").addClass("hide");
    $("#invalid").addClass("hide");
    $("#socialmedia").removeClass("hide");
    $("#thankyou").removeClass("hide");

    }else{
      console.log("invalid")
      $("#invalid").removeClass("hide");
    }
    
});

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
  $("#topListBtnRed").toggleClass("hide");
  $("#topListBtnWhite").toggleClass("hide");
  // $("#info").removeClass("active");
  // $("#songInfo").removeClass("active");
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
              $("#menu").css("transform","translate3d("+getItemX(1)+"px,0,0)");
              $("#menu li").eq(1).addClass("show");
              $("#archive").removeClass("hide");
              $("#archive").addClass("show");
              topListBtnClick = true;
              infoClick = false;
          }
        },1000);



  return $('#playerControls').addClass("squareTop");
});

$('#archive').on("click",'#song-pick', function() {
  console.log("PICKED");
  var id;
  id = this.getAttribute("data-song");
  newSong(song_data[id - 1]);
  // $("#screen").hide();
  // $("#topListBtn").toggleClass("active");
  // $("#topList").toggleClass("active");
  // $("#badList").toggleClass("active");
  return $('#playerControls').addClass("show");
});



// $('#controlsContainer').hover((function() {
//   $('#playerControls').addClass("show");
// }), function() {
//   if ($("#topListBtn").hasClass("active") === false) {
//     // $('#playerControls').removeClass("show");
//     // $("#info").removeClass("active");
//     // $("#songInfo").removeClass("active");
//     // $("#volumeBar").removeClass("active");
//     // $("#volume").removeClass("active");
//     // $('#playerControls').removeClass("squareTop");
//   }
// });

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

$('#songInfo').addClass("active");

$("#info").toggleClass("active");
var infoClick = false;
$('#info, .pullmenu-icon').on("click", function() {
  // $("#topListBtn").removeClass("active");
  // $("#topList").removeClass("active");
  // $("#badList").removeClass("active");
  $("#infoBtnRed").toggleClass("hide");
  $("#infoBtnWhite").toggleClass("hide");
  $("#screen").hide();
  $("#black-background").toggleClass("hide");
  $("#prelaunchContainer").toggleClass("hide");
  // $("#volumeBar").removeClass("active");
  // $("#volume").removeClass("active");
  $("#info").toggleClass("active");
  // $("#songInfo").toggleClass("active");
        // $("#menu li").removeClass("show");
        // $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
        // $(".reload i").removeClass("anim");

        // $(".pages").addClass("hide");
        // setTimeout(function(){


        //   $(".pages").removeClass("hide");
        //   $(".page").removeClass("show");
        //   $(".page").addClass("hide");

        //   if(infoClick){
        //       console.log("latest");
        //       $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
        //       $("#menu li").eq(0).addClass("show");
        //       $("#latest").removeClass("hide");
        //       $("#latest").addClass("show");
        //       infoClick = false;
        //       topListBtnClick = false;
        //   }else{
        //       console.log("about");
        //       $("#menu").css("transform","translate3d("+getItemX(2)+"px,0,0)");
        //       $("#menu li").eq(2).addClass("show");
        //       $("#about").removeClass("hide");
        //       $("#about").addClass("show");
        //       infoClick = true;
        //       topListBtnClick = false;
        //   }
        // },1000);


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
    $("#volumeBtnNotMute").addClass("hide");
    $("#volumeBtnMute").removeClass("hide");
    $("#volume").removeClass("active");
    $("#volumeIcon").removeClass("fa-volume-up")
    $("#volumeIcon").addClass("fa-volume-off")
    return player.setVolume(0);
  }else{
    volumeClick = true;
    $("#phone-black-screen").addClass("hide");
    $("#volumeBtnNotMute").removeClass("hide");
    $("#volumeBtnMute").addClass("hide");
    $("#volume").addClass("active");
    $("#volumeIcon").removeClass("fa-volume-off")
    $("#volumeIcon").addClass("fa-volume-up")    
    if(pbsclick || pbswait){
      return player.setVolume(100);        
    }else{
      pbsclick = true;
      setTimeout(function(){
        console.log("volume up!");
        return player.setVolume(100); 
      }, 4000)
    }
  }
  // if ($("#volume").hasClass("active") === true || $("#info").hasClass("active") === true) {
  //   return $("#playerControls").addClass("squareTop");
  // } else {
  //   return $("#playerControls").removeClass("squareTop");
  // }
});

var pbswait = false;
setTimeout(function(){
  pbswait = true;
}, 4000);

var pbsclick = false;
$("#phone-black-screen").on("click", function(){
  if(!pbsclick){

    $("#phone-black-screen").addClass("hide");
    volumeClick = true;
    $("#volume").addClass("active");
    $("#volumeIcon").removeClass("fa-volume-off")
    $("#volumeIcon").addClass("fa-volume-up")
    $("#volumeBtnNotMute").removeClass("hide");
    $("#volumeBtnMute").addClass("hide");
    if(pbswait){
        return player.setVolume(100); 
    }else{
      setTimeout(function(){
        console.log("volume up!");
        return player.setVolume(100); 
      }, 4000)
    }
  }
});

$("#phone-black-screen").on("mouseover", function(){
  $("#phone-black-screen img").attr("src", "./img/Play-red.png");
}).on("mouseout", function(){
  $("#phone-black-screen img").attr("src", "./img/Play.png");
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
$(".boxbox").children().children("div").addClass("hide");

$(".boxbox").on("mouseover", function() {
  // console.log("on");
  $(this).children().children("div").removeClass("hide");
  $(this).children().children("div").addClass("slide-overlay");
})
$(".boxbox").on("mouseout", function() {
  // console.log("off");
  $(this).children().children("div").addClass("hide");
  $(this).children().children("div").removeClass("slide-overlay");
})



$(document).ready(function() {
  resize();
  $('#checkbox').change(function(){
    setInterval(function () {
        moveRight();
    }, 3000);
  });
  
  var slideCount = $('#slider ul li').length;
  var slideWidth = $('#slider ul li').width();
  var slideHeight = $('#slider ul li').height();
  var sliderUlWidth = slideCount * slideWidth;
  
  // $('#slider').css({ width: slideWidth, height: slideHeight });
  
  // $('#slider ul').css({ width: sliderUlWidth, marginLeft: - slideWidth });
  
  //   $('#slider ul li:last-child').prependTo('#slider ul');

    function moveLeft() {
        $('#slider ul').animate({
            left: + slideWidth
        }, 200, function () {
            $('#slider ul li:last-child').prependTo('#slider ul');
            $('#slider ul').css('left', '');
            var currentCategory = $('#slider ul li:first-child').attr("data-category");
            console.log(currentCategory);
            changeCategory(currentCategory);

        });
    };

    function moveRight() {
        $('#slider ul').animate({
            left: - slideWidth
        }, 200, function () {
            $('#slider ul li:first-child').appendTo('#slider ul');
            $('#slider ul').css('left', '');
            var currentCategory = $('#slider ul li:first-child').attr("data-category");
            console.log(currentCategory);
            changeCategory(currentCategory);
        });
    };

    $('a.control_prev').click(function () {
        moveLeft();
    });

    $('a.control_next').click(function () {
        moveRight();
    });
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


var changeCategory = function(category){
  $("#topListBtn").toggleClass("active");
  $(".pages").removeClass("hide");
  $(".page").removeClass("show");
  $(".page").addClass("hide");
  topListBtnClick = true;
  console.log("archive");
  $("#archive").removeClass("hide");
  $("#archive").addClass("show");
  $("#topListBtnRed").toggleClass("hide");
  $("#topListBtnWhite").toggleClass("hide");
 $("#menu").css("transform","translate3d("+getItemX(1)+"px,0,0)");
  $("#menu li").removeClass("show");
  $("#menu li").eq(1).addClass("show");

  $("li[data-category="+category+"]").prependTo("#slider ul");
            
  $.get("/category/"+category, function(data){

    console.log(data[0].artist);
     song_data = data;
     songDataReady();
     newSong();
  });
}

$("#calm").on("click", function() {
  changeCategory("calm");
});
$("#top50").on("click", function() {
  changeCategory("top50")
});
$("#cafetime").on("click", function() {
  changeCategory("cafetime")
});
$("#chill").on("click", function() {
  changeCategory("chill");
});
$("#classic").on("click", function() {
  changeCategory("classic");
});
$("#focus").on("click", function() {
  changeCategory("focus");
});
$("#ost").on("click", function() {
  console.log("top50 clicked");
  changeCategory("ost");
});
$("#rain").on("click", function() {
  changeCategory("rain");
});
$("#sunshine").on("click", function() {
  changeCategory("sunshine");
});
$("#workout").on("click", function() {
  changeCategory("sunshine");
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

// $("#header").mousedown(function(e){
  
//   //
//   mouse_down = true;
//   mouse_start_y = e.pageY;
//   //
  
//   if(index == menu_items_count-1) {
//     index = 0;
//   } 
  // else {
  //   var $item = $("#menu li").eq(index);
  //   $("#menu").html(menu);
  //   $("#menu li").eq($item.attr("data-index")).remove();
  //   $item.prependTo($("#menu"));
  //   $("#menu li").eq(0).addClass("show");
  //   $("#menu").addClass("notrans");
  //   $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
  //   }
// });

// $(document).mouseup(function(e){
//   if(mouse_down) {
//   //
//   mouse_down = false;
//   $("#header").animate({height: 46},300);
//   $("#menu").removeClass("show");
//   $(".pullmenu-icon").removeClass("hide");
//   //
  
  
  
//   if(index>0) {

//     if(index==menu_items_count-1) {
      
//         $(".reload i").addClass("anim");
      
//         setTimeout(function(){
//         $("#menu li").removeClass("show");
//         $("#menu").css("transform","translate3d("+getItemX(0)+"px,0,0)");
//         $(".reload i").removeClass("anim");
//         newSong();
        
//         setTimeout(function(){
          
//           $("#menu li").eq(0).addClass("show");
//         },500);
//       },800);
    
//       } else {

//         current_index = index;

//         $(".pages").addClass("hide");

//         setTimeout(function(){


//           $(".pages").removeClass("hide");
//           $(".page").removeClass("show");
//           $(".page").addClass("hide");

//           switch($("#menu li").eq(index).attr("data-index")) {
//             case '0': 
//               console.log("latest");
//               $("#latest").removeClass("hide");
//               $("#latest").addClass("show"); 
//               break;
//             case '1': 
//               console.log("archive");
//               $("#archive").removeClass("hide");
//               $("#archive").addClass("show"); 
//               break;
//             // case '2': 
//             //   console.log("about");
//             //   $("#about").removeClass("hide");
//             //   $("#about").addClass("show"); 
//             //   break;
//             }
//         },800);
//     }
//   }
//   }
// });

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


