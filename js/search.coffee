song_data  = null
dont_play = JSON.parse(localStorage.getItem("dontPlay")) or []
current_song = null
player     = null
isPlaying = false
song_history = []
url_params = [
  "enablejsapi=1"
  "origin=http://localhost:8002"
  "controls=0"
  "showinfo=0"
  "modestbranding=0"
  "autoplay=1"
  "cc_load_policy=0"
  "iv_load_policy=3"
  "origin=http://localhost:8002"
  "playsinline=1"
  "disablekb=1"
  "fs=0"
  "rel=0"
  "wmode=transparent"
].join("&")


initData = ->
  client = new HttpClient()
  client.get("http://jombly.com:3000/today", (result) ->
    song_data = JSON.parse result
    songDataReady()
  )

onYouTubeIframeAPIReady = ->
  width = $(window).width()
  ratio = 16/9
  song = randSong()
  current_song = song
  player = new (YT.Player)('player',
    width: $(window).width()
    height: Math.ceil(width / ratio)
    videoId: song.youtubeId
    playerVars:
      controls: 0
      showinfo: 0
      modestbranding: 1
      disablekb: 1
      autoplay: 1
      cc_load_policy: 0
      iv_load_policy: 3
      origin: "http://localhost:8002"
      playsinline: 1
      fs: 0
      rel: 0
      wmode: "transparent"
    events:
      'onReady': onPlayerReady
      'onStateChange': onPlayerStateChange
  )
  return


resize = ->
  width = $(window).width()
  height = $(window).height()
  plr = $("#player")
  ratio = 16/9

  if (width / ratio < height)
    pWidth = Math.ceil(height * ratio)
    plr.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0})

  else
    pHeight = Math.ceil(width / ratio)
    plr.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2})


