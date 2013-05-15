var async = require('async');
module.exports = function(req,res){
	req.params.value = req.params.value.replace('id','_id');
	req.params.display = req.params.display.replace('id','_id');
	
	var content = {};
	content.table = req.params.table;
	content.columns = {};
	content.columns[req.params.value] = true;
	var displays = req.params.display.split("|");
	if(displays.length > 1){
		for(var i in displays){
			content.columns[displays[i]] = true;
			content.sorting = req.utility.transformSort(displays[0],'asc');
		}
	}
	else{
		content.columns[req.params.display] = true;
		content.sorting = req.utility.transformSort(req.params.display,'asc');
		
	}
	
	
	if(req.query.condition && JSON.parse(req.query.condition.replace("'",'"'))){
		content.condition = JSON.parse(req.query.condition.replace("'","\""));
	}
	req.model.list(content,function(err,result){
		if(result.length){
			var html = "";
			html+="<select><option value ''>Please select</option>";
			var prev_val = "";
			for(var i in result){
				if(prev_val != result[i][req.params.value]){
					html+="<option value='"+ result[i][req.params.value] +"'>" ;
					
					if(displays.length > 1){
						for(var j in displays){
							html+=result[i][displays[j]];
							if(j < (displays.length -1)){
								html+=" - ";
							}
						}
					}
					else{
						html+=result[i][req.params.display];
					}
					
					html+= "</option>";
					prev_val = result[i][req.params.value];
				}
			}
			res.send(200,html);
		}
		else{
			res.json(400,err);
		}
	});
};