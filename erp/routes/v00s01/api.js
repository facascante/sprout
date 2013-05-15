var passport = require('passport');

module.exports = {
		autocomplete : require('./api/autocomplete.js'),
		places : require('./api/places.js'),
		chainselect : require('./api/chainselect.js'),
		login : function(req,res){
			    res.redirect('/');
		}
};