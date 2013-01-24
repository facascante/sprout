
/**
 * Module dependencies.
 */

var express = require('express')
  , page = require('./routes/page')
  , gridapi = require('./routes/jqgrid.api')
  , api = require('./routes/api')
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

/*
 * Web Pages
 */
app.get('/',page.home);
app.get('/page/:module',page.module);
/*
 * Grid Apis
 */
app.post('/api/grid/:collection',gridapi.findAll);

/*
 * Database Transaction
 */
app.get('/api/:collection',api.findAll);
app.get('/api/:collection/:id',api.findOne);
app.post('/api/:collection',api.insertOne);
app.put('/api/:collection/:id',api.updateOne);
app.del('/api/:collection/:id',api.removeOne);

console.log("Web Module Loaded");


