var YouTube, date, moment, youTube;

YouTube = require('youtube-node');

moment = require('moment');

youTube = new YouTube();

youTube.setKey('AIzaSyCOHL5Z1IEHvbbt71ASsVbMWwZnP9JUOjg');

date = moment().subtract(3, "months").format("YYYY-MM-DDTHH:mm:ssZ");

console.log(date);

youTube.addParam("type", "video");

youTube.addParam("part", "id");

youTube.addParam("order", "relevance");

youTube.addParam("publishedAfter", date);

youTube.addParam("videoDefinition", "high");

youTube.addParam("videoEmbeddable", "true");

youTube.search('World War z Trailer', 50, function(error, result) {
  var video_id;
  if (error) {
    return console.log(error);
  } else {
    return video_id = result.items[0].id.videoId;
  }
});
