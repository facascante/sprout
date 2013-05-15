var utility = {
		transformSort : function (sidx,sord){
			var sort = {};
			if(sidx){
				sidx = sidx.replace('id','_id');
			}
			else{
				sidx = "_id";
			}
			if(sord){
				sord = Number(sord.replace('desc',-1).replace('asc',1));
			}
			else{
				sord = "asc";
			}
			var nsidx = sidx.split(', ');
			if(nsidx.length > 1){
				for(var i in nsidx){
					var ninsidx = nsidx[i].split(' ');
					if(ninsidx.length == 2){
						sort[ninsidx[0]] = ninsidx[1];
					}
					else{
						sort[ninsidx[0]] = sord;
					}
					
					
				}
			}
			else{
				sort[sidx] = sord;
			}
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
		isNumber : function(n){
			  if(!isNaN(parseFloat(n)) && isFinite(n)){
				  return true;
			  }
			  else{
				  return false;
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
		},
		calculator : (function(){
			function safe(expr){
				if (/[^\d*-+\/()^%. ]/.test(expr))
					throw "Malformed expression.";
				return expr;
			}
			function calculate(expr) {
				try {
					return eval(expr);
				} catch (e) {
					return expr.toString();
				}
			}
			return { calculate: calculate };
		})(),
		parseEquation : function(expr,data){

			for(var i in data){
				var regex = new RegExp(i,"g");
				expr = expr.replace(regex,data[i]);
			}
			expr = expr.replace(/ /g,"");
			return expr;
		}
};

module.exports.utility = function(req,res,next){
	req.utility = utility;
	return next();
};