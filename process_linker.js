var db = require('./erp/models/mongo.js').db;
var async = require('async');

async.auto({
	
	getProcess : function(cb){
		var content = {};
		content.table = 'product';
		content.condition = {};
		db.list(content,cb);
	},
	linkToParameter : ['getProcess', function(cb,result){
		async.forEach(result.getProcess,function(item,ccb){
			async.auto({
				getParameters : function(gcb){
					var content = {};
					content.table = 'bundle_item';
					content.condition = {
							bundle_item_id : item.pno
					};
					db.list(content,gcb);
				},
				linkToProcess : ['getParameters',function(gcb,gres){
					async.forEach(gres.getParameters,function(gitem,gccb){
						var content = {};
						content.table = 'bundle_item';
						content.condition = {
							_id : gitem._id
						};
						content.record = {"$set":{}};
						content.record["$set"].bundle_item_id = item._id.toString();
						db.update(content,gccb);
					},gcb);
				}]
			},ccb);
		},cb);
	}]
},function(error,result){
	console.log(error);
	console.log(result);
});