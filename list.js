var fs = require("fs");
var csv = require("fast-csv");




// var stream = fs.createReadStream("./lists/top50.csv");
// var stream = fs.createReadStream("./lists/cafetime.csv");
var stream = fs.createReadStream("./lists/calm.csv");
// var stream = fs.createReadStream("./lists/chill.csv");
// var stream = fs.createReadStream("./lists/classic.csv");
// var stream = fs.createReadStream("./lists/focus.csv");
// var stream = fs.createReadStream("./lists/ost.csv");
// var stream = fs.createReadStream("./lists/rain.csv");
// var stream = fs.createReadStream("./lists/sunshine.csv");
// var stream = fs.createReadStream("./lists/workout.csv");

// var output = "./lists/top50.json";
// var output = "./lists/cafetime.json";
var output = "./lists/calm.json";
// var output = "./lists/chill.json";
// var output = "./lists/classic.json";
// var output = "./lists/focus.json";
// var output = "./lists/ost.json";
// var output = "./lists/rain.json";
// var output = "./lists/sunshine.json";
// var output = "./lists/workout.json";




var string;
var songlist = []
	
	var k =1 ;
	var csvStream = csv()
    .on("data", function(data){

         var song = {}
         string = data.toString();
         song.artist = "";
         song.title = "";
         song.rank = k;
         song.youtubeId = string.substring(32);
         string="";
         k++;
         songlist.push(song);
    })
    .on("end", function(){
         console.log("done");
         console.log(songlist);
         fs.writeFile(output, JSON.stringify(songlist), function(err) {
		    if (err) {
		      throw err;
		    }
		    console.log("JSON saved to " + output);
		});
	});
    
    stream.pipe(csvStream);
