var trans = require('../model/trans.mongo.js');

module.exports = {	

	home : function(req,res){
		res.render('page',{title:"Hello Node"});
	},
	module : function(req,res){
		
		
		var clt = 'grid';
		var cnd = {grid:req.params.module};
		trans.findOne(function(err,data){
			if(err){ res.json(err,400); }
			else{ 
				if(data){
					delete data._id;
					delete data.grid;
				}
				else{
					data = {};
				}
				data = JSON.stringify(data);
				res.render('module',{module:req.params.module,go:data});
			}	
		}, clt, cnd);
	}
};
