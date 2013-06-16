var async = require('async');
var moment = require('moment');
module.exports = function(req,res){
	
	async.auto({
		
		prehook : function(callback){
			async.auto({
				
				clean : function(cb){
					delete req.body.id;
					for(var i in req.body){
						req.body[i] = req.utility.parseNumber(req.body[i]);
						req.body[i] = req.utility.parseBoolean(req.body[i]);
						req.body[i] = req.utility.parseJSON(req.body[i]);
					}
					for(var i in req.query){
						req.query[i] = req.utility.parseNumber(req.query[i]);
						req.query[i] = req.utility.parseBoolean(req.query[i]);
						req.query[i] = req.utility.parseJSON(req.query[i]);
						if(!req.body[i]){
							req.body[i] = req.query[i];
						}
						req.body[req.params.process+'_created_at'] = moment().format("YYYY-MM-DD HH:mm");
						req.body[req.params.process+'_created_by'] = req.user.username;
					}
					cb(null,req.body);
					
				},
				getSequence : ['clean',function(cb,result){
					var content = {};
					content.table = 'sequence';
					content.condition = {
							table : req.params.table,
							process : req.params.process
					};
					req.model.item(content,cb);
				}],
				Final : ['getSequence',function(cb,result){
					if(result.getSequence){
						result.clean[result.getSequence.index] = result.getSequence.prefix + (Number(result.getSequence.value) + 1);
					}
					cb(null,result.clean);
				}],
				checkPromo : ['Final',function(cb,result){
					if(Number(result.clean.promo) == 0){
						async.auto({
							getPromo : function(gcb){
								var content = {};
								content.table = 'product_promo';
								content.condition = {
									pno : req.body.pno,
									ccode : req.body.ccode
								};
								req.model.item(content,gcb);
							},
							validatePromo : ['getPromo',function(gcb,gres){
								if(gres.getPromo){
									if(Number(gres.getPromo.quantity) >= Number(req.body.quantity)){
										gcb(null,true);
									}
									else{
										gcb("Quantity Ordered does not match the promo criteria");
									}
								}
								else{
									gcb("No promo Available for product: "+req.body.pno + " to customer: "+ req.body.ccode);
								}
							}],
							applyPromo : ['validatePromo',function(gcb,gres){

								if(gres.validatePromo){
									var content = {};
									content.table = 'product_promo';
									content.condition = {
										pno : req.body.pno,
										ccode : req.body.ccode
									};
									content.record = {"$inc":{}};
									content.record["$inc"]["quantity"] = (Number(req.body.quantity) * -1);
									req.model.update(content,gcb);
								}
								else{
									gcb("Promo Issue, Please contact your Promo Administrator!!");
								}
							}]
						},cb);
					}
					else{
						cb(null,true);
					}
				}]
				
			},callback);
		},
		process : ['prehook',function(callback,results){
			async.auto({
				insert : function(cb){
					var content = {};
					content.table = req.params.table;
					content.record = results.prehook.Final;
					req.model.add(content,cb);
				}
				
			},callback);
		}],
		poshook : ['process',function(callback,results){
			async.auto({
				incSequence : function(cb){
					if(results.prehook.getSequence){
						var content = {};
						content.table = 'sequence';
						content.condition = {
								table : req.params.table,
								process : req.params.process
						};
						content.record = {
								"$inc" : {value:1}
						};
						req.model.update(content,cb);
					}
					else{
						cb(null,true);
					}
					
				},
				autoCompute : function(cb){
					async.auto({
						getComputation : function(ccb){
							var content = {};
							content.table = 'computation';
							content.condition = {
									table : req.params.table,
									process : req.params.process
							};
							req.model.list(content,ccb);
						},
						getDataSource : ['getComputation',function(ccb,cres){
							async.forEach(cres.getComputation,function(item,iccb){
								async.auto({
									NoDependencies : function(iiccb){
										async.auto({
											getRecord : function(gcb){
												gcb(null,results.process.insert[0]);
											},
											compute : ['getRecord',function(gcb,gres){
												if(item.relationship == ''){
													var formula= item.formula;
													formula = req.utility.parseEquation(formula,gres.getRecord);
													var letters = /^[A-Za-z]+$/;  
													var computed_value = formula.replace("cdiscount","0");
													if(computed_value.match(letters)){
														computed_value = formula;
													}
													else{
														computed_value = req.utility.calculator.calculate(computed_value);
													}
													if(!req.utility.isNumber(computed_value)){
														computed_value = ""+computed_value;
													}
													else{
														if((computed_value % 1) != 0){
															computed_value = computed_value.toFixed(2);
														}
													}
													var content = {};
													content.table = req.params.table;
													content.condition = {
														_id : results.process.insert[0]._id
													};
													content.record = {"$set":{}};
													content.record["$set"][item.index] = computed_value;
													req.model.update(content,gcb);
												}
												else{
													gcb(null,null);
												}
											}]
										},iiccb);
									},
									Parents: ['NoDependencies',function(iiccb){
										async.auto({
											getRecord : function(gcb){
												gcb(null,results.process.insert[0]);
											},
											getParentRecord : function(gcb){
												if(item.relationship && item.relationship.parent){
													var content = {};
													content.table = item.relationship.parent;
													content.condition = {};
													content.condition._id = req.model.ObjectID.createFromHexString(results.process.insert[0][req.params.table+'_id']);
													req.model.item(content,gcb);
												}
												else{
													gcb(null,null);
												}
											},
											compute : ['getRecord','getParentRecord',function(gcb,gres){
												if(item.relationship && item.relationship.parent){
													var formula= item.formula;
													formula = req.utility.parseEquation(formula,gres.getRecord);
													if(gres.getParentRecord){
														
														formula = req.utility.parseEquation(formula,gres.getParentRecord);
													}
													var letters = /^[A-Za-z]+$/;  
													var computed_value = formula.replace("cdiscount","0");
													if(computed_value.match(letters)){
														computed_value = formula;
													}
													else{
														computed_value = req.utility.calculator.calculate(computed_value);
													}
													if(!req.utility.isNumber(computed_value)){
														computed_value = ""+computed_value;
													}
													else{
														if((computed_value % 1) != 0){
															computed_value = computed_value.toFixed(2);
														}
													}
													var content = {};
													content.table = req.params.table;
													content.condition = {
														_id : results.process.insert[0]._id
													};
													content.record = {"$set":{}};
													content.record["$set"][item.index] = computed_value;
													req.model.update(content,gcb);
												}
												else{
													gcb(null,null);
												}
											}]
										},iiccb);
									}],
									Childs: ['Parents',function(iiccb){
										async.auto({
											getRecord : function(gcb){
												gcb(null,results.process.insert[0]);
											},
											getParentRecord : function(gcb){
												if(item.relationship && item.relationship.parent){
													var content = {};
													content.table = item.relationship.parent;
													content.condition = {};
													content.condition._id = req.model.ObjectID.createFromHexString(results.process.insert[0][req.params.table+'_id']);
													req.model.item(content,gcb);
												}
												else{
													gcb(null,null);
												}
											},
											getChildRecord : function(gcb){
												if(item.relationship && item.relationship.child){
													var content = {};
													content.table = item.relationship.child;
													content.condition = {};
													content.condition[item.relationship.child+'_id'] = results.process.insert[0]._id;
													req.model.list(content,gcb);
												}
												else{
													gcb(null,null);
												}
											},
											compute : ['getRecord','getParentRecord','getChildRecord',function(gcb,gres){
												if(item.relationship && item.relationship.child){
													var formula= item.formula;
													formula = req.utility.parseEquation(formula,gres.getRecord);
													if(gres.getParentRecord){
														
														formula = req.utility.parseEquation(formula,gres.getParentRecord);
													}
													if(gres.getChildRecord){
														var child_summary = {};
														for(var i in gres.getChildRecord){
															if(child_summary[item.index]){
																child_summary[item.index] += req.utility.parseNumber(gres.getChildRecord[i][item.index]);
															}
															else{
																child_summary[item.index] = req.utility.parseNumber(gres.getChildRecord[i][item.index]);
															}
														}
														formula = req.utility.parseEquation(formula,child_summary);
													}
													var letters = /^[A-Za-z]+$/;  
													var computed_value = formula.replace("cdiscount","0");
													if(computed_value.match(letters)){
														computed_value = formula;
													}
													else{
														computed_value = req.utility.calculator.calculate(computed_value);
													}
													if(!req.utility.isNumber(computed_value)){
														computed_value = ""+computed_value;
													}
													else{
														if((computed_value % 1) != 0){
															computed_value = computed_value.toFixed(2);
														}
													}
													var content = {};
													content.table = req.params.table;
													content.condition = {
														_id : results.process.insert[0]._id
													};
													content.record = {"$set":{}};
													content.record["$set"][item.index] = computed_value;
													req.model.update(content,gcb);
												}
												else{
													gcb(null,null);
												}
											}]
										},iiccb);
									}]
								},iccb);
							},ccb);
						}]
					},cb);
				},
				SyncRecord : function(cb){
					async.auto({
						getSyncInfo : function(ccb){
							var content = {};
							content.table = 'synchronization';
							content.condition = {
									table : req.params.table,
									process : req.params.process
							};
							req.model.list(content,ccb);
						},
						applySync : ['getSyncInfo',function(ccb,ccres){
							var syncList = ccres.getSyncInfo;
							async.forEach(syncList,function(item,iccb){
								async.auto({
									
									getMainRecord : function(gcb){
										var content = {};
										content.table = req.params.table;
										content.condition = {
												_id : results.process.insert[0]._id
										};
										req.model.item(content,gcb);
									},
									getSourceRecord : ['getMainRecord',function(gcb,gres){
										var content = {};
										content.table = item.stable;
										content.condition = {};
										content.condition[item.link] = gres.getMainRecord[item.link];
										req.model.item(content,gcb);
									}],
									getDestinationRecord : ['getMainRecord',function(gcb,gres){
										var content = {};
										content.table = item.dtable;
										content.condition = {};
										content.condition[item.link] = gres.getMainRecord[item.link];
										req.model.list(content,gcb);
									}],
									syncRecord : ['getSourceRecord','getDestinationRecord',function(gcb,gres){
										async.forEach(gres.getDestinationRecord,function(gitem,gccb){
											var content = {};
											content.table = item.dtable;
											content.condition = {
												_id : gitem._id
											};
											content.record = {"$set":{}};
											content.record["$set"][item.destination] = gres.getSourceRecord[item.source];
											
											req.model.update(content,gccb);
										},gcb);
									}]
								},iccb);
							},ccb);
						}]
					},cb);
				}
				/*,
				autoSync : function(cb){
					async.auto({
						getSyncInfo : function(ccb){
							var content = {};
							content.table = 'synchronization';
							content.condition = {
									table : req.params.table,
									process : req.params.process
							};
							req.model.list(content,ccb);
						},
						getSourceRecord : function(ccb){
							var content = {};
							content.table = req.params.table;
							content.condition = {
								_id : results.process.insert[0]._id
							};
							req.model.item(content,ccb);
						},
						applySync : ['getSyncInfo','getSourceRecord',function(ccb,cres){
							async.forEach(cres.getSyncInfo,function(item,iccb){
								async.auto({
									getDestinationRecord : function(gcb){
										var content = {};
										content.table = item.dtable;
										content.condition = {};
										if(item.link == '_id'){
											content.condition[item.link] = results.process.insert[0]._id;
										}
										else{
											content.condition[item.link] = results.process.insert[0]._id.toString();
										}
										req.model.list(content,gcb);
									},
									syncRecord : ['getDestinationRecord',function(gcb,gres){
										async.forEach(gres.getDestinationRecord,function(gitem,gccb){
											var content = {};
											content.table = item.dtable;
											content.condition = {
												_id : gitem._id
											};
											content.record = {"$set":{}};
											content.record["$set"][item.destination] = cres.getSourceRecord[item.source];
											req.model.update(content,gccb);
										},gcb);
									}]
								},iccb);
							},ccb);
						}]
					},cb);
				}*/
			},callback);
		}]
	},function(error,results){
		if(error){
			res.json(400,error);
		}
		else{
			res.json(200,new Array(true,'Record successfully added',results.process.insert[0]._id));
		}
	});
	
};