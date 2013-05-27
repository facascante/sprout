var model = require('../model/mongo');
var moment = require('moment');
var async = require('');
var db = model.db;

var content = {};
content.table = 'notification';
db.list(content,function(err,result){
	result.forEach(function(notification){
		async.auto({
			
			getPreList : function(cb){
				var content = {};
				content.table = notification.table;
				content.condition = notification.precon;
				db.list(content,cb);
			},
			getPostList : ['getPreList',function(cb,cres){
				cres.getPreList.forEach(function(item){
					async.auto({
						prepareCondition : function(ccb){
							var postCondition = JSON.stringify(notification.postcon);
							for(var i in item){
								if(postCondition.indexOf(i)!=-1){
									postCondition.replace(i,item[i]);
								}
							}
							postCondition.replace("system_date",moment().format("YYYY-MM-DD HH:mm"));
							
						},
						getPostList : ['prepareCondition',function(ccb,ccres){
							
						}]
						
					},function(err,cresult){
						cb(cresult);
					});
				});
				
			}]
		});
	});
});