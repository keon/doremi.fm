http          = require "http"
request       = require "request"
cheerio       = require "cheerio"
fs            = require "fs"
CronJob       = require("cron").CronJob
YouTube       = require "youtube-node"
moment        = require("moment")
async         = require("async")

youTube       = new YouTube()
songs         = []
out_file      = "../songs.json"

mnet_url      = "http://mwave.interest.me/kpop/chart.m"
mnet_kor_url  = ""
mnet_vote_url = "http://mwave.interest.me/mcountdown/voteState.m"
urls          = [mnet_url, mnet_vote_url]

date          = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ")

blacklist     = ["simply k-pop", "tease", "teaser", "phone", "iPhone", "iPad", "Gameplay", "cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr"]

whitelist     = ["mnet", "full audio", "kpop", "k pop", "k-pop", "korean", "korea", "kor", "kor pop", "korean pop", "korean-pop", "kor-pop", "korean version", "kr", "kr ver", "official", "mv", "m/v", "music video"]

has_korean    = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g


youTube.setKey   "AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg"
youTube.addParam "type"           , "video"
youTube.addParam "part"           , "id"
youTube.addParam "order"          , "relevance"
youTube.addParam "publishedAfter" , date
youTube.addParam "videoDefinition", "high"
youTube.addParam "videoEmbeddable", "true"


LD = (s, t) ->
  n = s.length
  m = t.length
  return m if n is 0
  return n if m is 0

  d       = []
  d[i]    = [] for i in [0..n]
  d[i][0] = i  for i in [0..n]
  d[0][j] = j  for j in [0..m]

  for c1, i in s
    for c2, j in t
      cost = if c1 is c2 then 0 else 1
      d[i+1][j+1] = Math.min d[i][j+1]+1, d[i+1][j]+1, d[i][j] + cost

  d[n][m]

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
  request(url, (error, response, html) ->
    if not error and response.statusCode is 200
      $ = cheerio.load(html)

      if url = mnet_url
        $("div.list_song tr").each (i, element) ->
          artist = $(this).find(".tit_artist a:first-child").text()
                    .replace("(", "")
                    .replace(")", "")
                    .replace("'", "")

          title =  $(this).find(".tit_song a").text()
                    .replace("(", "")
                    .replace(")", "")
                    .replace("'", "")

          rank = $(this).find(".nb em").text()
          query = "#{artist} #{title}"

          if artist? and artist isnt ""
            mwave = { artist: artist, title: title, query: query.toLowerCase(), rank: rank }
            songs.push mwave

      if url = mnet_vote_url
        $(".vote_state_list tr").each (i, element) ->
          artist = $(this).find(".artist a").text()
                    .replace("(", "")
                    .replace(")", "")
                    .replace("'", "")

          title = $(this).find(".music_icon a:nth-child(2)").text()
                    .replace("(", "")
                    .replace(")", "")
                    .replace("'", "")

          rank = $(this).find(".rank img").attr("alt")
          query = "#{artist} #{title}"

          if artist? and artist isnt ""
            mnet = { artist: artist, title: title, query: query.toLowerCase(), rank: rank }
            songs.push mnet

      callback()
  )

update_data = ->
  async.eachSeries urls, ( (url, callback) ->
    get_data url, ->
      console.log "in get data #{url}"
      callback()
    return
  ), (err) ->
    if err then console.log err
    else
      console.log "in return"
      unique = []
      for x in songs
        unique_queries = (q.query for q in unique)
        matches = (y for y in unique_queries when LD(x.query,y) < 3)
        if matches.length is 0 then unique.push x

      console.log unique.length

    return

  ###
  get_data mnet_url, (data) ->
    songs = data
    async.each songs, ((song, callback) ->
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
          s = r1.items[0].id.videoId
          youTube.getById s, (error, r2) ->
            if error
              console.log error
              callback()

            else
              j = r2.items[0]
              title = j.snippet.title
              description = j.snippet.description
              viewCount = j.statistics.viewCount
              bad = 0
              for term in blacklist
                if title.indexOf(term) isnt -1 then bad++
                if description.indexOf(term) isnt -1 then bad++

              score = checkWhitelist(j,song.query)

              if bad > 1 or score < 3 or viewCount < 5000
                console.log "#{song.query} doesn't pass checks: score: #{score}, bad: #{bad}"
                callback()

              else
                song.youtubeId = s
                song.statistics = j.statistics
                callback()

      )
      return
    ), (err) ->
      if err then console.log err
      else
        console.log 'All songs have been processed successfully'
        songDataReady()

    ###



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
