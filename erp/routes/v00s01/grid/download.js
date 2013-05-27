var async = require('async');
var json2csv = require('json2csv');

module.exports = function(req,res){
	req.params.query = {};
	for(var i in req.query){
		req.params.query[i] = req.query[i];
	}
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
						req.body[i] = req.utility.parseNumber(req.body[i]);
						req.body[i] = req.utility.parseBoolean(req.body[i]);
						req.body[i] = req.utility.parseJSON(req.body[i]);
						condition[i] = req.body[i];
					}
				}
			}
			if(req.params.query._search == "true"){
				if(!req.params.query.filters){
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
			delete condition.status;
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
					var columns = {_id:true};
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
		getProcessInfo : ['filter',function(cb,result){
			
			var content = {};
			content.table = 'process';
			content.condition = {
					table : req.params.table,
					process : req.params.process
			};
			req.model.item(content,cb);
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
		getChildProcessField : ['getProcessInfo',function(cb,result){
			if(result.getProcessInfo.subGrid){
				var content = {};
				content.table = 'parameter';
				content.condition = {
						table : result.getProcessInfo.subconfig.table,
						process : result.getProcessInfo.subconfig.process
				};
				content.columns = {
						index:1,
						label:1
				};
				content.sorting = req.utility.transformSort('sequence','asc');
				req.model.list(content,function(err,cres){
					if(cres){
						var columns = {};
						var labels = new Array();
						for(var i in cres){
							columns[cres[i].index] = true;
							labels.push(cres[i].label);
						}
						columns[result.getProcessInfo.subconfig.process + "_created_by"] = true;
						labels.push(result.getProcessInfo.subconfig.process + "_created_by");
						columns[result.getProcessInfo.subconfig.process + "_created_at"] = true;
						labels.push(result.getProcessInfo.subconfig.process + "_created_at");
						columns[result.getProcessInfo.subconfig.process + "_updated_by"] = true;
						labels.push(result.getProcessInfo.subconfig.process + "_updated_by");
						columns[result.getProcessInfo.subconfig.process + "_updated_at"] = true;
						labels.push(result.getProcessInfo.subconfig.process + "_updated_at");
						cb(null,{columns:columns,labels:labels});
					}
					else{
						cb(err);
					}
				});
			}
			else{
				cb(null,null);
			}
		}],
		getChildList : ['list','getProcessInfo','getChildProcessField',function(cb,result){
			if(result.getProcessInfo.subGrid){
				var new_list = new Array();
				async.forEach(result.list,function(item,ccb){
					
					var content = {};
					content.table = result.getProcessInfo.subconfig.table;
					content.condition = {};
					var ctr = 0;
					for(var i in result.getProcessInfo.subconfig.link){
						content.condition[result.getProcessInfo.subconfig.link[i]] = item[result.getProcessInfo.subconfig.link[i]];
						ctr++;
					}
					if(ctr < 1){
						content.condition[result.getProcessInfo.subconfig.table+"_id"] = item._id;
					}
					
					content.columns = result.getChildProcessField.columns;
					content.sorting = {};
					content.sorting.brand = 1;
					req.model.list(content,function(err,result){
						delete item._id;
						if(err){
							ccb(err);
							
						}
						else{
							if(result){
								new_list.push({"parent":item,"child":result});
								ccb(null,null);
							}
							else{
								new_list.push({"parent":item});
							}
						}
					});
				},function(err,results){
					if(err){
						cb(err);
					}
					else{
						cb(null,new_list);
					}
					
				});
			}
			else{
				var new_list = new Array();
				for(var i in result.list){
					delete result.list[i]._id;
					new_list.push({"parent":result.list[i]});
				}
				cb(null,new_list);
			}
		}],
		transform : ['getChildList',function(cb,result){
			
			var list = result.getChildList;
			var collection = new Array();
			list.forEach(function(row){
				var new_row = {parent:{},child:new Array()};
				delete result.getProcessField.columns._id;
				for(var j in result.getProcessField.columns){
					if(j!='id')
					new_row.parent[j] = req.utility.stringToJSON(row.parent[j] || "");
				}
				row.child.forEach(function(child_row){
					var new_child_row = {};
					for(var j in result.getChildProcessField.columns){
						if(j!='id')
							new_child_row[j] = req.utility.stringToJSON(child_row[j] || "");
					}
					new_row.child.push(new_child_row);
				})
				collection.push(new_row);
			});
			console.log(collection);
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
				for(var i in result.getProcessField.labels){
					html+="<th>"+result.getProcessField.labels[i]+"</th>";
				}
				html+="</thead>";
				
				for(var i in result.transform){
					var col_ctr = 0;
					html+="<tr>";
					for(var j in result.transform[i].parent){
						html+="<td>"+result.transform[i].parent[j]+"</td>";
						col_ctr++;
					}
					html+="</tr>";
					if(result.transform[i].child){
						html+="<tr><td>&nbsp;</td><td colspan = "+col_ctr+"><table>";
						html+="<tr>";
						for(var m in result.getChildProcessField.labels){
							html+="<th>"+result.getChildProcessField.labels[m]+"</th>";
						}
						html+="</tr>";
						for(var k in result.transform[i].child){
							html+="<tr>";
							for(var l in result.transform[i].child[k]){
								html+="<td>"+result.transform[i].child[k][l]+"</td>";
							}
							html+="</tr>";
						}
						html+="</table></td></tr>";
					}
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
			res.attachment(req.params.table +"_"+req.params.process + '_' + time + '.xls');
			res.send(result.exportToFile);
		}
		else{
			res.json(400,err);
		}
	});
};