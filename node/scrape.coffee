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
blacklist = ["simply k-pop", "tease", "teaser", "phone", "iPhone", "iPad", "Gameplay", "cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr"]
whitelist = ["mnet", "full audio", "kpop", "k pop", "k-pop", "korean", "korea", "kor", "kor pop", "korean pop", "korean-pop", "kor-pop", "korean version", "kr", "kr ver", "official", "mv", "m/v", "music video"]
has_korean = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g


youTube.setKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg')
youTube.addParam("type", "video")
youTube.addParam("part", "id")
youTube.addParam("order", "relevance")
youTube.addParam("publishedAfter", date)
youTube.addParam("videoDefinition", "high")
youTube.addParam("videoEmbeddable", "true")


checkWhitelist = (song, query) ->
  title = song.snippet.title
  description = song.snippet.description
  score = 0
  query_count = 0
  cleaned_title = title.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim()
  cleaned_description = description.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim()
  cleaned_query = query.replace(/[^A-Za-z0-9\s]+/g, "").replace(/\s+/g, ' ').toLowerCase().trim()

  # Give a point if the song title has korean in it
  if has_korean.test(title) is true then score++
  if has_korean.test(description) is true then score++

  # Give a point if the title or description has whitelist words in it
  goodTitle = 0
  goodDescription = 0
  for term in whitelist
    if title.indexOf(term) isnt -1 then goodTitle++
    if description.indexOf(term) isnt -1 then goodDescription++

  if goodTitle > 0 then score++
  if goodDescription > 0 then score++

  # Give a point if all of the query's words are in song title
  title_array = cleaned_title.split " "
  description_array = cleaned_description.split " "
  query_array = cleaned_query.split " "

  titleCount = 0
  descriptionCount = 0

  for word in query_array
    if word in title_array then titleCount++
    if word in description_array then descriptionCount++

  if titleCount = query_array.length or descriptionCount = query_array.length then score += 3

  return score


get_data = (url, callback) ->
    console.log "get_data"
    request(url, (error, response, html) ->
      console.log error, response
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
            parsedResults.push mwave
            console.log mwave

        callback(parsedResults)
    )

update_data = ->
  get_data pages, (data) ->
    songs = data
    console.log data
    async.each songs, ((song, callback) ->
      console.log "in async"
      youTube.search(song.query, 50, (error, r1) ->

        if error
          console.log error
          callback()

        else if r1.pageInfo.totalResults < 10
          console.log "not enough songs for #{song.query}"
          callback()

        else if not r1.items[0]
          console.log "no matches for #{song.query}"
          callback()

        else if not r1.items[0].id?
          console.log "no id for #{song.query}"
          callback()

        else
          # Get the 5 most relevant matches
          ###
          ids = (i.id.videoId for i,key in r1.items).join(",")

          # Get additional stats for those 5 matches
          youTube.getById ids, (error, r2) ->
            if error
              console.log error
              callback()

            else
              # Check for black and white list, push into acceptable array
              acceptable = []
              for j in r2.items
                title = j.snippet.title
                description = j.snippet.description
                bad = 0
                for term in blacklist
                  if title.indexOf(term) isnt -1 then bad++
                  if description.indexOf(term) isnt -1 then bad++

                j.score = checkWhitelist(j,song.query)
                if bad is 0 and j.score > 2 then acceptable.push j

              # Sort by score and then viewCount
              acceptable.sort (x, y) ->
                n = y.score - x.score
                return n unless n is 0
                y.statistics.viewCount - x.statistics.viewCount

              best = acceptable[0]

              song.youtubeId = best.id
              callback()
          ###
          # I want to check blacklist, whitelist, viewCount and shorten the length of returned array if needed
          song.youtubeId = r1.items[0].id.videoId
          callback()
      )
      return
    ), (err) ->
      if err
        console.log 'A song failed to process'

      else
        console.log 'All songs have been processed successfully'

      songDataReady()

      return



songDataReady = ->
  songs = (song for song in songs when song.youtubeId?)
  fs.writeFile out_file, JSON.stringify(songs), (err) ->
    throw err if err
    console.log "JSON saved to #{out_file}"
    return

  ###
  request.post
    url: "http://jombly.com:3000/update"
    body: JSON.stringify songs
    headers: {"Content-Type": "application/json;charset=UTF-8"}
  , (error, response, body) ->
    console.log "error code: #{error}"
    console.log "status code: #{response.statusCode}"
    return
  ###

update_data()
