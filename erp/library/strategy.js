var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , async = require('async')
  , mongo = require('../models/mongo.js').db;

passport.use(new LocalStrategy(
  function(username, password, done) {
	  
	  async.auto({
			
			getUserProfile : function(callback){
				var content = {};
			    content.table = 'auth',
			    content.condition = {username:username,password:password};
			    mongo.item(content,function(err,result){
			        if(err || !result){
			        	callback({ message: 'Authentication Failed' });
			        }
			        else{
			        	delete result.password;
			        	callback(null,result);
			        }
			    });
			},
			getRoleAccess : ['getUserProfile',function(callback,result,message){
				var role = result.getUserProfile.role;
				var content = {};
				content.table = 'grant';
				content.condition = {role:role};
				mongo.list(content,function(error,result){
					if(error){
						callback({message:"No permission defined"});
					}
					else{
						var permission = {};
						for(var i in result){
							permission[result[i].action + "_" + result[i].table + "_" + result[i].process] = true;
						}
						callback(null,permission);
					}
				});
			}]
			
		},function(error,result){
			if(error){
				done(null,false,error);
			}
			else{
				
				var user = result.getUserProfile;
				user.permission = result.getRoleAccess;
				done(null,user);
			}
		});
  }
));

passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
	
	async.auto({
		
		getUserProfile : function(callback){
			var content = {};
		    content.table = 'auth',
		    content.condition = {
					_id : mongo.ObjectID.createFromHexString(_id)
			};
		    mongo.item(content,function(err,result){
		        if(err || !result){
		        	callback({ message: 'Authentication Failed' });
		        }
		        else{
		        	callback(null,result);
		        }
		    });
		},
		getRoleAccess : ['getUserProfile',function(callback,result,message){
			var role = result.getUserProfile.role;
			var content = {};
			content.table = 'grant';
			content.condition = {role:role};
			mongo.list(content,function(error,result){
				if(error){
					callback({message:"No permission defined"});
				}
				else{
					var permission = {};
					for(var i in result){
						permission[result[i].action + "_" + result[i].table + "_" + result[i].process] = true;
					}
					callback(null,permission);
				}
			});
		}]
		
	},function(error,result){
		if(error){
			done(null,false,error);
		}
		else{
			var user = result.getUserProfile;
			user.permission = result.getRoleAccess;
			done(null,user);
		}
	});
	
});