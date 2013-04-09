var async = require('async');

module.exports = function(req,res){
	
	async.auto({
		
	  clean : function(cb){
		  var content = {};
		  content.table = req.query.param;
		  content.condition = {};
		  content.condition[req.query.param] = new RegExp(req.query.term);
		  req.model.list(content,cb);
	  },
	  transform : ['clean',function(cb,result){
		  var list = result.clean;
		  for(var i in list){
			  list[i].value = list[req.query.param];
		  }
		  if(list.length == 0){
			  list.push({value:'No record found',id:''});
		  }
		  cb(null,list);
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