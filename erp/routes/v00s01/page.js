var async = require('async');
module.exports = {
		home : function(req,res){
			res.render('page',{title:"Home"});
		},
		process : function(req,res){
			
			async.auto({
				
				parameters : function(cb){
					var content = {};
					content.table ='parameter';
					content.condition = {table:req.params.table,process:req.params.process};
					content.columns = {};
					content.sorting = {sequence:1};
					req.model.list(content,cb);
					
				},
				collection : ['parameters',function(cb,results){
					var content = {};
					content.table = 'process';
					content.condition = {table:req.params.table,process:req.params.process};
					content.columns = {};
					console.log(content);
					req.model.item(content,function(err,result){
						console.log(result);
						if(err){
							cb(err);
						}
						else if (!result){
							result = {};
							result.caption = "No process defined";
							result.width = 1000;
							result.height = 20;
							cb(null,result);
						}
						else{
							delete result._id;
							delete result.table;
							delete result.process;
							result.url = '/grid/'+req.params.table+'/v00s01';
							result.editurl =  '/grid/prov/'+req.params.table+'/v00s01';
							result.pager = "#grid_pager";
							result.datatype = 'json';
							result.mtype = "POST";
							result.multiselect = true;
							result.colModel = results.parameters;
							result.jsonReader = {
								repeatitems: false,
								root: "rows"
							};
							
							cb(null,result);
						}
					});
				}]
				
			},function(err,result){
				var collection;
				if(err){
					collection = "{}";
				}
				else{
					collection = JSON.stringify(result.collection);
				}
				res.render('process',{table: req.params.table,version: req.params.version,collection:collection});
			});
			
	   }
};