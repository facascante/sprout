var mongoq = require('mongoq');
var config = require('../config.json');
var db = mongoq(config.mongo.url);

var model = {
		ObjectID : mongoq.mongodb.BSONPure.ObjectID,
		count : function(content,cb){
			db.collection(content.table)
			  .find(content.condition)
			  .count()
			  .done(function(result){
				  cb(null,result);
			  })
			  .fail(function(err){
				  console.log(err);
				  cb(err);
			  });
		},
		list : function(content,cb){
			db.collection(content.table)
			  .find(content.condition || {},content.columns || {})
			  .sort(content.sorting || {})
			  .skip(content.page || 0)
			  .limit(content.rows || 100)
			  .toArray()
			  .done(function(result){
				  cb(null,result);
			  })
			  .fail(function(err){
				  console.log(err);
				  cb(err);
			  });
		},
		item : function(content,cb){
			db.collection(content.table)
			  .findOne(content.condition,content.columns)
			  .done(function(result){
				  cb(null,result);
			  })
			  .fail(function(err){
				  console.log(err);
				  cb(err);
			  });
		},
		add : function(content,cb){
		      db.collection(content.table)
		      .insert(content.record, {safe: true})
		      .done(function(result){
		        cb(null,result);
		      })
		      .fail( function( err ) {
		    	  console.log(err);
		    	  cb(err);
		      });
		},
		update : function(content,cb){
		        db.collection(content.table)
		        .update(content.condition, content.record, {safe: true})
		        .done(function(result){
		            cb(null,result);
		        })
		        .fail( function( err ) {
		        	console.log(err);
		            cb(err);
		        });
		},
		remove : function(content,cb){
		        db.collection(content.table)
		        .remove(content.condition, {safe: true})
		        .done(function(result){
		            cb(null,result);
		        })
		        .fail( function( err ) {
		        	console.log(err);
		            cb(err);
		        });
		}
};

module.exports.model = function(req,res,next){
	req.model = model;
	return next();
};