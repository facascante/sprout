var trans = require('../model/trans.mongo.js');

var EMPTY_OBJECT = "{}";
	
module.exports = {	
		
		findAll : function(req,res){
			
			var clt = req.params.collection;
			var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
			var fmt = JSON.parse(req.query.fmt || EMPTY_OBJECT);
			var srt = JSON.parse(req.query.srt || EMPTY_OBJECT);
			var skp = req.query.skp || 0;
			var lmt = req.query.lmt || 100;
			trans.findAll(function(err,data){
				if(err){ res.json(err,400); }
				else{ res.json(data,200); }	
			}, clt, cnd, fmt, srt, skp, lmt);
		},
		findOne : function(req,res){
			
			var clt = req.params.collection;
			var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
			var fmt = JSON.parse(req.query.fmt || EMPTY_OBJECT);
			
			cnd._id = trans.ObjectID.createFromHexString(req.params.id);
			trans.findOne(function(err,data){
				if(err){ res.json(err,400); }
				else{ res.json(data,200); }	
			}, clt, cnd, fmt);
		},
		insertOne : function(req,res){
			var clt = req.params.collection;
			var cnt = req.body || {};
			
			trans.insertOne(function(err,data){
				if(err){ res.json(err,400); }
				else{ res.json(data,200); }	
			}, clt, cnt);
		},
		updateOne : function(req,res){
			var clt = req.params.collection;
			var cnt = req.body || {};
			var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
			cnd._id = trans.ObjectID.createFromHexString(req.params.id);
			trans.updateOne(function(err,data){
				if(err){ res.json(err,400); }
				else{ res.json(data,200); }	
			}, clt, cnt, cnd);
		},
		removeOne : function(req,res){
			var clt = req.params.collection;
			var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
			cnd._id = trans.ObjectID.createFromHexString(req.params.id);		
			trans.removeOne(function(err,data){
				if(err){ res.json(err,400); }
				else{ res.json(data,200); }	
			},clt,cnd);
		}
};