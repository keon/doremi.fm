song_data  = null
plr        = null
url_params = [
  "enablejsapi=1"
  "controls=0"
  "autoplay=1"
  "cc_load_policy=0"
  "disablekb=1"
  "iv_load_policy=3"
  #"modestbranding=1"
  #"showinfo=0"
  "autohide=1"
  "origin=http://localhost:8002"
  "playsinline=1"
  "fs=0"
  "rel=0"
].join("&")




# Initialize the YT Player
tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore tag, firstScriptTag


onYouTubeIframeAPIReady = ->
  player = new (YT.Player)('player',
    events:
      'onReady': onPlayerReady
      'onStateChange': onPlayerStateChange
  )
  plr = player

  if song_data is null
    console.log "data null"

    client = new HttpClient()
    client.get("http://jombly.com:3000/today", (result) ->
      song_data = JSON.parse result
      ajaxCallsRemaining = song_data.length-1
      songDataReady()
    )

  else
    console.log "data exists"
    songDataReday()

  return

songDataReady = ->
  #localStorage.setItem("song_data", JSON.stringify song_data)
  console.log song_data
  player.src = "http://www.youtube.com/embed/#{randSong().youtubeId}?#{url_params}"

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
    player.src = "http://www.youtube.com/embed/#{randSong().youtubeId}?#{url_params}"
    player.playVideo()

  if event.data is YT.PlayerState.PAUSED
    clearTimeout(progressTimer)


  return

stopVideo = ->
  player.stopVideo()
  return

randSong = ->
  song_data[Math.floor(Math.random()*song_data.length)]

HttpClient = ->
  @get = (aUrl, aCallback) ->
    anHttpRequest = new XMLHttpRequest

    anHttpRequest.onreadystatechange = ->
      if anHttpRequest.readyState == 4 and anHttpRequest.status == 200
        aCallback anHttpRequest.responseText
      return

    anHttpRequest.open 'GET', aUrl, true
    anHttpRequest.send null
    return

  return



$("#next").on "click", ->
  song = randSong()
  console.log song.query
  player.src = "http://www.youtube.com/embed/#{song.youtubeId}?#{url_params}"

$('#progress').on "input", ->
  plr.seekTo(@value)

$('#progress').on "change", ->
  plr.seekTo(@value)
