var fs= require('fs');
function mkdir(path, root) {

    var dirs = path.split('/'), dir = dirs.shift(), root = ( root||'')+dir+'/';

    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }

    return !dirs.length||mkdir(dirs.join('/'), root);
}
module.exports = function(req,res){
	if(req.files){
		for(var i in req.files){
				var temp_path = req.files[i].path;
				if(req.files[i].name){
					mkdir(req.files[i].path.replace(req.files[i].path.substring(req.files[i].path.lastIndexOf("/") + 1),req.params.table+"/"+req.params.field+"/"+req.params.id));
					var target_path = req.files[i].path.replace(req.files[i].path.substring(req.files[i].path.lastIndexOf("/") + 1),req.params.table+"/"+req.params.field+"/"+req.params.id+"/"+req.files[i].name);
						fs.rename(temp_path, target_path, function(err) {
					        fs.unlink(temp_path, function(err) {
					    		var content = {};
					    		content.table = req.params.table;
					    		content.condition = {
					    				_id : req.model.ObjectID.createFromHexString(req.params.id)
					    		};
					    		content.record = {"$set":{}};
					    		content.record["$set"][req.params.field] = target_path.replace('erp/public','');
					    		req.model.update(content,function(err,result){
					    			result = (result?true:false);
					    			if(result){
					    				res.json(200,'File uploaded to: ' + target_path + ' - ' + req.files[i].size + ' bytes');
					    			}
					    			else{
					    				res.json(400,err);
					    			}
					    			
					    		});
					        
					            
					        });
					        
					    });
				}
				else{
					fs.unlink(temp_path, function(err) {
			            if (err) res.json(400,err);
			            else{
			            	res.json(400,"No files");
			            }
			        });
					
				}
		}
	}
	else{
		res.json(400,"No files");
	}
};