var version = {};
version.v00s01 = {
		page : require('./v00s01/page.js'),
		api : require('./v00s01/api.js'),
		grid : require('./v00s01/grid.js')
};

module.exports = {
	
		page : {
			home : function(req,res){
				if((typeof req.params.version == 'undefined')){
					req.params.version = "v00s01";
				}
				var instance = version[req.params.version];
				execute(instance,res,instance.page.home(req,res));
			},
			process : function(req,res){
				if((typeof req.params.version == 'undefined')){
					req.params.version = "v00s01";
				}
				var instance = version[req.params.version];
				execute(instance,res,instance.page.process(req,res));
			}
		},
		grid : {
			list : function(req,res){
				if((typeof req.params.version == 'undefined')){
					req.params.version = "v00s01";
				}
				var instance = version[req.params.version];
				execute(instance,res,instance.grid.list(req,res));
			},
			prov : function(req,res){
				if((typeof req.params.version == 'undefined')){
					req.params.version = "v00s01";
				}
				var instance = version[req.params.version];
				execute(instance,res,instance.grid.prov(req,res));
			}
		},
		api : {
			autocomplete : function(req,res){
				if((typeof req.params.version == 'undefined')){
					req.params.version = "v00s01";
				}
				var instance = version[req.params.version];
				execute(instance,res,instance.api.autocomplete(req,res));
			}
		}
};

function execute(instance, res, next) {
	
	if(!(typeof instance == 'undefined')){
		next;
	}
	else{
		res.json(404,{code:"-ver01", message:"Invalid API version"});
	}
	
}

