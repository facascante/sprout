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
				if(err){ res.json(400,err); }
				else{ res.json(200,data); }			
			}, clt, cnd, fmt, srt, skp, lmt);
		},
		findOne : function(req,res){
			
			var clt = req.params.collection;
			var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
			var fmt = JSON.parse(req.query.fmt || EMPTY_OBJECT);
			cnd.id = req.params.id;
			trans.findOne(function(err,data){
				if(err){ res.json(400,err); }
				else{ res.json(200,data); }	
			}, clt, cnd, fmt);
		},
		updateOne : function(req,res){
			var clt = req.params.collection;
			var cnt = req.body || EMPTY_OBJECT;
			var cnd = req.query.cnd || EMPTY_OBJECT;
			cnd.id = req.params.id;
			
			trans.updateOne(function(err,data){
				if(err){ res.json(400,err); }
				else{ res.json(200,data); }	
			}, clt, cnt, cnd);
		},
		removeOne : function(req,res){
			var clt = req.params.collection;
			var cnd = req.query.cnd || EMPTY_OBJECT;
			cnd.id = req.params.id;
			
			trans.removeOne(function(err,data){
				if(err){ res.json(400,err); }
				else{ res.json(200,data); }	
			},clt,cnd);
		}
};