
module.exports = {	

	home : function(req,res){
		res.render('page',{title:"Hello Node"});
	},
	module : function(req,res){
		
		var go ={ 
			url:'/api/grid/menu',
			datatype: "json", 
			mtype:'POST',
			sortable:true,
			sortname: 'id',
			rowNum:100,
			recordpos: 'left', 
			height: 450, 
			width: 'auto',
			jsonReader: {
			  repeatitems: false,
			  root: "rows"
			},
			colNames:['ID','Menu Name', 'Is Expanded?', 'Level','Is Leaf?','Is Loaded?','Index','Parent','Url'], 
			colModel:[ 
			 {name:'id',index:'id', width:120, hidden:true, editable: false}, 
			 {name:'menu',index:'menu', width:150, editable: true, edittype:'text',editoptions:{dataInit:"_wac"}},
			 {name:'expanded',index:'expanded', width:80, editable: true, edittype:'select',editoptions:{value:"true:true;false:false"}},
			 {name:'level',index:'level', width:80, editable: true},
			 {name:'isLeaf',index:'isLeaf', width:80, editable: true, edittype:'select',editoptions:{value:"true:true;false:false"}},
			 {name:'loaded',index:'loaded', width:80, editable: true, edittype:'select',editoptions:{value:"true:true;false:false"}},
			 {name:'index',index:'index', width:80, editable: true},
			 {name:'parent',index:'parent', width:80, editable: true},
			 {name:'url',index:'url', width:80, editable: true}
			 ], 
			multiselect: true,  
			gridview: true, 
			shrinkToFit:false,
			viewrecords:true,
			emptyrecords:"No records yet",
			rownumbers: true,
			caption: "Menu Records",
			pager: '#grid_pager',
		};
		
		res.render('module',{module:'menu',go:JSON.stringify(go)});
	}
};