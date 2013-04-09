var async = require('async');
module.exports = function(req,res){
	async.auto({
		
		filter : function(cb){
			req.body.condition = JSON.parse(req.body.condition || "{}");
			if(req.body._search == "true"){
				
				if(!req.body.filters){
					var field = req.body.searchField;
					var oper = req.body.searchOper;
					var value = req.body.searchString;
					var filter = req.utility.transformSearch(oper,field,value);
					for(var i in filter){
						req.body.condition[i] = filter[i];
					}
				}
				else{
					req.body.filters = JSON.parse(req.body.filters);
					if(req.body.filters.rules && req.body.filters.rules.length){
						var rules = req.body.filters.rules;
						for(var i in rules){
							var field = rules[i].field;
							var oper = rules[i].op;
							var value = rules[i].data;
							var filter = req.utility.transformSearch(oper,field,value);
							for(var j in filter){
								req.body.condition[j] = filter[j];
							}
						}
					}
				}
				
				
			}
			var content = {};
			content.table = req.params.table;
			content.condition = req.body.condition || {};
			req.model.count(content,function(err,result){
				if(result){
					cb(null,result);
				}
				else{
					cb(err);
				}
			});
		},
		count : ['filter',function(cb,result){
			var content = {};
			content.table = req.params.table;
			content.condition = req.body.condition || {};
			req.model.count(content,function(err,result){
				if(result){
					cb(null,result);
				}
				else{
					cb(err);
				}
			});
		}],
		paging : ['count',function(cb,result){
			
			var count = result.count;
			var limit = Number(req.body.rows);
			var page = Number(req.body.page);
			var totalPage = Math.ceil(count/limit) || 1;
			if(page > totalPage) page = totalPage;
			var start = limit*page - limit;
			
			cb(null,{page:page,start:start,total:totalPage,limit:limit});
		}],
		list : ['paging',function(cb,result){
			
			var content = {};
			content.table = req.params.table;
			content.condition = req.body.condition || {};
			content.columns = JSON.parse(req.body.columns || "{}");
			content.sorting = req.utility.transformSort(req.body.sidx,req.body.sord);
			content.page = result.paging.start || 0;
			content.rows = result.paging.limit || 100;
			req.model.list(content,function(err,result){
				if(result){
					cb(null,result);
				}
				else{
					cb(err);
				}
			});
		}],
		transform : ['list',function(cb,result){
			
			var list = result.list;
			var collection = {};
			collection.page = result.paging.page;
			collection.total = result.paging.total;
			collection.record = result.count;
			collection.rows = new Array();
			list.forEach(function(row){
				for(var i in row){
						if(i!='_id')
						row[i] = req.utility.stringToJSON(row[i]);
				}
				row.id = row._id;
				delete row._id;
				collection.rows.push(row);
			});
			cb(null,collection);
		}]
		        
		
	},function(err,result){
		if(result){
			res.json(200,result.transform);
		}
		else{
			res.json(400,err);
		}
	});
};