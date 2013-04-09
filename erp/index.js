/**
 * Module dependencies.
 */
var express = require('express')
  , autoload = require('./routes/autoload')
  , http = require('http')
  , path = require('path')
  , mongo = require('./models/mongo.js')
  , library = require('./library/utility.js');

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('bud'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('dev'));
  app.use(mongo.model);
  app.use(library.utility);
  app.use(app.router);
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Web Pages
 */

app.get('/',autoload.page.home);
app.get('/page/:table/:process/:version',autoload.page.process);

/*
 * Grid Objects
 */

app.post('/grid/prov/:table/:version',autoload.grid.prov);
app.post('/grid/:table/:version',autoload.grid.list);


/*
 * API Objects
 */

app.get('/api/ac/:version',autoload.api.autocomplete);


