var async = require('async');
var moment = require('moment');
module.exports = function(req,res){
	
	var refno = req.model.ObjectID.createFromHexString(req.params.refno);
	
	async.auto({
		
		getProcess : function(cb){
			var content = {};
			content.table = 'process',
			content.condition = {
				table : req.params.table,
				process : req.params.process
			};
			req.model.item(content,cb);
		},
		getRecord : function(cb){
			var content = {};
			content.table = req.params.table,
			content.condition = {
				_id : refno
			};
			req.model.item(content,cb);
		},
		saveRecord : function(cb,cres){
			delete req.body.id;
			for(var i in req.body){
				req.body[i] = req.utility.parseNumber(req.body[i]);
				req.body[i] = req.utility.parseBoolean(req.body[i]);
				req.body[i] = req.utility.parseJSON(req.body[i]);
			}
			req.body[req.params.process+'_created_at'] = moment().format("YYYY-MM-DD HH:mm");
			req.body[req.params.process+'_created_by'] = req.user.username;

			var content = {};
			content.table = req.params.table;
			content.record = req.body;
			req.model.add(content,cb);
			
		},
		getChildRecord :['getProcess','getRecord',function(cb,cres){
			if(cres.getProcess.subconfig){
				var child_table = cres.getProcess.subconfig.table;
				var link_fields = cres.getProcess.subconfig.link;
				var content = {};
				content.table = child_table;
				content.condition = {};
				if(link_fields.length){
					for(var i in link_fields){
						content.condition[link_fields[i]] = cres.getRecord[link_fields[i]];
					}
				}
				else{
					content.condition[child_table+"_id"] = req.params.refno;
				}
				req.model.list(content,cb);
			}
			else{
				cb(null,[]);
			}
		}],
		saveChildRecord :['getChildRecord','saveRecord',function(cb,cres){
			var new_record = cres.getChildRecord;
			if(new_record.length > 0){
				var link_fields = cres.getProcess.subconfig.link;
				var child_table = cres.getProcess.subconfig.table;
				for(var i in new_record){
					if(link_fields.length){
						for(var j in link_fields){
							new_record[i][link_fields[j]] = cres.saveRecord[0][link_fields[j]];
						}
					}
					new_record[i][child_table+"_id"] = cres.saveRecord[0]._id.toString();
					delete new_record[i]._id;
					new_record[i][cres.getProcess.subconfig.process+'_created_at'] = moment().format("YYYY-MM-DD HH:mm");
					new_record[i][cres.getProcess.subconfig.process+'_created_by'] = req.user.username;
				}
				var content = {};
				content.table = cres.getProcess.subconfig.table;
				content.record = new_record;
				req.model.add(content,cb);
				
			}
			else{
				cb(null,true);
			}
		}],
		
	},function(error,results){
		console.log(results);
		if(results){
			res.json(200,"ok");
		}
		else{
			res.json(400,err);
		}
	});
};