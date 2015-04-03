gapi_key      = "AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg"
http          = require "http"
request       = require "request"
cheerio       = require "cheerio"
fs            = require "fs"
CronJob       = require("cron").CronJob
YouTube       = require "youtube-node"
moment        = require("moment")
async         = require("async")
googleTranslate = require('google-translate')(gapi_key)
youTube       = new YouTube()
songs         = []
out_file      = "../songs.json"
mnet_url      = "http://mwave.interest.me/kpop/chart.m"
mnet_kor_url  = "http://www.mnet.com/chart/Kpop/all/"
gaon_kor_url  = "http://gaonchart.co.kr/main/section/chart/online.gaon?serviceGbn=S1040&termGbn=week&hitYear=2015&targetTime=13&nationGbn=K"
mnet_vote_url = "http://mwave.interest.me/mcountdown/voteState.m"
kbs_eng_url   = "http://world.kbs.co.kr/english/program/program_musictop10.htm"
urls          = [mnet_url, mnet_vote_url, kbs_eng_url, gaon_kor_url, mnet_kor_url]
date          = moment().subtract(6, "months").format("YYYY-MM-DDTHH:mm:ssZ")
blacklist     = ["simply k-pop", "tease", "teaser", "phone", "iphone", "ipad", "gameplay", "cover", "acoustic", "instrumental", "remix", "mix", "re mix", "re-mix", "version", "ver.", "live", "live cover", "accapella", "cvr", "inkigayo", "reaction", "practice", "dance practice", "highlight", "medley", "dorito", "english version", "japanese version", "vietnamese version", "chinese version", "student", "college", "highschool", "tribute", "nom", "fame", "fame us", "fameus", "famous", "trailer", "music bank", "music core", "show", "exodus", "funny", "mama", "event", "fail", "fails", "full album", "mix", "megamix", "compilation"]

whitelist     = ["kpop", "k pop", "k-pop", "korea", "kr"]

superlist     = ["mv", "m v", "m/v", "musicvideo", "music video", "full audio", "fullaudio", "complete audio", "completeaudio", "official"]

has_korean    = /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7AF\uD7B0-\uD7FF]/g
has_english   = /[A-Za-z]/g

add_to_query  = " kpop"

youTube.setKey   gapi_key
youTube.addParam "type"             , "video"
youTube.addParam "part"             , "id"
youTube.addParam "order"            , "relevance"
youTube.addParam "publishedAfter"   , date
youTube.addParam "videoDefinition"  , "high"
#youTube.addParam "videoEmbeddable"  , "true"
#youTube.addParam "relevanceLanguage", "ko"
youTube.addParam "videoCategoryId"  , 10

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

