var async = require('async');
var GooglePlaces = require('google-places');

module.exports = function(req,res){
	var places = new GooglePlaces('AIzaSyAao1bm2uXzNG_BmFZE_JUxeX67ta5mIuo');
	async.auto({
		
	  autocomplete : function(cb){
		  
		  places.autocomplete({input: req.query.term, types: "geocode"}, cb);
	  },
	  details : ['autocomplete',function(cb,result){
		    var suggestion = new Array();
		    var new_res = result.autocomplete;
		    var length = new_res.predictions.length;
		  	for(var index in new_res.predictions) {
			  	places.details({reference: new_res.predictions[index].reference}, function(err,response){
			  		if(response.result){
				  		suggestion.push({value:response.result.formatted_address});
				  		if(suggestion.length == length){
				  			cb(null,suggestion);
				  		}
			  		}
			  		else{
			  			cb(null,[{value:"No record found!"}]);
			  		}
			  	});
		  	}
	  }]
	  
	},function(error,result){
		if(error){
			res.json(400,error);
		}
		else{
			res.json(200,result.details);
		}
	});
};
