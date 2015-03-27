express     = require "express"
bodyParser  = require "body-parser"
fs          = require "fs"
app         = express()
out_file    = "songs.json"
songs       = []

app.all "/*", (req, res, next) ->
  res.header "Access-Control-Allow-Origin", "*"
  res.header "Access-Control-Allow-Headers", "Content-Type,X-Requested-With"
  res.header "Access-Control-Allow-Methods", "GET,PUT"
  next()
  return
app.use bodyParser.json({limit: '50mb'})
app.use bodyParser.urlencoded(extended: false)

app.post "/update", (req,res) ->
    songs = req.body
    res.sendStatus 200
    console.log "Updated songs!"


app.post "/getSong", (req,res) ->
  query = req.body.query
  if songs is undefined or songs.length <= 0
    fs.readFile out_file, "utf8", "w", (err, in_file) ->
      throw err if err
      if not err then songs = JSON.parse in_file

      res.send songs.filter((q) -> q.query is query)
  else
    res.send songs.filter((q) -> q.query is query)


app.get "/today", (req,res) ->
  if songs.length <= 0
    console.log "sending from JSON: #{out_file}"
    fs.readFile out_file, "utf8", "w", (err, in_file) ->
      throw err if err
      if not err
        songs = JSON.parse in_file
        console.log songs
        res.send songs
  else
    console.log "sending existing from memory"
    res.send songs

server = app.listen 3000, ->
    host = server.address().address
    port = server.address().port

    console.log "App listening at http://#{host}:#{port}"