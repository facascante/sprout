$(document).ready(function () {
	'use strict';
	var grid, nav_menu={
					"response": {}
	};

	$('<table id="nav_menu"></table>').appendTo('#menu');

			grid = jQuery("#nav_menu");
			grid.jqGrid({
					datastr: nav_menu,
					datatype: "jsonstring",
					height: "50%",
					loadui: "disable",
					colNames: ["Transaction","url"],
					colModel: [
						{name: "elementName", width:250, resizable: false},
						{name: "url",width:1,hidden:true}
					],
					treeGrid: true,
					treeGridModel: "adjacency",
					caption: "Choose Your Transaction",
					ExpandColumn: "elementName",
					rowNum: 10000,
					width:248,
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
});
	