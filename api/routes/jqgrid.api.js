var trans = require('../model/trans.mongo.js');

var EMPTY_OBJECT = "{}";
function _fcs(sorting){
	if(sorting){
	  return Number(sorting.replace('desc',-1).replace('asc',1));
	}
	else return 1;
}	
module.exports = {	
		
	findAll : function(req,res){
		console.log("was here");
		var page = req.body.page;
		var limit = Number(req.body.rows);
		var sord = req.body.sord;
		var sidx = req.body.sidx;
		if(sidx){
			sidx = sidx.replace('id','_id');
		}
		var cnd = JSON.parse(req.query.cnd || EMPTY_OBJECT);
		var clt = req.params.collection;
		cnd.rs = 1;
		trans.countActive(function(err,data){
			if(err){ res.json(err,400); }
			else{
				if(data > 0){
					var count = data;
					var totalPage = Math.ceil(count/limit);
					if(page > totalPage) page = totalPage;
					var start = limit*page - limit;
					var sort = {};
					sort[sidx] = _fcs(sord);
					var fmt = JSON.parse(req.query.fmt || EMPTY_OBJECT); //go back when the fields object are final
					var srt = sort;
					var skp = start;
					var lmt = limit;
					trans.findAll(function(err,data){
						if(err){ res.json(err,400); }
						else{ 
							var go = {};
							go.page = page;
							go.total = totalPage;
							go.records = count;
							go.rows = new Array();
							data.forEach(function(row){
								row.id = row._id;
								go.rows.push(row);
							});
							res.json(go); 
						}	
					}, clt, cnd, fmt, srt, skp, lmt);
				}
				else{
					res.json([],200);
				}
			}
		},clt,cnd);
	}
};