get_data = (url, callback) ->
  request(url, (error, response, html) ->
    if error then console.log error
    if not error and response.statusCode is 200
      $ = cheerio.load(html)

      if url is mnet_url
        $("div.list_song tr").each (i, element) ->
          artist = $(this).find(".tit_artist a:first-child").text()
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          title =  $(this).find(".tit_song a").text()
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          rank = $(this).find(".nb em").text()

          if artist? and artist isnt ""
            mwave = { artist: artist, title: title, rank: rank }
            songs.push mwave

      if url is mnet_vote_url
        $(".vote_state_list tr").each (i, element) ->
          artist = $(this).find(".artist a").text()
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          title = $(this).find(".music_icon a:nth-child(2)").text()
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          rank = $(this).find(".rank img").attr("alt")

          if artist? and artist isnt ""
            mnet = { artist: artist, title: title, rank: rank }
            songs.push mnet


      if url is gaon_kor_url
        $(".chart tr").each (i, element) ->

          artist = $(this).find(".subject p:nth-child(2)").text()
                    .split("|")[0]
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          title = $(this).find(".subject p:first-child").text()
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          rank = $(this).find(".ranking span").text()
          if rank is ""
            rank = $(this).find(".ranking").text()


          if artist? and artist isnt "" and rank >= 50
            gaon = { artist: artist, title: title, rank: rank }
            songs.push gaon


      if url is mnet_kor_url
        $(".MnetMusicList tr").each (i, element) ->

          artist = $(this).find(".MMLIInfo_Artist").text()
                    .replace(/\s*\(.*?\)\s*/g, '')


          title = $(this).find(".MMLI_Song").text()
                    .replace(/\s*\(.*?\)\s*/g, '')
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")


          rank = $(this).find(".MMLI_RankNum").text()
                    .replace(/\D/g,'')

          if artist? and artist isnt ""
            mnet_kor = { artist: artist, title: title, rank: rank }
            songs.push mnet_kor

      if url is kbs_eng_url
        $(".top10_list_1 ul").each (i, element) ->

          artist = $(this).find(".tit span").text()
                    .replace(/\s*\(.*?\)\s*/g, '')

          title = $(this).find(".tit strong").text()
                    .replace(/\s*\(.*?\)\s*/g, '')
                    .replace(/[\,\(\)\[\]\\\/\<\>\;\"]/ig, " ")

          rank = $(this).find(".num img").attr("alt")
                    .replace(/\D/g,'')

          if artist? and artist isnt ""
            kbs_eng = { artist: artist, title: title, rank: rank }
            songs.push kbs_eng

      callback()
  )


scrape = ->
  async.series [

    # Get song lists from websites in urls array
    ( (callback) ->
      async.each urls, ( (url, done) ->
        get_data url, ->
          console.log "in get data #{url}"
          done()
        return
      ), ->
        console.log "done scraping"
        callback null, 'scraping succeeded'
      return
    ), #end scrape

    # Clean songs by removing words after feat. or prod. and converting to
    # lowercase and stripping out extra spaces and leading spaces
    ( (callback) ->
      for song in songs
        song.artist = song.artist
          .toLowerCase()
          .replace(/feat.\s*([^\n\r]*)/ig,"")
          .replace(/ft.\s*([^\n\r]*)/ig,"")
          .replace(/prod.\s*([^\n\r]*)/ig,"")
          .replace(/\s+/g," ")
          .trim()

        song.title = song.title
          .toLowerCase()
          .replace(/feat.\s*([^\n\r]*)/ig,"")
          .replace(/ft.\s*([^\n\r]*)/ig,"")
          .replace(/prod.\s*([^\n\r]*)/ig,"")
          .replace(/\s+/g," ")
          .trim()


      console.log "done cleaning songs"
      callback null, 'cleaning songs succeeded'
    ), #end scrape


    # Translate song artists when there is no english in the name
    # If there is english, strip out non-english characters
    ( (callback) ->
      async.each songs, ( (song, done) ->

        if has_korean.test(song.artist) is false
          song.artist = song.artist
            .toLowerCase()
            .replace(/[^a-zA-z0-9\s\.\,\-]/g, "")
            .replace(/\s+/g," ")
            .trim()
          done()

        else if has_korean.test(song.artist) is true
          googleTranslate.translate song.artist, 'en', (err, transArtist) ->
            transArtist  = transArtist.translatedText.toLowerCase()

            deDupeArtist = transArtist.split(" ").filter( (item, i, allItems) ->
              return i is allItems.indexOf(item)
            ).join(" ").toLowerCase()

            song.artist  = deDupeArtist
              .toLowerCase()
              .replace(/[^a-zA-z0-9\s\.\,\-]/g, "")
              .replace(/\s+/g," ")
              .trim()

            done()

        else done()
        return
      ), ->
        console.log "done translating artists"
        callback null, 'translating artists succeeded'
      return
    ), #end translate


    # Add in query by combining artist and title
    ( (callback) ->
      for song in songs
        song.query = "#{song.artist} #{song.title}#{add_to_query}"

      console.log "done adding queries"
      callback null, 'query adding succeeded'
    ), #end query creation


    # DeDupe songs based on query
    ( (callback) ->
      unique = []
      for song in songs
        unique_queries = (u.query for u in unique)
        match_query    = (q for q in unique_queries when LD(song.query,q) <= 6)
        if match_query.length is 0
          unique.push song

      songs = unique
      console.log "done deDuping"
      callback null, 'deDupe succeeded'
      return
    ), #end dedupe

    # remove where title or name is < 3 characters
    ( (callback) ->
      songs = (s for s in songs when s.title.length > 2 and s.artist.length > 2)

      console.log "done removing too short"
      callback null, 'too short removal succeeded'
      return
    ), #end strip too short

  ], (err, results) ->
    #console.log results
    console.log (s.query for s in songs)
    async.each songs, ( (song, callback) ->
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
          s = (item.id.videoId for item, key in r1.items)
          #s = r1.items[0].id.videoId

          youTube.getById s.join(","), ( (error, r2) ->
            if error
              console.log error
              callback()

            else
              acceptable = []
              for j in r2.items
                title       = j.snippet.title.toLowerCase()
                  .toLowerCase()
                  .replace(/[\!\@\#\$\%\^\&\*\(\)\-\_\;\:\"\\\/\[\]\{\}\<\>\|\,\+\=]/g, "")
                  .replace(/feat.\s*([^\n\r]*)/ig,"")
                  .replace(/ft.\s*([^\n\r]*)/ig,"")
                  .replace(/prod.\s*([^\n\r]*)/ig,"")
                  .replace(/\s+/g," ")
                  .trim()

                duration    = j.contentDetails.duration
                  .replace("PT","")

                min_pos     = duration.indexOf("M")
                sec_pos     = duration.indexOf("S")
                min         = duration.substring(0,min_pos)
                sec         = duration.substring(min_pos+1,sec)
                viewCount   = j.statistics.viewCount
                likeCount   = j.statistics.likeCount
                title_arr   = title.split " "
                query_arr   = song.query.split " "
                titleCount  = (w for w in title_arr when w in query_arr).length
                badCount    = (w for w in title_arr when w in blacklist).length

                #console.log "#{titleCount}, #{badCount}: #{title}, #{song.query}"
                if  viewCount  >  200000 and
                    likeCount  >  2000 and
                    titleCount >  0 and
                    badCount   is 0 and
                    min        <  5
                  acceptable.push j

              #acceptable.sort (x, y) -> y.statistics.viewCount - x.statistics.viewCount

              if acceptable.length > 0
                console.log "PASS: #{song.query}"
                song.youtubeId = acceptable[0].id
                song.statistics = acceptable[0].statistics
                callback()
              else
                console.log "FAIL: #{song.query}"
                callback()

          ) # end youtube detailed song info search
      ) # end youtube query search

    ), (err) -> # end async each songs
      if err then console.log err
      else
        console.log 'All songs have been processed successfully'
        songDataReady()

    return


songDataReady = ->
  songs = (song for song in songs when song.youtubeId?)
  songs.sort (x, y) -> x.rank - y.rank
  for i, key in songs
    i.rank = key+1

  fs.writeFile out_file, JSON.stringify(songs), (err) ->
    throw err if err
    console.log "JSON saved to #{out_file}"
    return

  request.post
    url: "http://jombly.com:3000/update"
    body: JSON.stringify songs
    headers: {"Content-Type": "application/json;charset=UTF-8"}
  , (error, response, body) ->
    console.log "error code: #{error}"
    console.log "status code: #{response.statusCode}"
    return

scrape()
