/**
 * Module dependencies.
 */
var express = require('express')
  , autoload = require('./routes/autoload')
  , http = require('http')
  , path = require('path')
  , mongo = require('./models/mongo.js')
  , passport = require('passport')
  , flash = require('connect-flash')
  , library = require('./library/utility.js');

require('./library/strategy.js');

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.compress());
  app.use(express.bodyParser({uploadDir:'./erp/public/uploads'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser('bud'));
  app.use(express.session({ secret: 'bud' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.logger('dev'));
  app.use(mongo.model);
  app.use(library.utility);
  app.use(app.router);
  
});

function auth(req, res, next) {
	  if (req.isAuthenticated()) { return next(); }
	  res.redirect('/page/login/v00s01');
}

function isAllowed(req, res, next) {
	 var action = req.body.oper || req.query.oper;
	 var table = req.params.table;
	 var process = req.params.process;
	 if((typeof action == 'undefined')){
		action = 'view';
	 }
	 if(req.user.permission[action+'_'+table+'_'+process]){
		 next();
	 }
	 else{
		 res.json(400,'Access Denied');
	 }
}

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
 * Web Pages
 */

app.get('/',auth,autoload.page.home);
app.get('/page/:table/:process/:version',auth,autoload.page.process);
app.get('/page/login/:version', autoload.page.login);
app.get('/page/logout/:version', autoload.page.logout);
app.get('/page/event/calendar',autoload.page.calendar);

/*
 * Grid Objects
 */
app.get('/grid/select/:table/:value/:display',auth,autoload.grid.select);
app.post('/grid/prov/:table/:process/:version',auth,isAllowed,autoload.grid.prov);
app.post('/grid/:table/:process/:version',auth,isAllowed,autoload.grid.list);
app.get('/grid/:table/:process/:version',auth,isAllowed,autoload.grid.download);
app.post('/api/grid/upload/:table/:process/:field/:id',auth,autoload.grid.upload);
app.get('/grid/print/:document/:process/:refno',auth,autoload.grid.print);

/*
 * API Objects
 */
app.get('/api/cs/:table/:field/:version',auth,autoload.api.chainselect);
app.get('/api/acadd/:version',auth,autoload.api.places);
app.post('/api/login/:version',
		passport.authenticate('local', { failureRedirect: '/page/login/v00s01', failureFlash: true }),autoload.api.login);