songDataReady = ->
  for song in song_data when song.query not in dont_play
    $("#topList ol").append("
      <li class='topSong' data-song=#{song.rank}>
      <strong>#{song.artist}</strong> / <em>#{song.title}</em>
      </li>
    ")

  for query in dont_play
    song = (song for song in song_data when song.query is query)[0]
    $("#badList ol").append("
      <li class='badSong' data-song=#{song.rank}>
      <strong>#{song.artist}</strong> / <em>#{song.title}</em>
      </li>
    ")
  return

onPlayerReady = (event) ->
  $("#songInfo").text("
    #{current_song.artist} - #{current_song.title}
  ")
  return

onPlayerStateChange = (event) ->
  player = event.target

  if event.data is YT.PlayerState.PLAYING
    isPlaying = true
    duration = player.getDuration()
    $("#progress").attr "max", duration
    $("#play").addClass("hidden")
    $("#pause").removeClass("hidden")

    progressTimer = setInterval( ->
      currentTime = player.getCurrentTime()
      timeDiff = (currentTime / duration) *100
      $("#progress").val(currentTime)
    , 1000)

  if event.data is YT.PlayerState.ENDED
    clearTimeout(progressTimer)
    newSong()

  if event.data is YT.PlayerState.PAUSED
    isPlaying = false
    $("#play").removeClass("hidden")
    $("#pause").addClass("hidden")
    clearTimeout(progressTimer)


  return

stopVideo = ->
  player.stopVideo()
  return

startVideo = ->
  player.playVideo()
  return

pauseVideo = ->
  player.pauseVideo()
  return

newSong = (song) ->
  song = randSong() unless song?
  if song is current_song then newSong()
  player.loadVideoById(song.youtubeId)
  current_song = song
  $("#songInfo").text("
    #{current_song.artist} - #{current_song.title}
  ")
  addToHistory(song)

addToHistory = (song) ->
  len = song_history.length
  max = 19
  song_history.unshift song.query
  if len > max then song_history.splice max+1, len-max
  return

randSong = ->
  songs = song_data.filter( (x) ->
    x.query not in dont_play
  ).filter( (y) ->
    y.query not in song_history
  )
  songs[Math.floor(Math.random()*song_data.length)]

HttpClient = ->
  @get = (url, callback) ->
    req = new XMLHttpRequest

    req.onreadystatechange = ->
      if req.readyState == 4 and req.status == 200
        callback req.responseText
      return

    req.open 'GET', url, true
    req.send null
    return

  return


$("#dontPlay").on "click", ->
  if current_song.query not in dont_play
    dont_play.push current_song.query
    localStorage.setItem("dontPlay", JSON.stringify(dont_play))
    $("#badList ol").append("
      <li class='badSong' data-song=#{current_song.rank}>
      <strong>#{current_song.artist}</strong> / <em>#{current_song.title}</em>
      </li>
    ")

    $("#topList ol > li:nth-child(#{current_song.rank})").remove()
    newSong()

$('#badList').on "click", ".badSong", ->
  id = @getAttribute("data-song")
  $(this).remove()
  song = song_data[id-1]
  dont_play = (q for q in dont_play when q isnt song.query)
  localStorage.setItem("dontPlay", JSON.stringify(dont_play))
  $("#topList ol > li:nth-child(#{id})").before("
    <li class='topSong' data-song=#{song.rank}>
    <strong>#{song.artist}</strong> / <em>#{song.title}</em>
    </li>
  ")


$("#next").on "click", ->
  newSong()

$("#topListBtn").on "click", ->
  $("#screen").toggle()
  $("#topListBtn").toggleClass("active")
  $("#topList").toggleClass("active")
  $("#badList").toggleClass("active")
  $("#info").removeClass("active")
  $("#songInfo").removeClass("active")
  $("#volumeBar").removeClass("active")
  $("#volume").removeClass("active")
  $('#playerControls').addClass("show")
  $('#playerControls').removeClass("squareTop")


$('#topList').on "click", ".topSong", ->
  id = @getAttribute("data-song")
  newSong(song_data[id-1])
  $("#screen").hide()
  $("#topListBtn").toggleClass("active")
  $("#topList").toggleClass("active")
  $("#badList").toggleClass("active")
  $('#playerControls').removeClass("show")

$('#controlsContainer').hover (->
  $('#playerControls').addClass("show")
  return
), ->
  if $("#topListBtn").hasClass("active") is false
    $('#playerControls').removeClass("show")
    $("#info").removeClass("active")
    $("#songInfo").removeClass("active")
    $("#volumeBar").removeClass("active")
    $("#volume").removeClass("active")
    $('#playerControls').removeClass("squareTop")
  return


$('#progress').on "input", ->
  player.seekTo(@value)

$('#progress').on "change", ->
  player.seekTo(@value)

$('#play').on "click", ->
  $("#play").toggleClass("hidden")
  $("#pause").toggleClass("hidden")
  startVideo()

$('#pause').on "click", ->
  $("#play").toggleClass("hidden")
  $("#pause").toggleClass("hidden")
  pauseVideo()

$('#info').on "click", ->
  $("#topListBtn").removeClass("active")
  $("#topList").removeClass("active")
  $("#badList").removeClass("active")
  $("#screen").hide()
  $("#volumeBar").removeClass("active")
  $("#volume").removeClass("active")
  $("#info").toggleClass("active")
  $("#songInfo").toggleClass("active")

  if $("#volume").hasClass("active") is true or $("#info").hasClass("active") is true
    $("#playerControls").addClass("squareTop")
  else
    $("#playerControls").removeClass("squareTop")

$('#volume').on "click", ->
  $("#topListBtn").removeClass("active")
  $("#topList").removeClass("active")
  $("#badList").removeClass("active")
  $("#screen").hide()
  $("#info").removeClass("active")
  $("#songInfo").removeClass("active")
  $("#volume").toggleClass("active")
  $("#volumeBar").toggleClass("active")
  $("#playerControls").toggleClass("squareTop")

  if $("#volume").hasClass("active") is true or $("#info").hasClass("active") is true
    $("#playerControls").addClass("squareTop")
  else
    $("#playerControls").removeClass("squareTop")


$('#volumeBar').on "change input", ->
  player.setVolume(@value)


$(window).on('resize', ->
  resize()
)

$(window).on 'focus load', ->
  $("#playerControls").addClass("show")
  timeout = setTimeout( (->
      $("#playerControls").removeClass("show") unless $('#controlsContainer').is(":hover") is true
  ), 5000)

$(document).on "keyup", (e) ->
  console.log e
  if e.keyCode == 32 # space
    if isPlaying is true
      pauseVideo()
    else startVideo()

  if e.keyCode == 39 # right arrow
    newSong()
  return

$(document).ready ->
  initData()
  resize()
