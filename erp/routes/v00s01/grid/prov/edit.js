var async = require('async');
module.exports = function(req,res){
	async.auto({
		
		clean : function(cb){
			for(var i in req.body){
				req.body[i] = req.utility.parseNumber(req.body[i]);
				req.body[i] = req.utility.parseBoolean(req.body[i]);
				req.body[i] = req.utility.parseJSON(req.body[i]);
				
			}
			cb(null,req.body);
			
		},
		edit : ['clean',function(cb,result){
			var content = {};
			content.table = req.params.table;
			content.condition = {
				_id : req.model.ObjectID.createFromHexString(req.body.id)
			};
			req.params.id = req.body.id;
			delete result.clean.id;
			content.record = result.clean;
			req.model.update(content,cb);
		}]
		
	},function(error,result){
		if(error){
			res.json(400,new Array(false,'Failed to Edit record',req.body.id));
		}
		else{
			res.json(200,new Array(true,'Record successfully updated',req.params.id));
		}
	});
};