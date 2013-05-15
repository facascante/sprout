var async = require('async');
var json2csv = require('json2csv');

module.exports = function(req,res){
	req.params.query = req.query;
	delete req.query.nd;
	delete req.query._search;
	delete req.query.page;
	delete req.query.sidx;
	delete req.query.sord;
	delete req.query.oper;
	delete req.query.filters;
	var condition = req.params.query.fcond || {};
	delete req.query.fcond;
	delete req.query.rows;
	delete req.query.searchField;
	delete req.query.searchOper;
	delete req.query.searchString;
	req.body = req.query;
	async.auto({
		
		filter : function(cb){
			
			if(req.body){
				for(var i in req.body){
					if(i == 'id'){
						condition._id = req.model.ObjectID.createFromHexString(req.body[i]);
					}
					else{
						condition[i] = req.body[i];
					}
				}
			}
			if(req.params.query._search == "true"){
				if(!req.body.filters){
					var field = req.params.query.searchField;
					var oper = req.params.query.searchOper;
					var value = req.params.query.searchString;
					var filter = req.utility.transformSearch(oper,field,value);
					for(var i in filter){
						condition[i] = filter[i];
					}
				}
				else{
					req.params.query.filters = JSON.parse(req.params.query.filters);
					if(req.params.query.filters.rules && req.params.query.filters.rules.length){
						var rules = req.params.query.filters.rules;
						for(var i in rules){
							var field = rules[i].field;
							var oper = rules[i].op;
							var value = rules[i].data;
							var filter = req.utility.transformSearch(oper,field,value);
							for(var j in filter){
								condition[j] = filter[j];
							}
						}
					}
				}
				
				
			}
			var content = {};
			content.table = req.params.table;
			content.condition = condition || {};
			req.model.count(content,function(err,result){
				if(result){
					cb(null,result);
				}
				else{
					cb(err);
				}
			});
		},
		getProcessField : ['filter',function(cb,result){
			
			var content = {};
			content.table = 'parameter';
			content.condition = {
					table : req.params.table,
					process : req.params.process
			};
			content.columns = {
					index:1,
					label:1
			};
			content.sorting = req.utility.transformSort('sequence','asc');
			req.model.list(content,function(err,result){
				if(result){
					var columns = {};
					var labels = new Array();
					for(var i in result){
						columns[result[i].index] = true;
						labels.push(result[i].label);
					}
					columns[req.params.process + "_created_by"] = true;
					labels.push(req.params.process + "_created_by");
					columns[req.params.process + "_created_at"] = true;
					labels.push(req.params.process + "_created_at");
					columns[req.params.process + "_updated_by"] = true;
					labels.push(req.params.process + "_updated_by");
					columns[req.params.process + "_updated_at"] = true;
					labels.push(req.params.process + "_updated_at");
					cb(null,{columns:columns,labels:labels});
				}
				else{
					cb(err);
				}
			});
		}],
		list : ['getProcessField',function(cb,result){
			
			var content = {};
			content.table = req.params.table;
			content.condition = condition || {};
			content.columns = result.getProcessField.columns;
			content.sorting = req.utility.transformSort(req.params.query.sidx,req.params.query.sord);
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
		transform : ['menuFilter',function(cb,result){
			
			var list = result.menuFilter;
			var collection = new Array();
			list.forEach(function(row){
				var new_row = {};
				for(var j in result.getProcessField.columns){
					if(j!='id')
					new_row[j] = req.utility.stringToJSON(row[j] || "");
				}
				collection.push(new_row);
			});
			
			cb(null,collection);
		}],
		exportToFile : ['transform',function(cb,result){
			var columns = new Array();
			var html = "<table>";
			for(var j in result.getProcessField.columns){
				columns.push(j);
			}
			if(result.transform && result.transform.length > 0){
/*
				json2csv({data: result.transform, fields:columns, fieldNames : result.getProcessField.labels}, function(err, csv) {
					cb(err,csv);
				});
*/				html+="<thead>";
				for(var i in result.getProcessField.columns){
					html+="<th>"+i+"</th>";
				}
				html+="</thead>";
				
				for(var i in result.transform){
					html+="<tr>";
					for(var j in result.transform[i]){
						html+="<td>"+result.transform[i][j]+"</td>";
					}
					html+="</tr>";
				}
				
				html+="</table>";
				cb(null,html);
			}
			else{
				cb("No content to download!");
			}
		}]
	},function(err,result){
		if(result){
			res.contentType('xls');
			var time = new Date().getTime();
			res.attachment(req.params.process + '_' + time + '.xls');
			res.send(result.exportToFile);
		}
		else{
			res.json(400,err);
		}
	});
};