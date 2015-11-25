var fs = require("fs");
var csv = require("fast-csv");
// var async = require("async");
var stream = fs.createReadStream("./lists/top50.csv");

var songs = {};
var i =0;
// fs.readFile('./lists/top50.csv', function(err, data) {
// 	if (err){
// 		return consol.error(err);
// 	} else{
// 		console.log(i);
// 		i++;
// 		console.log("Asyncronous read: " + data.toString());
// 	}
// });
var string;
var csvStream = csv()
    .on("data", function(data){
    	 console.log(i);
         console.log(data);
         i++;
         string = data.toString();
         songs .push(string.substring(31));
         console.log(string);
         string="";
    })
    .on("end", function(){
         console.log("done");
    });

stream.pipe(csvStream);
console.log(songs);

// var fileStream = fs.createReadStream("./lists/top50.csv"),
//     parser = fastCsv();
 
// fileStream
//     .on("readable", function () {
//         var data;
//         while ((data = fileStream.read()) !== null) {
//             parser.write(data);
//         }
//     })
//     .on("end", function () {
//         parser.end();
//     });
 
// parser
//     .on("readable", function () {
//         var data;
//         while ((data = parser.read()) !== null) {
//             console.log(data);
//         }
//     })
//     .on("end", function () {
//         console.log("done");
//     });
