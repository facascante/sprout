var async = require('async');
var moment = require('moment');

module.exports = function(req,res){
	async.auto({
		
		filter : function(cb){
			req.body.condition = req.body.fcond || {};
			if(req.query){
				var f =0;
				for(var i in req.query){
					if(i == 'id'){
						req.body.condition._id = req.model.ObjectID.createFromHexString(req.query[i]);
					}
					else{
						req.query[i] = req.utility.parseNumber(req.query[i]);
						req.query[i] = req.utility.parseBoolean(req.query[i]);
						req.query[i] = req.utility.parseJSON(req.query[i]);
						req.body.condition[i] = req.query[i];
					}
					f++;
				}
				console.log('feffefef : '+f);
				if(f>1){
					delete req.body.condition[req.params.table+"_id"];
				}
			}
			if(req.body._search == "true"){
				if(!req.body.filters){
					var field = req.body.searchField;
					var oper = req.body.searchOper;
					var value = req.body.searchString;
					var filter = req.utility.transformSearch(oper,field,value);
					for(var i in filter){
						filter[i] = req.utility.parseNumber(filter[i]);
						filter[i] = req.utility.parseBoolean(filter[i]);
						filter[i] = req.utility.parseJSON(filter[i]);
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
			console.log(content);
			req.model.list(content,function(err,result){
				if(result){
					cb(null,result);
				}
				else{
					cb(err);
				}
			});
		}],
		menuFilter :['list',function(cb,result){
			if(req.params.table == 'menu'){
				var list = result.list;
				var new_list = new Array();
				for(var i in list){
					if(list[i].table && list[i].process){
						if(req.user.permission['view_'+list[i].table+'_'+list[i].process]){
							new_list.push(list[i]);
						}
					}
					else{
						new_list.push(list[i]);
					}
				}
				cb(null,new_list);
			}
			else{
				cb(null,result.list);
			}
			
		}],
		getParameters : function(cb){
			var content = {};
			content.table = 'parameter',
			content.condition = {
				table : req.params.table,
				process:req.params.process
			};
			content.columns = {index:1,_id:0};
			req.model.list(content,cb);
		},
		transform : ['menuFilter','getParameters',function(cb,result){
			
			var list = result.menuFilter;
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
				var parameters = result.getParameters;
				var new_row = {};
				console.log("chito");
				console.log(parameters);
				if(parameters.length && req.params.table != 'menu'){
					for(var i in parameters){
						new_row[parameters[i].index] = row[parameters[i].index] || "";
					}
					new_row.id = row.id;
					collection.rows.push(new_row);
				}
				else{
					collection.rows.push(row);
				}
				
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