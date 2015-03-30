song_data  = null
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

  player = new (YT.Player)('player',
    width: $(window).width()
    height: Math.ceil(width / ratio)
    videoId: randSong().youtubeId
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
  return

onPlayerReady = (event) ->
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

newSong = ->
  song = randSong()
  player.loadVideoById(song.youtubeId)

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

$('#progress').on "input", ->
  player.seekTo(@value)
  return

$('#progress').on "change", ->
  player.seekTo(@value)

$(window).on('resize', ->
  resize()
)

$(document).ready ->
  initData()
  resize()
