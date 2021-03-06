var http = require('http');
var fs = require('fs');

var inotifyClientFactory = require('./inotify-web.js');

fs.readFile('./styles.css', function (err, css) {

  if(err) throw err;

  var eInotifyClient = new inotifyClientFactory();
  
  var port = eInotifyClient.config.port||1337;
  var host = eInotifyClient.config.host||'0.0.0.0';
  
  console.log('Server running at http://' + host + ':' + port);

  http.createServer(function (req, res) {
    res.setHeader('Connection', 'Transfer-Encoding');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    res.write("<style>" + css  + "</style>");

    eInotifyClient.start(function(data){
      if(!data) return;

      var resultingString;

      if(data.rawString) {
        resultingString = "<div class = 'item_raw'>" + data.rawString + "</div>";
      } else {
        resultingString = "<div class = 'item_" + data.action.toLowerCase().replace(/,.*/, "") + "'>";
        
        resultingString += "<div class = 'time'>" + data.time + "</div>";
        resultingString += "<div class = 'action'>" + data.action + "</div>";
        resultingString += "<div class = 'directory'>" + data.directory + "</div>";
        resultingString += "<div class = 'name'>" + data.name + "</div>";
        
        resultingString += "</div>";
      }
      resultingString += "</div>";

      resultingString += "<script>window.scrollTo(0,document.body.scrollHeight);</script>";
      res.write(resultingString);
    }, function(code){
    });
  }).on('connection', function(socket) {
    socket.setTimeout(3600000);
  }).listen(port, host);
});
