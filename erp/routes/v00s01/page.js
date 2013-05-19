var async = require('async');
module.exports = {
		home : function(req,res){
			res.render('page',{title:"Home",message:''});
		},
		login : function(req,res){
			res.render('login', {title:"Login", user: req.user, message: req.flash('error') });
		},
		logout : function(req,res){
			req.logout();
			res.redirect('/');
		},
		process : function(req,res){
			
			async.auto({
				
				parameters : function(cb){
					var content = {};
					content.table ='parameter';
					content.condition = {table:req.params.table,process:req.params.process};
					content.columns = {};
					content.sorting = {sequence:1};
					req.model.list(content,function(err,result){
						if(result){
							for(var i in result){
								if(result[i].editrules && result[i].editrules.required && !result[i].formoptions){
									result[i].formoptions = {"elmprefix":"(*)"};
									
								}
								else{
									if(!result[i].formoptions){
										result[i].formoptions = {"elmprefix":"&nbsp;&nbsp;&nbsp;&nbsp;"};
									}
								}

							}
						}
						cb(err,result);
					});
					
				},
				collection : ['parameters',function(cb,results){
					var content = {};
					content.table = 'process';
					content.condition = {table:req.params.table,process:req.params.process};
					content.columns = {};
					req.model.item(content,function(err,result){
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
							result.url = '/grid/'+req.params.table+'/'+req.params.process+'/v00s01';
							result.editurl =  '/grid/prov/'+req.params.table+'/'+req.params.process+'/v00s01';
							result.pager = "#grid_pager";
							result.datatype = 'json';
							result.mtype = "POST";
							result.multiselect = true;
							result.gridview = true;
							result.rownumbers = true;
							result.colModel = results.parameters;
							result.jsonReader = {
								repeatitems: false,
								root: "rows"
							};
							if(result.postData == ""){
								delete result.postData;
							}
							cb(null,result);
						}
					});
				}],
				subgridParameter : ['collection',function(cb,results){
					if(results.collection.subGrid){
						var sub_table = results.collection.subconfig;
						var content = {};
						content.table ='parameter';
						content.condition = {table:sub_table.table,process:sub_table.process};
						content.columns = {};
						content.sorting = {sequence:1};
						req.model.list(content,function(err,result){
							if(result){
								for(var i in result){
									if(result[i].editrules && result[i].editrules.required && !result[i].formoptions){
										result[i].formoptions = {"elmprefix":"(*)"};
										
									}
									else{
										if(!result[i].formoptions){
											result[i].formoptions = {"elmprefix":"&nbsp;&nbsp;&nbsp;&nbsp;"};
										}
									}

								}
							}
							cb(err,result);
						});
					}
					else{
						cb(null,{});
					}
					
				}],
				subgridCollection : ['subgridParameter',function(cb,results){
					if(results.collection.subGrid){
						var sub_table = results.collection.subconfig;
						var content = {};
						content.table = 'process';
						content.condition = {table:sub_table.table,process:sub_table.process};
						content.columns = {};
						req.model.item(content,function(err,result){
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
								result.url = '/grid/'+sub_table.table+'/'+sub_table.process+'/v00s01';
								result.editurl =  '/grid/prov/'+sub_table.table+'/'+sub_table.process+'/v00s01';
								result.datatype = 'json';
								result.mtype = "POST";
								result.multiselect = true;
								result.gridview = true;
								result.rownumbers = true;
								result.colModel = results.subgridParameter;
								result.jsonReader = {
									repeatitems: false,
									root: "rows"
								};
								if(result.postData == ""){
									delete result.postData;
								}
								
								cb(null,result);
							}
						});
					}
					else{
						cb(null,{});
					}
					
				}]
				
			},function(err,result){
				var collection,subcol,permission="{}",subgridPermission="{}";
				if(err){
					collection = "{}";
					subcol="{}";
				}
				else{
					collection = JSON.stringify(result.collection);
					subcol = JSON.stringify(result.subgridCollection);;
					var sub_table = result.collection.subconfig;
					permission = JSON.stringify({
							add : req.user.permission['add_'+req.params.table+'_'+req.params.process] || false,
							edit : req.user.permission['edit_'+req.params.table+'_'+req.params.process] || false,
							del : req.user.permission['del_'+req.params.table+'_'+req.params.process] || false,
							view : req.user.permission['view_'+req.params.table+'_'+req.params.process] || false,
							excel : req.user.permission['excel_'+req.params.table+'_'+req.params.process] || false,
							print : req.user.permission['print_'+req.params.table+'_'+req.params.process] || false,
					});
					if(sub_table){
						subgridPermission = JSON.stringify({
							add : req.user.permission['add_'+sub_table.table+'_'+sub_table.process] || false,
							edit : req.user.permission['edit_'+sub_table.table+'_'+sub_table.process] || false,
							del : req.user.permission['del_'+sub_table.table+'_'+sub_table.process] || false,
							view : req.user.permission['view_'+sub_table.table+'_'+sub_table.process] || false,
							print : req.user.permission['print_'+sub_table.table+'_'+sub_table.process] || false,
					    });
					}
				}
				res.render('process',{permission:permission,collection:collection,subcol:subcol,subgridPermission:subgridPermission});
			});
			
	   }
};