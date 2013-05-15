var async = require('async');

module.exports = function(req,res){
	
	async.auto({
		
		  clean : function(cb){
			  if(req.query._value){
				  req.query._value = req.utility.parseNumber(req.query._value);
				  req.query._value = req.utility.parseBoolean(req.query._value);
				  req.query._value = req.utility.parseJSON(req.query._value);
				  var content = {};
				  content.table = req.params.table;
				  content.condition = {};
				  content.condition[req.query._name] = req.utility.isNumber(req.query._value) ? req.query._value : new RegExp(req.query._value);
				  content.columns = {};
				  content.columns[req.params.field] = true;
				  req.model.list(content,cb);
			  }
			  else{
				  cb(null,[]);
			  }
		  },
		  transform : ['clean',function(cb,result){
			  var response = new Array();
			  var temp = "";
			  for(var i in result.clean){
				  if(result.clean[i][req.params.field] != temp && result.clean[i][req.params.field] != ""){
					  var resp = {};
					  resp[result.clean[i][req.params.field]] = result.clean[i][req.params.field];
					  response.push(resp);
					  temp = result.clean[i][req.params.field];
				  }
			  }
			  cb(null,response);
		  }]
		  
	},function(error,result){
		if(error){
			res.json(400,error);
		}
		else{
			res.json(200,result.transform);
		}
	});
};