var utility = {
		transformSort : function (sidx,sord){
			sidx = sidx.replace('id','_id');
			sord = Number(sord.replace('desc',-1).replace('asc',1));
			var sort = {};
			sort[sidx] = sord;
			return sort;
		},
		parseNumber : function(n) {
			  if(!isNaN(parseFloat(n)) && isFinite(n)){
				  return parseFloat(n);
			  }
			  else{
				  return n;
			  }
		},
		parseBoolean : function(bool){
			if(bool == "true"){
				return true;
			}
			else if(bool == "false"){
				return false;
			}
			else{
				return bool;
			}
			
		},
		parseJSON : function(string){
			var result;
			try {
				result = JSON.parse(string);
			} catch (exception) {
				result = string;
			}
			
			return result;
		},
		stringToJSON : function(string){
			var result;
			if(string === Object(string)){
				result = JSON.stringify(string);
			}
			else{
				result = string;
			}
			return result;
		},
		transformSearch : function(operation,field,value){
			
			var result = {};
			switch(operation){
			
				case 'nu' :
				case 'eq' : result[field] = value; break;
				case 'nn' :
				case 'ne' : result[field] = {$ne : value}; break;
				case 'lt' : result[field] = {$lt : value}; break;
				case 'le' : result[field] = {$lte : value}; break;
				case 'gt' : result[field] = {$gt : value}; break;
				case 'ge' : result[field] = {$gte : value}; break;
				case 'bw' : 
				case 'ew' :
				case 'cn' :
				case 'in' : result[field] = (!isNaN(parseFloat(value)) && isFinite(value)) ? parseFloat(value) : new RegExp(value); break; 
				case 'en' :
				case 'nc' :
				case 'ni' :
				case 'bn' : result[field] = {$not : new RegExp(value)}; break;
			
			}
			return result;
		}
};

module.exports.utility = function(req,res,next){
	req.utility = utility;
	return next();
};