var mongoq = require('mongoq');
var cfg = require('../../config/sprout.js');

var trans = mongoq(cfg.MONGO_TRANS_URL);
var UNSET = 'undefined';

module.exports = {	
	ObjectID : mongoq.mongodb.BSONPure.ObjectID,
	findAll : function(callback, clt, cnd, fmt, srt, skp, lmt){				
		if (typeof cnd == UNSET){ cnd = {};};
		if (typeof fmt == UNSET){ fmt = {};};
		if (typeof srt == UNSET){ srt = {};};
		if (typeof lmt == UNSET){ lmt = 100;};
		if (typeof skp == UNSET){ skip = 0;};
			
		trans.collection(clt)
		.find(cnd,fmt)
		.sort(srt)
		.skip(skp || 0)
		.limit(lmt)
		.toArray()
		.done(function(data){	
			callback(null,data);
		}).fail( function( err ){ 
			callback(err);	
		});
	},
	findOne : function(callback, clt, cnd, fmt){
		if (typeof cnd == UNSET){ cnd = {};};
		if (typeof fmt == UNSET){ fmt = {};};
			
		trans.collection(clt)
		.findOne(cnd,fmt)
		.done(function(data){	
			callback(null,data);
		}).fail( function( err ){ 
			callback(err);	
		});			
	},
	insertOne : function(callback, clt, cnt){			
		
		trans.collection(clt)
	    .insert(cnt, {safe: true})
	    .done(function(data) {   
	    	callback(null,data);
	    })
		.fail( function( err ) { 
			callback(err);	
		});
	},
	updateOne : function(callback, clt, cnt, cnd){			
			
		trans.collection(clt)
	    .update(cnd, cnt, {safe: true})
	    .done(function(data) {   
	    	callback(null,data);
	    })
		.fail( function( err ) { 
			callback(err);	
		});
	},
	removeOne : function(callback,clt,cnd){
		trans.collection(clt)
	    .remove(cnd, {safe: true})
	    .done(function(data) {   
	    	callback(null,data);
	    })
		.fail( function( err ) { 
			callback(err);	
		});
	}
};
