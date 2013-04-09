var async = require('async');
module.exports = function(req,res){
	async.auto({		
		remove : function(cb,result){
			var content = {};
			content.table = req.params.table;
			var ids = req.body.id.split(',');
			for(var i in ids){
				ids[i] = req.model.ObjectID.createFromHexString(ids[i]);
			}
			
			content.condition = {
				_id : {"$in":ids}
			};
			console.log(content);
			req.model.remove(content,cb);
		}	
	},function(error,result){
		if(error){
			res.json(400,new Array(false,'Failed to Remove record',req.body.id));
		}
		else{
			res.json(200,new Array(true,'Record successfully deleted',req.body.id));
		}
	});
};