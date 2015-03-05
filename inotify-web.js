var inotifyClient = function(){
  this.config = require('./config.json');
  var params = this.parseConfig();
  this.terminal = require('child_process').spawn('inotifywait', params);
};

inotifyClient.prototype.parseConfig = function (){
  var params = ['-rme'];
  params.push(this.config.actions.join());
  for(var i in this.config.excludes)
    params.push('@' + this.config.excludes[i]);
  params = params.concat(this.config.paths);
  params.push('--timefmt');
  params.push('%T');
  params.push('--format');
  params.push("'%T %w %e %f'");
 
  return params;
};

inotifyClient.prototype.start = function(onDataCallback, onEndCallback) {
  var that = this;
  this.terminal.stdout.on('data', function(data) {
    var chunks = data.toString().split('\n');
    for(var i in chunks) {
      if(chunks[i])
        onDataCallback(that.parseOutput(chunks[i]));
    }
  });

  this.terminal.on('exit', onEndCallback);
};

inotifyClient.prototype.parseOutput = function(outputString) {
  var re = /(\d\d:\d\d:\d\d) (.*) (ACCESS|MODIFY|ATTRIB|CLOSE_WRITE|CLOSE_NOWRITE|CLOSE|OPEN|MOVED_TO|MOVED_FROM|MOVE|MOVE_SELF|CREATE|DELETE|DELETE_SELF|UNMOUNT|DELETE,ISDIR|CREATE,ISDIR|ACCESS,ISDIR|OPEN,ISDIR) (.*)/;
  var match = re.exec(outputString);

  var parsedOutput;
  if (match === null) {
    parsedOutput = {
      rawString: outputString
    };
  }
  else {
    parsedOutput = {
      time: match[1],
      directory: match[2],
      action: match[3],
      name: match[4],
    };
  }

  return parsedOutput;
};

module.exports = inotifyClient;
