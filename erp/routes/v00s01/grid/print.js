var async = require('async');

module.exports = function(req,res){
	
	var document = req.params.document;
	var process = req.params.process;
	var refno = req.params.refno;
	var print = require('../../../views/print/'+process+'.js');
	async.auto({
		
		getRecord : function(cb){
			var content = {};
			content.table = document;
			content.condition = {
					_id : req.model.ObjectID.createFromHexString(refno)
			};
			req.model.item(content,cb);
		},
		getChildRecord : function(cb){
			var content = {};
			content.table = 'sales_item';
			content.condition = {};
			content.condition['sales_item_id'] = refno;
			req.model.list(content,cb);
		},
		generatePDF : ['getRecord','getChildRecord',function(cb,result){
			var refinfo = {
					gen : result.getRecord,
					detail : result.getChildRecord
			};
			print.print(refinfo,cb);
		}]
	},function(error,results){
		if(results){
			res.redirect(results.generatePDF);
		}
		else{
			res.json(400,err);
		}
	});
};