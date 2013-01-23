$(document).ready(function () {
	'use strict';
	var grid, nav_menu={
					"response": $.cookie("menu") || {}
	};


	grid = jQuery("#nav_menu");
	grid.jqGrid({
		url: "tree.xml",
		datastr: nav_menu,
		datatype: "jsonstring",
		width:250,
		height: 450,
		loadui: "disable",
		colNames: [" ","url"],
		colModel: [
		           {name: "elementName", width:250, resizable: false, sortable:false},
			{name: "url",width:1,hidden:true}
		],
		treeGrid: true,
		treeGridModel: "adjacency",
		caption: "Navigation Menu",
		ExpandColumn: "elementName",
		pager: '#nav_pager',
		pgbuttons: false,
		viewrecords: false,
		pgtext: null,
		treeIcons: {leaf:'ui-icon-document-b'},
		jsonReader: {
			repeatitems: false,
			root: "response"
		},
		onSelectRow: function(rowid) {
			var treedata = $(this).jqGrid('getRowData',rowid);
			if(treedata.isLeaf=="true") {
				if(treedata.url == '/') window.location.href= treedata.url;
				$("#content").html("");
				$("#content").load(treedata.url);
			}
		}
	});
	
	$("#nav_menu").jqGrid('gridResize', { minWidth: 50, minHeight: 500, maxHeight:800, maxWidth:250 });
	
});
	