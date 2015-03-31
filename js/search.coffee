song_data  = null
current_song = null
player     = null
url_params = [
  "enablejsapi=1"
  "origin=http://localhost:8002"
  "controls=0"
  "showinfo=0"
  "modestbranding=0"
  "autoplay=1"
  "cc_load_policy=0"
  "disablekb=1"
  "iv_load_policy=3"
  "origin=http://localhost:8002"
  "playsinline=1"
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
      autoplay: 1
      cc_load_policy: 0
      disablekb: 1
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
  for song in song_data
    $("#topList ol").append("
      <li class='topSong' data-song=#{song.rank}>
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
    duration = player.getDuration()
    $("#progress").attr "max", duration

    progressTimer = setInterval( ->
      currentTime = player.getCurrentTime()
      timeDiff = (currentTime / duration) *100
      $("#progress").val(currentTime)
    , 1000)

  if event.data is YT.PlayerState.ENDED
    clearTimeout(progressTimer)
    newSong()

  if event.data is YT.PlayerState.PAUSED
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
  player.loadVideoById(song.youtubeId)
  current_song = song
  $("#songInfo").text("
    #{current_song.artist} - #{current_song.title}
  ")

randSong = ->
  song_data[Math.floor(Math.random()*song_data.length)]

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



$("#next").on "click", ->
  newSong()

$("#topListBtn").on "click", ->
  $("#screen").toggleClass("active")
  $("#topListBtn").toggleClass("active")
  $("#topList").toggleClass("active")
  $("#info").removeClass("active")
  $("#songInfo").removeClass("active")

$('#topList').on "click", ".topSong", ->
  id = @getAttribute("data-song")
  newSong(song_data[id-1])
  $("#screen").toggleClass("active")
  $("#topListBtn").toggleClass("active")
  $("#topList").toggleClass("active")

$('#progress').on "input", ->
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
  $("#screen").removeClass("active")
  $("#info").toggleClass("active")
  $("#songInfo").toggleClass("active")

$('#progress').on "change", ->
  player.seekTo(@value)

$(window).on('resize', ->
  resize()
)



$(document).ready ->
  initData()
  resize()
