http        = require "http"
request     = require "request"
cheerio     = require "cheerio"
fs          = require "fs"
CronJob     = require('cron').CronJob
YouTube     = require('youtube-node')
moment      = require('moment')
async       = require('async')

youTube     = new YouTube()
songs       = []
out_file    = "../songs.json"
pages       = "http://mwave.interest.me/kpop/chart.m"
date        = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ")


youTube.setKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg')
youTube.addParam("type", "video")
youTube.addParam("part", "id")
youTube.addParam("order", "relevance")
youTube.addParam("publishedAfter", date)
youTube.addParam("videoDefinition", "high")
youTube.addParam("videoEmbeddable", "true")


get_data = (url, callback) ->

    request(url, (error, response, html) ->
      if not error and response.statusCode is 200
        $ = cheerio.load(html)

        parsedResults = []

        $("div.list_song tr").each (i, element) ->
          artist = $(this).find(".tit_artist a:first-child").text().replace("(","").replace(")","").replace("'","")
          title = $(this).find(".tit_song a").text().replace("(","").replace(")","").replace("'","")
          rank = $(this).find(".nb em").text()
          query = artist + " " + title
          if artist? and artist isnt ""
            mwave = artist: artist, title: title, query: query.toLowerCase(), rank: rank
            # Push meta-data into parsedResults array
            parsedResults.push mwave

        callback(parsedResults)
    )

update_data = ->
  get_data pages, (data) ->
    songs = data

    async.each songs, ((song, callback) ->
      youTube.search(song.query, 50, (error, result) ->

        if error
          console.log error
          callback()

        else if result.pageInfo.totalResults < 20
          console.log "not enough songs for #{song.query}"
          callback()

        else if not result.items[0]
          console.log "no matches for #{song.query}"
          callback()

        else if not result.items[0].id?
          console.log "no id for #{song.query}"
          callback()

        else
          song.youtubeId = result.items[0].id.videoId
          # check song for viewCount, likes, etc.
          callback()
      )
      return
      console.log "done"
    ), (err) ->
      if err
        console.log 'A song failed to process'

      else
        console.log 'All songs have been processed successfully'

      songDataReady()

      return



songDataReady = ->
  songs = (song for song in songs when song.youtubeId?)
  console.log JSON.stringify songs
  ###
  youTube.getById songs[0].youtubeId, (error, result) ->
    if error
      console.log error
    else
      console.log JSON.stringify(result, null, 2)
    return
  ###

  ###
  fs.writeFile out_file, JSON.stringify(songs), (err) ->
    throw err if err
    console.log "JSON saved to #{out_file}"
    return
  ###

  ###
  request.post
    url: "http://jombly.com:3000/update"
    body: JSON.stringify data
    headers: {"Content-Type": "application/json;charset=UTF-8"}
  , (error, response, body) ->
    console.log error
    console.log response.statusCode
    return
  ###

update_data()
