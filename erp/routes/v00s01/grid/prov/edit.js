var async = require('async');
var moment = require('moment');
module.exports = function(req,res){

	async.auto({
		
		prehook : function(callback){
			async.auto({
				
				clean : function(cb){
					for(var i in req.body){
						if(i!="id"){
							req.body[i] = req.utility.parseNumber(req.body[i]);
							req.body[i] = req.utility.parseBoolean(req.body[i]);
							req.body[i] = req.utility.parseJSON(req.body[i]);
						}
						
					}
					for(var i in req.query){
						req.query[i] = req.utility.parseNumber(req.query[i]);
						req.query[i] = req.utility.parseBoolean(req.query[i]);
						req.query[i] = req.utility.parseJSON(req.query[i]);
						if(!req.body[i]){
							req.body[i] = req.query[i];
						}
					}
					cb(null,req.body);
					
				},
				getRecord : ['clean',function(cb,result){
					try{
						var content = {};
						content.table = req.params.table;
						content.condition = {
							_id : req.model.ObjectID.createFromHexString(req.body.id)
						};
						req.model.item(content,cb);
					}
					catch(e){
						cb(e);
					}
				}],
				getSequence : ['getRecord',function(cb,result){
					var content = {};
					content.table = 'sequence';
					content.condition = {
							table : req.params.table,
							process : req.params.process
					};
					req.model.item(content,cb);
				}],
				Final : ['getSequence',function(cb,result){
					if(result.getSequence && !result.getRecord[result.getSequence.index]){
						result.clean[result.getSequence.index] = result.getSequence.prefix + (Number(result.getSequence.value) + 1);
					}
					if(!result.getRecord[req.params.process + '_created_at']){
						result.clean[req.params.process + '_created_at'] = moment().format("YYYY-MM-DD HH:mm");
						result.clean[req.params.process + '_created_by'] = req.user.username;
					}
					else{
						result.clean[req.params.process + '_updated_at'] = moment().format("YYYY-MM-DD HH:mm");
						result.clean[req.params.process + '_updated_by'] = req.user.username;
					}
					cb(null,result.clean);
				}],
				inventory : ['getRecord',function(cb,result){
					console.log("inventory");
					async.auto({
						GetInvLink : function(ccb){
							var content = {};
							content.table = "inv_link";
							content.condition = {
									table : req.params.table,
									process : req.params.process,
									status : req.body.status
							};
							req.model.list(content,ccb);
						},
						ApplyInvRule : ['GetInvLink',function(ccb,cres){
							async.forEach(cres.GetInvLink,function(item,iccb){
								if(item.action == "IN"){
									async.auto({
										GetSource : function(gcb){
											var content = {};
											content.table = item.source.table;
											content.condition = {};
											if(item.source.relationship == "_id"){
												content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
											}
											else{
												content.condition[item.source.relationship] = req.body.id;
											}
											content.sorting = {};
											content.sorting[item.source.ukey] = 'asc';
											req.model.list(content,gcb);
										},
										ApplyBundle :['GetSource',function(gcb,gres){
											var list = new Array();
											var new_list = new Array();
											for(var f in gres.GetSource){
												new_list.push(gres.GetSource[f]);
											}
											async.forEach(gres.GetSource,function(gitem,gccb){
												
												async.auto({
													getProductInfo : function(igccb){
														var content = {};
														content.table = 'product';
														content.condition = {};
														content.condition[item.source.ukey] = gitem[item.source.ukey];
														req.model.item(content,igccb);
													},
													getBundle : ['getProductInfo',function(igccb,igcres){
														if(igcres.getProductInfo){
															var content = {};
															content.table = 'bundle_item';
															content.condition = {
																	bundle_item_id : igcres.getProductInfo._id.toString()
															};
															req.model.list(content,igccb);
														}
														else{
															igccb(null,null);
														}
														
													}],
													applyBundle : ['getBundle',function(igccb,igcres){
														
															if(igcres.getBundle.length > 0 ){
																igcres.getBundle.forEach(function(data){
																
																	data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																	data.condition = gitem.condition;
																	data.location = gitem.location;
																	switch(req.params.table){
																	case 'sales':
																		switch(req.params.process){
																			case 'order':
																				data.refno = gitem.sono;
																			break;
																			case 'delivery':
																				data.refno = gitem.drno;
																			break;
																			case 'return':
																				data.refno = gitem.rmrno;
																			break;
																			case 'memo':
																				data.refno = gitem.cmno;
																			break;
																		}
																		
																		break;
																	case 'shipment' :
																		data.refno = gitem.shipno;
																		
																		break;
																	case 'consignment' :
																		data.refno = gitem.cono;
																		break;
																	}
																	if(Number(data[item.source.quantity]) > 0){
																		new_list.push(data);
																	}
																});
																var index = new_list.indexOf(gitem);
																new_list.splice(index, 1);
																igccb(null,new_list);
															}
															else{
																igccb(null,new_list);
															}
														
														
													}]
													
												},gccb);
											},function(err,out){
												gcb(null,new_list);
											});
										}],
										UpsertDestination : ['ApplyBundle',function(gcb,gres){
											console.log("UpsertDestination");
											var list = new Array();
											for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
												for(var j = i+1; j < gres.ApplyBundle.length; j++){
													if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
														gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
														gres.ApplyBundle[j][item.source.quantity] = 0;
													}
												}
											}
											for(var i = 0; i< gres.ApplyBundle.length ; i++){
												if(gres.ApplyBundle[i][item.source.quantity] != 0){
													list.push(gres.ApplyBundle[i]);
												}
											}
											async.forEach(list,function(gitem,gccb){
												async.auto({
													checkInvExistence : function(igccb){
														var content = {};
														content.table = item.destination.table;
														content.condition = {};
														content.condition[item.destination.ukey] = gitem[item.source.ukey];
														content.condition["condition"] = gitem.condition;
														content.condition["location"] = gitem.location;
														req.model.item(content,igccb);
													},
													Evaluate : ['checkInvExistence',function(igccb,cigres){
														
														if(cigres.checkInvExistence){
															gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
															if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																var content = {};
																content.table = item.destination.table;
																content.condition = {};
																content.condition[item.destination.ukey] = gitem[item.source.ukey];
																content.condition["condition"] = gitem.condition;
																content.condition["location"] = gitem.location;
																content.record = {"$inc":{}};
																content.record["$inc"][item.destination.quantity] = gitem[item.source.quantity];
																req.model.update(content,igccb);
															}
														    else{
														    	igccb(null,null);
														    }
														}
														else{
															gitem.beginning = 0;
															if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																var content = {};
																content.table = item.destination.table;
																content.record = {};
																content.record[item.destination.ukey] = gitem[item.source.ukey];
																for(var ctr in item.reference){
																	content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																}
																content.record["condition"] = gitem.condition;
																content.record["location"] = gitem.location;
																content.record[item.destination.quantity] = gitem[item.source.quantity];
																content.record["status"] = "Instock";
																req.model.add(content,igccb);
															}
															else{
															    	igccb(null,null);
															}
														}
													}],
													LogHistory : ['Evaluate',function(igccb,cigres){
														var content = {};
														content.table = 'movement';
														gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
														gitem.inv_in = gitem[item.source.quantity];
														gitem.inv_out = 0;
														gitem.ending = gitem.beginning + gitem.inv_in;
														gitem.status = item.status;
														switch(req.params.table){
														case 'sales':
															switch(req.params.process){
																case 'order':
																	gitem.refno = gitem.refno || gitem.sono;
																break;
																case 'delivery':
																	gitem.refno = gitem.refno || gitem.drno;
																break;
																case 'return':
																	gitem.refno = gitem.refno || gitem.rmrno;
																break;
																case 'memo':
																	gitem.refno = gitem.refno || gitem.cmno;
																break;
															}
															gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
															gitem.destination = gitem.location;
															gitem.field = item.destination.quantity;
															break;
														case 'shipment' :
															gitem.refno = gitem.refno || gitem.shipno;
															gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
															gitem.destination = gitem.location;
															gitem.field = item.destination.quantity;
															break;
														case 'consignment' :
															gitem.refno = gitem.refno || gitem.cono;
															gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
															gitem.destination = gitem.location;
															gitem.field = item.destination.quantity;
															break;
														}
														content.record = gitem;
														delete gitem._id;
														req.model.add(content,igccb);
													}]
												},gccb);
												
											},gcb);
										}]
									},iccb);
								}
								else if(item.action == "OUT"){
									async.auto({
										GetSource : function(gcb){
											var content = {};
											content.table = item.source.table;
											content.condition = {};
											if(item.source.relationship == "_id"){
												content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
											}
											else{
												content.condition[item.source.relationship] = req.body.id;
											}
											content.sorting = {};
											content.sorting[item.source.ukey] = 'asc';
											req.model.list(content,gcb);
										},
										ApplyBundle :['GetSource',function(gcb,gres){
											var list = new Array();
											var new_list = new Array();
											for(var f in gres.GetSource){
												new_list.push(gres.GetSource[f]);
											}
											async.forEach(gres.GetSource,function(gitem,gccb){
												
												async.auto({
													getProductInfo : function(igccb){
														var content = {};
														content.table = 'product';
														content.condition = {};
														content.condition[item.source.ukey] = gitem[item.source.ukey];
														req.model.item(content,igccb);
													},
													getBundle : ['getProductInfo',function(igccb,igcres){
														if(igcres.getProductInfo){
															var content = {};
															content.table = 'bundle_item';
															content.condition = {
																	bundle_item_id : igcres.getProductInfo._id.toString()
															};
															req.model.list(content,igccb);
														}
														else{
															igccb(null,null);
														}
														
													}],
													applyBundle : ['getBundle',function(igccb,igcres){
														if(igcres.getBundle.length > 0 ){
															igcres.getBundle.forEach(function(data){
																data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																data.condition = gitem.condition;
																data.location = gitem.location;
																switch(req.params.table){
																case 'sales':
																	switch(req.params.process){
																		case 'order':
																			data.refno = gitem.sono;
																		break;
																		case 'delivery':
																			data.refno = gitem.drno;
																		break;
																		case 'return':
																			data.refno = gitem.rmrno;
																		break;
																		case 'memo':
																			data.refno = gitem.cmno;
																		break;
																	}
																	
																	break;
																case 'shipment' :
																	data.refno = gitem.shipno;
																	
																	break;
																case 'consignment' :
																	data.refno = gitem.cono;
																	break;
																}
																if(Number(data[item.source.quantity]) > 0){
																	new_list.push(data);
																}
																
															});
															var index = new_list.indexOf(gitem);
															new_list.splice(index, 1);
														}
														igccb(null,null);
													}]
													
												},gccb);
											},function(err,out){
												gcb(null,new_list);
											});
										}],
										ValidateEachAvailability : ['ApplyBundle',function(gcb,gres){
											var list = new Array();
											for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
												for(var j = i+1; j < gres.ApplyBundle.length; j++){
													if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
														gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
														gres.ApplyBundle[j][item.source.quantity] = 0;
													}
												}
											}
											for(var i = 0; i< gres.ApplyBundle.length ; i++){
												if(gres.ApplyBundle[i][item.source.quantity] != 0){
													list.push(gres.ApplyBundle[i]);
												}
											}
											async.forEach(list,function(gitem,gccb){
												async.auto({
													getStockAvailable : function(igccb){
														var content = {};
														content.table = item.destination.table;
														content.condition = {};
														content.condition[item.destination.ukey] = gitem[item.source.ukey];
														content.condition["condition"] = gitem.condition;
														content.condition["location"] = gitem.location;
														req.model.item(content,igccb);
													},
													compareStock : ['getStockAvailable',function(igccb,igres){
														var stock = igres.getStockAvailable;
														if(stock){
															if(Number(stock[item.destination.quantity]) >= Number(gitem[item.source.quantity] || 0)){
																igccb(null,null);
															}
															else{
																igccb("Item: "+ gitem[item.source.ukey] + " stock is not sufficient!");
															}
														}
														else{
															igccb("Item: "+ gitem[item.source.ukey] + " is out of stock!!");
														}
													}]
												},gccb);
												
											},gcb);
										}],
										UpsertDestination : ['ValidateEachAvailability',function(gcb,gres){
												var list = new Array();
												for(var i in gres.ApplyBundle){
													if(list.length){
														var flag = false;
														for(var j in list){
															if(list[j][item.source.ukey] == gres.ApplyBundle[i][item.source.ukey]){
																flag = true;
																list[j][item.source.quantity] = Number(list[j][item.source.quantity]) + gres.ApplyBundle[i][item.source.quantity];
																
															}
														}
														if(!flag){
															list.push(gres.ApplyBundle[i]);
														}
													}
													else{
														list.push(gres.ApplyBundle[i]);
													}
												}
												async.forEach(list,function(gitem,gccb){
													async.auto({
														checkInvExistence : function(igccb){
															var content = {};
															content.table = item.destination.table;
															content.condition = {};
															content.condition[item.destination.ukey] = gitem[item.source.ukey];
															content.condition["condition"] = gitem.condition;
															content.condition["location"] = gitem.location;
															req.model.item(content,igccb);
														},
														Evaluate : ['checkInvExistence',function(igccb,cigres){
															
															if(cigres.checkInvExistence){
																gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
																if(req.utility.isNumber(gitem[item.source.quantity])){
																	var content = {};
																	content.table = item.destination.table;
																	content.condition = {};
																	content.condition[item.destination.ukey] = gitem[item.source.ukey];
																	content.condition["condition"] = gitem.condition;
																	content.condition["location"] = gitem.location;
																	content.record = {"$inc":{}};
																	content.record["$inc"][item.destination.quantity] = (Number(gitem[item.source.quantity]) * -1);
																	req.model.update(content,igccb);
																}
																else{
																	igccb(null,null);
																}
															}
															else{
																gitem.beginning = 0;
																if(req.utility.isNumber(gitem[item.source.quantity])){
																	var content = {};
																	content.table = item.destination.table;
																	content.record = {};
																	content.record[item.destination.ukey] = gitem[item.source.ukey];
																	for(var ctr in item.reference){
																		content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																	}
																	content.record["condition"] = gitem.condition;
																	content.record["location"] = gitem.location;
																	content.record[item.destination.quantity] = gitem[item.source.quantity];
																	content.record["status"] = "Instock";
																	req.model.add(content,igccb);
																}
																else{
																	igccb(null,null);
																}
															}
														}],
														LogHistory : ['Evaluate',function(igccb,cigres){
															var content = {};
															content.table = 'movement';
															gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
															gitem.inv_in = 0;
															gitem.inv_out = gitem[item.source.quantity];
															gitem.ending = gitem.beginning - gitem.inv_out;
															gitem.status = item.status;
															switch(req.params.table){
															case 'sales':
																switch(req.params.process){
																	case 'order':
																		gitem.refno = gitem.refno || gitem.sono;
																	break;
																	case 'delivery':
																		gitem.refno = gitem.refno || gitem.drno || gitem.sono;
																	break;
																	case 'return':
																		gitem.refno = gitem.refno || gitem.rmrno;
																	break;
																	case 'memo':
																		gitem.refno = gitem.refno || gitem.cmno;
																	break;
																}
																gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																gitem.destination = gitem.customer;
																gitem.field = item.destination.quantity;
																break;
															case 'shipment' :
																gitem.refno = gitem.refno || gitem.shipno;
																gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																gitem.destination = gitem.location;
																gitem.field = item.destination.quantity;
																break;
															case 'consignment' :
																gitem.refno = gitem.refno || gitem.cono;
																gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																gitem.destination = gitem.customer;
																gitem.field = item.destination.quantity;
																break;
															}
															content.record = gitem;
															delete gitem._id;
															req.model.add(content,igccb);
														}]
													},gccb);
													
												},gcb);
										}]
									},iccb);
								}
								else if(item.action == "CONSIGN OUT"){
									async.auto({
										outTheItemFromLocation : function(childcb){
											async.auto({
												GetSource : function(gcb){
													var content = {};
													content.table = item.source.table;
													content.condition = {};
													if(item.source.relationship == "_id"){
														content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
													}
													else{
														content.condition[item.source.relationship] = req.body.id;
													}
													content.sorting = {};
													content.sorting[item.source.ukey] = 'asc';
													req.model.list(content,gcb);
												},
												ApplyBundle :['GetSource',function(gcb,gres){
													var list = new Array();
													var new_list = new Array();
													for(var f in gres.GetSource){
														new_list.push(gres.GetSource[f]);
													}
													async.forEach(gres.GetSource,function(gitem,gccb){
														
														async.auto({
															getProductInfo : function(igccb){
																var content = {};
																content.table = 'product';
																content.condition = {};
																content.condition[item.source.ukey] = gitem[item.source.ukey];
																req.model.item(content,igccb);
															},
															getBundle : ['getProductInfo',function(igccb,igcres){
																if(igcres.getProductInfo){
																	var content = {};
																	content.table = 'bundle_item';
																	content.condition = {
																			bundle_item_id : igcres.getProductInfo._id.toString()
																	};
																	req.model.list(content,igccb);
																}
																else{
																	igccb(null,null);
																}
																
															}],
															applyBundle : ['getBundle',function(igccb,igcres){
																if(igcres.getBundle.length > 0 ){
																	igcres.getBundle.forEach(function(data){
																		data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																		data.condition = gitem.condition;
																		data.location = gitem.location;
																		data.destination = gitem.destination;
																		switch(req.params.table){
																		case 'sales':
																			switch(req.params.process){
																				case 'order':
																					data.refno = gitem.sono;
																				break;
																				case 'delivery':
																					data.refno = gitem.drno;
																				break;
																				case 'return':
																					data.refno = gitem.rmrno;
																				break;
																				case 'memo':
																					data.refno = gitem.cmno;
																				break;
																			}
																			
																			break;
																		case 'shipment' :
																			data.refno = gitem.shipno;
																			
																			break;
																		case 'consignment' :
																			switch(req.params.process){
																				case 'order':
																					data.refno = gitem.cono;
																				break;
																				case 'delivery':
																					data.refno = gitem.cdrno;
																				break;
																			}
																			
																			break;
																		}
																		if(Number(data[item.source.quantity]) > 0){
																			new_list.push(data);
																		}
																		
																	});
																	var index = new_list.indexOf(gitem);
																	new_list.splice(index, 1);
																}
																igccb(null,null);
															}]
															
														},gccb);
													},function(err,out){
														gcb(null,new_list);
													});
												}],
												ValidateEachAvailability : ['ApplyBundle',function(gcb,gres){
													console.log(gres.ApplyBundle);
													var list = new Array();
													for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
														for(var j = i+1; j < gres.ApplyBundle.length; j++){
															if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
																gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
																gres.ApplyBundle[j][item.source.quantity] = 0;
															}
														}
													}
													for(var i = 0; i< gres.ApplyBundle.length ; i++){
														if(gres.ApplyBundle[i][item.source.quantity] != 0){
															list.push(gres.ApplyBundle[i]);
														}
													}
													async.forEach(list,function(gitem,gccb){
														async.auto({
															getStockAvailable : function(igccb){
																var content = {};
																content.table = item.destination.table;
																content.condition = {};
																content.condition[item.destination.ukey] = gitem[item.source.ukey];
																content.condition["condition"] = gitem.condition;
																content.condition["location"] = gitem.location;
																req.model.item(content,igccb);
															},
															compareStock : ['getStockAvailable',function(igccb,igres){
																var stock = igres.getStockAvailable;
																if(stock){
																	if(Number(stock[item.destination.quantity]) >= Number(gitem[item.source.quantity] || 0)){
																		igccb(null,null);
																	}
																	else{
																		igccb("Item: "+ gitem[item.source.ukey] + " stock is not sufficient!");
																	}
																}
																else{
																	igccb("Item: "+ gitem[item.source.ukey] + " is out of stock!!");
																}
															}]
														},gccb);
														
													},gcb);
												}],
												UpsertDestination : ['ValidateEachAvailability',function(gcb,gres){
														var list = new Array();
														for(var i in gres.ApplyBundle){
															if(list.length){
																var flag = false;
																for(var j in list){
																	if(list[j][item.source.ukey] == gres.ApplyBundle[i][item.source.ukey]){
																		flag = true;
																		list[j][item.source.quantity] = Number(list[j][item.source.quantity]) + gres.ApplyBundle[i][item.source.quantity];
																		
																	}
																}
																if(!flag){
																	list.push(gres.ApplyBundle[i]);
																}
															}
															else{
																list.push(gres.ApplyBundle[i]);
															}
														}
														async.forEach(list,function(gitem,gccb){
															async.auto({
																checkInvExistence : function(igccb){
																	var content = {};
																	content.table = item.destination.table;
																	content.condition = {};
																	content.condition[item.destination.ukey] = gitem[item.source.ukey];
																	content.condition["condition"] = gitem.condition;
																	content.condition["location"] = gitem.location;
																	req.model.item(content,igccb);
																},
																Evaluate : ['checkInvExistence',function(igccb,cigres){
																	
																	if(cigres.checkInvExistence){
																		gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
																		if(req.utility.isNumber(gitem[item.source.quantity])){
																			var content = {};
																			content.table = item.destination.table;
																			content.condition = {};
																			content.condition[item.destination.ukey] = gitem[item.source.ukey];
																			content.condition["condition"] = gitem.condition;
																			content.condition["location"] = gitem.location;
																			content.record = {"$inc":{}};
																			content.record["$inc"][item.destination.quantity] = (Number(gitem[item.source.quantity]) * -1);
																			req.model.update(content,igccb);
																		}
																		else{
																			igccb(null,null);
																		}
																	}
																	else{
																		gitem.beginning = 0;
																		if(req.utility.isNumber(gitem[item.source.quantity])){
																			var content = {};
																			content.table = item.destination.table;
																			content.record = {};
																			content.record[item.destination.ukey] = gitem[item.source.ukey];
																			for(var ctr in item.reference){
																				content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																			}
																			content.record["condition"] = gitem.condition;
																			content.record["location"] = gitem.location;
																			content.record[item.destination.quantity] = gitem[item.source.quantity];
																			content.record["status"] = "Instock";
																			req.model.add(content,igccb);
																		}
																		else{
																			igccb(null,null);
																		}
																	}
																}],
																LogHistory : ['Evaluate',function(igccb,cigres){
																	var content = {};
																	content.table = 'movement';
																	gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
																	gitem.inv_in = 0;
																	gitem.inv_out = gitem[item.source.quantity];
																	gitem.ending = gitem.beginning - gitem.inv_out;
																	gitem.status = item.status;
																	switch(req.params.table){
																	case 'consignment' :
																		gitem.refno = gitem.refno || gitem.cono;
																		gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																		gitem.destination = gitem.destination;
																		gitem.field = item.destination.quantity;
																		break;
																	}
																	content.record = gitem;
																	delete gitem._id;
																	req.model.add(content,igccb);
																}]
															},gccb);
															
														},gcb);
												}]
											},childcb);
										},
										inTheItemToDestination : ['outTheItemFromLocation', function(childcb){
											async.auto({
												GetSource : function(gcb){
													var content = {};
													content.table = item.source.table;
													content.condition = {};
													if(item.source.relationship == "_id"){
														content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
													}
													else{
														content.condition[item.source.relationship] = req.body.id;
													}
													content.sorting = {};
													content.sorting[item.source.ukey] = 'asc';
													req.model.list(content,gcb);
												},
												ApplyBundle :['GetSource',function(gcb,gres){
													var list = new Array();
													var new_list = new Array();
													for(var f in gres.GetSource){
														new_list.push(gres.GetSource[f]);
													}
													async.forEach(gres.GetSource,function(gitem,gccb){
														
														async.auto({
															getProductInfo : function(igccb){
																var content = {};
																content.table = 'product';
																content.condition = {};
																content.condition[item.source.ukey] = gitem[item.source.ukey];
																req.model.item(content,igccb);
															},
															getBundle : ['getProductInfo',function(igccb,igcres){
																if(igcres.getProductInfo){
																	var content = {};
																	content.table = 'bundle_item';
																	content.condition = {
																			bundle_item_id : igcres.getProductInfo._id.toString()
																	};
																	req.model.list(content,igccb);
																}
																else{
																	igccb(null,null);
																}
																
															}],
															applyBundle : ['getBundle',function(igccb,igcres){
																
																	if(igcres.getBundle.length > 0 ){
																		igcres.getBundle.forEach(function(data){
																		
																			data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																			data.condition = gitem.condition;
																			data.location = gitem.location;
																			data.destination = gitem.destination;
																			switch(req.params.table){
																			case 'sales':
																				switch(req.params.process){
																					case 'order':
																						data.refno = gitem.sono;
																					break;
																					case 'delivery':
																						data.refno = gitem.drno;
																					break;
																					case 'return':
																						data.refno = gitem.rmrno;
																					break;
																					case 'memo':
																						data.refno = gitem.cmno;
																					break;
																				}
																				
																				break;
																			case 'shipment' :
																				data.refno = gitem.shipno;
																				
																				break;
																			case 'consignment' :
																				switch(req.params.process){
																					case 'order':
																						data.refno = gitem.cono;
																					break;
																					case 'delivery':
																						data.refno = gitem.cdrno;
																					break;
																				}
																				
																				break;
																			}
																			if(Number(data[item.source.quantity]) > 0){
																				new_list.push(data);
																			}
																		});
																		var index = new_list.indexOf(gitem);
																		new_list.splice(index, 1);
																		igccb(null,new_list);
																	}
																	else{
																		igccb(null,new_list);
																	}
																
																
															}]
															
														},gccb);
													},function(err,out){
														gcb(null,new_list);
													});
												}],
												UpsertDestination : ['ApplyBundle',function(gcb,gres){
													console.log("UpsertDestination");
													var list = new Array();
													for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
														for(var j = i+1; j < gres.ApplyBundle.length; j++){
															if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
																gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
																gres.ApplyBundle[j][item.source.quantity] = 0;
															}
														}
													}
													for(var i = 0; i< gres.ApplyBundle.length ; i++){
														if(gres.ApplyBundle[i][item.source.quantity] != 0){
															list.push(gres.ApplyBundle[i]);
														}
													}
													async.forEach(list,function(gitem,gccb){
														async.auto({
															checkInvExistence : function(igccb){
																var content = {};
																content.table = item.destination.table;
																content.condition = {};
																content.condition[item.destination.ukey] = gitem[item.source.ukey];
																content.condition["condition"] = gitem.condition;
																content.condition["location"] = gitem.destination;
																req.model.item(content,igccb);
															},
															Evaluate : ['checkInvExistence',function(igccb,cigres){
																
																if(cigres.checkInvExistence){
																	gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
																	if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																		var content = {};
																		content.table = item.destination.table;
																		content.condition = {};
																		content.condition[item.destination.ukey] = gitem[item.source.ukey];
																		content.condition["condition"] = gitem.condition;
																		content.condition["location"] = gitem.destination;
																		content.record = {"$inc":{}};
																		content.record["$inc"][item.destination.quantity] = gitem[item.source.quantity];
																		req.model.update(content,igccb);
																	}
																    else{
																    	igccb(null,null);
																    }
																}
																else{
																	gitem.beginning = 0;
																	if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																		var content = {};
																		content.table = item.destination.table;
																		content.record = {};
																		content.record[item.destination.ukey] = gitem[item.source.ukey];
																		for(var ctr in item.reference){
																			content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																		}
																		content.record["condition"] = gitem.condition;
																		content.record["location"] = gitem.destination;
																		content.record[item.destination.quantity] = gitem[item.source.quantity];
																		content.record["status"] = "Instock";
																		req.model.add(content,igccb);
																	}
																	else{
																	    	igccb(null,null);
																	}
																}
															}],
															LogHistory : ['Evaluate',function(igccb,cigres){
																var content = {};
																content.table = 'movement';
																gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
																gitem.inv_in = gitem[item.source.quantity];
																gitem.inv_out = 0;
																gitem.ending = gitem.beginning + gitem.inv_in;
																gitem.status = item.status;
																switch(req.params.table){
																case 'consignment' :
																	gitem.refno = gitem.refno || gitem.cono;
																	gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																	gitem.location = gitem.destination;
																	gitem.destination = gitem.destination;
																	gitem.field = item.destination.quantity;
																	break;
																}
																content.record = gitem;
																delete gitem._id;
																req.model.add(content,igccb);
															}]
														},gccb);
														
													},gcb);
												}]
											},childcb);
										}]
										
									},iccb);
								}
								else if(item.action == "CONSIGN IN"){
									async.auto({
										outTheItemFromDestination : function(childcb){
											async.auto({
												GetSource : function(gcb){
													var content = {};
													content.table = item.source.table;
													content.condition = {};
													if(item.source.relationship == "_id"){
														content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
													}
													else{
														content.condition[item.source.relationship] = req.body.id;
													}
													content.sorting = {};
													content.sorting[item.source.ukey] = 'asc';
													req.model.list(content,gcb);
												},
												ApplyBundle :['GetSource',function(gcb,gres){
													var list = new Array();
													var new_list = new Array();
													for(var f in gres.GetSource){
														new_list.push(gres.GetSource[f]);
													}
													async.forEach(gres.GetSource,function(gitem,gccb){
														
														async.auto({
															getProductInfo : function(igccb){
																var content = {};
																content.table = 'product';
																content.condition = {};
																content.condition[item.source.ukey] = gitem[item.source.ukey];
																req.model.item(content,igccb);
															},
															getBundle : ['getProductInfo',function(igccb,igcres){
																if(igcres.getProductInfo){
																	var content = {};
																	content.table = 'bundle_item';
																	content.condition = {
																			bundle_item_id : igcres.getProductInfo._id.toString()
																	};
																	req.model.list(content,igccb);
																}
																else{
																	igccb(null,null);
																}
																
															}],
															applyBundle : ['getBundle',function(igccb,igcres){
																if(igcres.getBundle.length > 0 ){
																	igcres.getBundle.forEach(function(data){
																		data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																		data.condition = gitem.condition;
																		data.location = gitem.location;
																		data.destination = gitem.destination;
																		switch(req.params.table){
																		case 'sales':
																			switch(req.params.process){
																				case 'order':
																					data.refno = gitem.sono;
																				break;
																				case 'delivery':
																					data.refno = gitem.drno;
																				break;
																				case 'return':
																					data.refno = gitem.rmrno;
																				break;
																				case 'memo':
																					data.refno = gitem.cmno;
																				break;
																			}
																			
																			break;
																		case 'shipment' :
																			data.refno = gitem.shipno;
																			
																			break;
																		case 'consignment' :
																			switch(req.params.process){
																				case 'order':
																					data.refno = gitem.cono;
																				break;
																				case 'delivery':
																					data.refno = gitem.cdrno;
																				break;
																			}
																			
																			break;
																		}
																		if(Number(data[item.source.quantity]) > 0){
																			new_list.push(data);
																		}
																		
																	});
																	var index = new_list.indexOf(gitem);
																	new_list.splice(index, 1);
																}
																igccb(null,null);
															}]
															
														},gccb);
													},function(err,out){
														gcb(null,new_list);
													});
												}],
												ValidateEachAvailability : ['ApplyBundle',function(gcb,gres){
													var list = new Array();
													for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
														for(var j = i+1; j < gres.ApplyBundle.length; j++){
															if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
																gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
																gres.ApplyBundle[j][item.source.quantity] = 0;
															}
														}
													}
													for(var i = 0; i< gres.ApplyBundle.length ; i++){
														if(gres.ApplyBundle[i][item.source.quantity] != 0){
															list.push(gres.ApplyBundle[i]);
														}
													}
													async.forEach(list,function(gitem,gccb){
														async.auto({
															getStockAvailable : function(igccb){
																var content = {};
																content.table = item.destination.table;
																content.condition = {};
																content.condition[item.destination.ukey] = gitem[item.source.ukey];
																content.condition["condition"] = gitem.condition;
																content.condition["location"] = gitem.destination;
																req.model.item(content,igccb);
															},
															compareStock : ['getStockAvailable',function(igccb,igres){
																var stock = igres.getStockAvailable;
																if(stock){
																	if(Number(stock[item.destination.quantity]) >= Number(gitem[item.source.quantity] || 0)){
																		igccb(null,null);
																	}
																	else{
																		igccb("Item: "+ gitem[item.source.ukey] + " stock is not sufficient!");
																	}
																}
																else{
																	igccb("Item: "+ gitem[item.source.ukey] + " is out of stock!!");
																}
															}]
														},gccb);
														
													},gcb);
												}],
												UpsertDestination : ['ValidateEachAvailability',function(gcb,gres){
														var list = new Array();
														for(var i in gres.ApplyBundle){
															if(list.length){
																var flag = false;
																for(var j in list){
																	if(list[j][item.source.ukey] == gres.ApplyBundle[i][item.source.ukey]){
																		flag = true;
																		list[j][item.source.quantity] = Number(list[j][item.source.quantity]) + gres.ApplyBundle[i][item.source.quantity];
																		
																	}
																}
																if(!flag){
																	list.push(gres.ApplyBundle[i]);
																}
															}
															else{
																list.push(gres.ApplyBundle[i]);
															}
														}
														async.forEach(list,function(gitem,gccb){
															async.auto({
																checkInvExistence : function(igccb){
																	var content = {};
																	content.table = item.destination.table;
																	content.condition = {};
																	content.condition[item.destination.ukey] = gitem[item.source.ukey];
																	content.condition["condition"] = gitem.condition;
																	content.condition["location"] = gitem.destination;
																	req.model.item(content,igccb);
																},
																Evaluate : ['checkInvExistence',function(igccb,cigres){
																	
																	if(cigres.checkInvExistence){
																		gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
																		if(req.utility.isNumber(gitem[item.source.quantity])){
																			var content = {};
																			content.table = item.destination.table;
																			content.condition = {};
																			content.condition[item.destination.ukey] = gitem[item.source.ukey];
																			content.condition["condition"] = gitem.condition;
																			content.condition["location"] = gitem.destination;
																			content.record = {"$inc":{}};
																			content.record["$inc"][item.destination.quantity] = (Number(gitem[item.source.quantity]) * -1);
																			req.model.update(content,igccb);
																		}
																		else{
																			igccb(null,null);
																		}
																	}
																	else{
																		gitem.beginning = 0;
																		if(req.utility.isNumber(gitem[item.source.quantity])){
																			var content = {};
																			content.table = item.destination.table;
																			content.record = {};
																			content.record[item.destination.ukey] = gitem[item.source.ukey];
																			for(var ctr in item.reference){
																				content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																			}
																			content.record["condition"] = gitem.condition;
																			content.record["location"] = gitem.destination;
																			content.record[item.destination.quantity] = gitem[item.source.quantity];
																			content.record["status"] = "Instock";
																			req.model.add(content,igccb);
																		}
																		else{
																			igccb(null,null);
																		}
																	}
																}],
																LogHistory : ['Evaluate',function(igccb,cigres){
																	var content = {};
																	content.table = 'movement';
																	gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
																	gitem.inv_in = 0;
																	gitem.inv_out = gitem[item.source.quantity];
																	gitem.ending = gitem.beginning - gitem.inv_out;
																	gitem.status = item.status;
																	switch(req.params.table){
																	case 'consignment' :
																		gitem.refno = gitem.refno || gitem.cono;
																		gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																		var loc = gitem.location;
																		var des = gitem.destination;
																		gitem.location = des;
																		gitem.destination = loc;
																		
																		gitem.field = item.destination.quantity;
																		break;
																	}
																	content.record = gitem;
																	delete gitem._id;
																	req.model.add(content,igccb);
																}]
															},gccb);
															
														},gcb);
												}]
											},childcb);
										},
										inTheItemToLocation : ['outTheItemFromDestination', function(childcb){
											async.auto({
												GetSource : function(gcb){
													var content = {};
													content.table = item.source.table;
													content.condition = {};
													if(item.source.relationship == "_id"){
														content.condition[item.source.relationship] = req.model.ObjectID.createFromHexString(req.body.id);
													}
													else{
														content.condition[item.source.relationship] = req.body.id;
													}
													content.sorting = {};
													content.sorting[item.source.ukey] = 'asc';
													req.model.list(content,gcb);
												},
												ApplyBundle :['GetSource',function(gcb,gres){
													var list = new Array();
													var new_list = new Array();
													for(var f in gres.GetSource){
														new_list.push(gres.GetSource[f]);
													}
													async.forEach(gres.GetSource,function(gitem,gccb){
														
														async.auto({
															getProductInfo : function(igccb){
																var content = {};
																content.table = 'product';
																content.condition = {};
																content.condition[item.source.ukey] = gitem[item.source.ukey];
																req.model.item(content,igccb);
															},
															getBundle : ['getProductInfo',function(igccb,igcres){
																if(igcres.getProductInfo){
																	var content = {};
																	content.table = 'bundle_item';
																	content.condition = {
																			bundle_item_id : igcres.getProductInfo._id.toString()
																	};
																	req.model.list(content,igccb);
																}
																else{
																	igccb(null,null);
																}
																
															}],
															applyBundle : ['getBundle',function(igccb,igcres){
																
																	if(igcres.getBundle.length > 0 ){
																		igcres.getBundle.forEach(function(data){
																		
																			data[item.source.quantity] = Number(data.quantity) * Number(gitem[item.source.quantity]);
																			data.condition = gitem.condition;
																			data.location = gitem.location;
																			data.destination = gitem.destination;
																			switch(req.params.table){
																			case 'sales':
																				switch(req.params.process){
																					case 'order':
																						data.refno = gitem.sono;
																					break;
																					case 'delivery':
																						data.refno = gitem.drno;
																					break;
																					case 'return':
																						data.refno = gitem.rmrno;
																					break;
																					case 'memo':
																						data.refno = gitem.cmno;
																					break;
																				}
																				
																				break;
																			case 'shipment' :
																				data.refno = gitem.shipno;
																				
																				break;
																			case 'consignment' :
																				switch(req.params.process){
																					case 'order':
																						data.refno = gitem.cono;
																					break;
																					case 'delivery':
																						data.refno = gitem.cdrno;
																					break;
																				}
																				
																				break;
																			}
																			if(Number(data[item.source.quantity]) > 0){
																				new_list.push(data);
																			}
																		});
																		var index = new_list.indexOf(gitem);
																		new_list.splice(index, 1);
																		igccb(null,new_list);
																	}
																	else{
																		igccb(null,new_list);
																	}
																
																
															}]
															
														},gccb);
													},function(err,out){
														gcb(null,new_list);
													});
												}],
												UpsertDestination : ['ApplyBundle',function(gcb,gres){
													console.log("UpsertDestination");
													var list = new Array();
													for(var i = 0; i< gres.ApplyBundle.length - 1; i++){
														for(var j = i+1; j < gres.ApplyBundle.length; j++){
															if(gres.ApplyBundle[i].pno == gres.ApplyBundle[j].pno){
																gres.ApplyBundle[i][item.source.quantity]+=gres.ApplyBundle[j][item.source.quantity];
																gres.ApplyBundle[j][item.source.quantity] = 0;
															}
														}
													}
													for(var i = 0; i< gres.ApplyBundle.length ; i++){
														if(gres.ApplyBundle[i][item.source.quantity] != 0){
															list.push(gres.ApplyBundle[i]);
														}
													}
													async.forEach(list,function(gitem,gccb){
														async.auto({
															checkInvExistence : function(igccb){
																var content = {};
																content.table = item.destination.table;
																content.condition = {};
																content.condition[item.destination.ukey] = gitem[item.source.ukey];
																content.condition["condition"] = gitem.condition;
																content.condition["location"] = gitem.location;
																req.model.item(content,igccb);
															},
															Evaluate : ['checkInvExistence',function(igccb,cigres){
																
																if(cigres.checkInvExistence){
																	gitem.beginning = cigres.checkInvExistence[item.destination.quantity] || 0;
																	if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																		var content = {};
																		content.table = item.destination.table;
																		content.condition = {};
																		content.condition[item.destination.ukey] = gitem[item.source.ukey];
																		content.condition["condition"] = gitem.condition;
																		content.condition["location"] = gitem.location;
																		content.record = {"$inc":{}};
																		content.record["$inc"][item.destination.quantity] = gitem[item.source.quantity];
																		req.model.update(content,igccb);
																	}
																    else{
																    	igccb(null,null);
																    }
																}
																else{
																	gitem.beginning = 0;
																	if(req.utility.isNumber(gitem[item.source.quantity]) && gitem[item.source.quantity] > 0){
																		var content = {};
																		content.table = item.destination.table;
																		content.record = {};
																		content.record[item.destination.ukey] = gitem[item.source.ukey];
																		for(var ctr in item.reference){
																			content.record[item.reference[ctr]] = gitem[item.reference[ctr]];
																		}
																		content.record["condition"] = gitem.condition;
																		content.record["location"] = gitem.location;
																		content.record[item.destination.quantity] = gitem[item.source.quantity];
																		content.record["status"] = "Instock";
																		req.model.add(content,igccb);
																	}
																	else{
																	    	igccb(null,null);
																	}
																}
															}],
															LogHistory : ['Evaluate',function(igccb,cigres){
																var content = {};
																content.table = 'movement';
																gitem.tdate = moment().format("YYYY-MM-DD HH:mm");
																gitem.inv_in = gitem[item.source.quantity];
																gitem.inv_out = 0;
																gitem.ending = gitem.beginning + gitem.inv_in;
																gitem.status = item.status;
																switch(req.params.table){
																case 'consignment' :
																	gitem.refno = gitem.refno || gitem.cono;
																	gitem.reftype = req.params.table.toUpperCase() + ' ' + req.params.process.toUpperCase() + ' ' + item.action;
																	
																	var loc = gitem.location;
																	var des = gitem.destination;
																	gitem.location = loc;
																	gitem.destination = loc;
																	
																	gitem.field = item.destination.quantity;
																	break;
																}
																content.record = gitem;
																delete gitem._id;
																req.model.add(content,igccb);
															}]
														},gccb);
														
													},gcb);
												}]
											},childcb);
										}]
									},iccb);
								}
								else{
									iccb(null,null);
								}
							},ccb);
						}]
					},cb);
				}]
				
			},callback);
		},
		process : ['prehook',function(callback,results){
			async.auto({
				edit : function(cb,result){
					var content = {};
					content.table = req.params.table;
					content.condition = {
						_id : req.model.ObjectID.createFromHexString(req.body.id)
					};
					req.params.id = req.body.id;
					delete results.prehook.clean.id;
					content.record = {"$set":results.prehook.Final};
					req.model.update(content,cb);
				}
				
			},callback);
		}],
		poshook : ['process',function(callback,results){
			async.auto({
				incSequence : function(cb){
					if(results.prehook.getSequence && !results.prehook.getRecord[results.prehook.getSequence.index]){
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
												var content = {};
												content.table = req.params.table;
												content.condition = {
													_id : req.model.ObjectID.createFromHexString(req.params.id)
												};
												req.model.item(content,function(err,out){
													if(out){
														for(var i in req.body){
															out[i] = req.body[i];
														}
													}
													gcb(null,out);
												});
												
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
														_id : req.model.ObjectID.createFromHexString(req.params.id)
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
												var content = {};
												content.table = req.params.table;
												content.condition = {
													_id : req.model.ObjectID.createFromHexString(req.params.id)
												};
												req.model.item(content,function(err,out){
													if(out){
														for(var i in req.body){
															out[i] = req.body[i];
														}
													}
													gcb(null,out);
												});
											},
											getParentRecord : function(gcb){
												if(item.relationship && item.relationship.parent){
													var content = {};
													content.table = item.relationship.parent;
													content.condition = {};
													content.condition._id = req.model.ObjectID.createFromHexString(req.body[req.params.table+'_id']);
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
														_id : req.model.ObjectID.createFromHexString(req.params.id)
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
												var content = {};
												content.table = req.params.table;
												content.condition = {
													_id : req.model.ObjectID.createFromHexString(req.params.id)
												};
												req.model.item(content,function(err,out){
													if(out){
														for(var i in req.body){
															out[i] = req.body[i];
														}
													}
													gcb(null,out);
												});
											},
											getParentRecord : function(gcb){
												if(item.relationship && item.relationship.parent){
													var content = {};
													content.table = item.relationship.parent;
													content.condition = {};
													content.condition._id = req.model.ObjectID.createFromHexString(req.body[req.params.table+'_id']);
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
													content.condition[item.relationship.child+'_id'] = req.params.id;
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
															if(child_summary[item.formula]){
																child_summary[item.formula] += req.utility.parseNumber(gres.getChildRecord[i][item.formula]);
															}
															else{
																child_summary[item.formula] = req.utility.parseNumber(gres.getChildRecord[i][item.formula]);
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
														_id : req.model.ObjectID.createFromHexString(req.params.id)
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
								_id : req.model.ObjectID.createFromHexString(req.params.id)
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
											content.condition[item.link] = req.model.ObjectID.createFromHexString(req.params.id);
										}
										else{
											content.condition[item.link] = req.params.id;
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
				}
			},callback);
		}]
	},function(error,results){
		if(error){
			res.json(400,error);
		}
		else{
			res.json(200,new Array(true,'Record successfully added',req.params.id));
		}
	});
};