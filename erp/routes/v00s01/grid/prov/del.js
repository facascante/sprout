var async = require('async');
module.exports = function(req,res){
	
async.auto({
		
		prehook : function(callback){
			async.auto({
				
			},callback);
		},
		process : ['prehook',function(callback,results){
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
					req.model.remove(content,cb);
				}
				
			},callback);
		}],
		poshook : ['process',function(callback,results){
			async.auto({

			},callback);
		}]
	},function(error,results){
		if(error){
			res.json(400,new Array(false,'Failed to Remove record',req.body.id));
		}
		else{
			res.json(200,new Array(true,'Record successfully deleted',req.body.id));
		}
	});
};