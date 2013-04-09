var async = require('async');
module.exports = function(req,res){
	
	var operation = req.body.oper;
	delete req.body.oper;
	switch(operation){
	
		case "add": 
				require('./prov/add.js')(req,res);
			break;
		case "edit": 
				require('./prov/edit.js')(req,res);
			break;
		case "del": 
				require('./prov/del.js')(req,res);
			break;
	}
	
};