
/**
 * Module dependencies.
 */

var express = require('express')
  , page = require('./routes/page')
  , api = require('./routes/api')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/:collection',api.findAll);
app.get('/:collection/:id',api.findOne);
app.put('/:collection/:id',api.updateOne);
app.del('/:collection/:id',api.removeOne);


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
