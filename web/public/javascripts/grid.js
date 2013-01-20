$(document).ready(function () {
	'use strict';
	
	jQuery("#grid_table").jqGrid({ 
		datatype: "local", 
		height: 400, 
		colNames:['Inv No','Date', 'Client', 'Amount','Tax','Total','Date','Notes'], 
		colModel:[ {name:'id',index:'id', width:60, sorttype:"int"}, 
		           {name:'invdate',index:'invdate', width:90, sorttype:"date"}, 
		           {name:'name',index:'name', width:100}, 
		           {name:'amount',index:'amount', width:80, align:"right",sorttype:"float"}, 
		           {name:'tax',index:'tax', width:80, align:"right",sorttype:"float"}, 
		           {name:'total',index:'total', width:80,align:"right",sorttype:"float"}, 
		           {name:'invdate',index:'invdate', width:90, sorttype:"date"}, 
		           {name:'note',index:'note', width:150, sortable:false} ], 
		multiselect: true, 
		caption: "Manipulating Array Data" 
	});
});
	