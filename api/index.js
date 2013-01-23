
/**
 * Module dependencies.
 */

var express = require('express')
  , api = require('./routes/api')
  , gridapi = require('./routes/jqgrid.api')
  , http = require('http')
  , path = require('path');

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.post('/grid/:collection',gridapi.findAll);

app.get('/:collection',api.findAll);
app.get('/:collection/:id',api.findOne);
app.post('/:collection',api.insertOne);
app.put('/:collection/:id',api.updateOne);
app.del('/:collection/:id',api.removeOne);

console.log("Api Module Loaded");