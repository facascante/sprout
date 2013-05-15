var async = require('async');

module.exports = function(req,res){
	
	var document = req.params.document;
	var refno = req.params.refno;
	
	async.auto({
		
		getRecord : function(cb){
			var content = {};
			switch(document){
				case 'dr' : 
					content.table = 'sales';
					content.condition = {
						drno : refno
					};
					break;
				case 'si' : 
					content.table = 'sales';
					content.condition = {
						sino : refno
					};
					break;
			};
			req.model.item(content,cb);
		},
		getChildRecord : function(cb){
			var content = {};
			switch(document){
				case 'dr' : 
					content.table = 'sales_item';
					content.condition = {
						drno : refno
					};
					break;
				case 'si' : 
					content.table = 'sales_item';
					content.condition = {
						sino : refno
					};
					break;
			};
			req.model.list(content,cb);
		},
		generatePDF : ['getRecord','getChildRecord',function(err,result){
			var refinfo = {
					gen : result.getRecord,
					detail : result.getChildRecord
			};
			require('../../../views/print/'+document+'.js')(refinfo);
			cb(null,null);
		}]
	},function(error,results){
		if(results){
			res.contentType('pdf');
			res.download(refinfo +'.pdf');
		}
		else{
			res.json(400,err);
		}
	});
};