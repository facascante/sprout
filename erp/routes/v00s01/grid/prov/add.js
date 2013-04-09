var async = require('async');
module.exports = function(req,res){
	async.auto({
		
		clean : function(cb){
			delete req.body.id;
			for(var i in req.body){
				req.body[i] = req.utility.parseNumber(req.body[i]);
				req.body[i] = req.utility.parseBoolean(req.body[i]);
				req.body[i] = req.utility.parseJSON(req.body[i]);
			}
			cb(null,req.body);
			
		},
		insert : ['clean',function(cb,result){
			var content = {};
			content.table = req.params.table;
			content.record = result.clean;
			req.model.add(content,cb);
		}]
		
	},function(error,result){
		if(error){
			res.json(400,new Array(false,'Failed to Add record'));
		}
		else{
			res.json(200,new Array(true,'Record successfully added',result.insert._id));
		}
	});
};