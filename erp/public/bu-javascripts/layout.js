$(document).ready(function () {
	'use strict';
	
	function ac(elem, url) {
		setTimeout(function () {
			$(elem).autocomplete({
					source: url+'?param='+ $(elem).attr('id'),
					minLength: 2,
					focus: function( event, ui ) {
						$(elem).val(ui.item.value);
						return false;
					},
					select: function (event, ui) {
						$(elem).val(ui.item.id);
						$(elem).trigger('change');
						return false;
					}
			}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
				return $( "<li>" )
				.append( "<a>Id:" + item.id + "<br>Value:" + item.value + "</a>" )
				.appendTo( ul );
		    };
		}, 50);
	}
	function cs(elem,target,url){
		$(elem).chainSelect("#"+target,url);
		$(elem).trigger('change');
	}
	function image(cellvalue,options,rowObject){
		
		return "<img src='"+ cellvalue +"' width='50' height='60'></img>";
	}
	function link(cellvalue,options,rowObject){
		
		return "<a href='"+ cellvalue +"' >"+ cellvalue.substring(cellvalue.lastIndexOf("/") + 1)+"</a>";
	}
	
	function uimage(cellvalue, options, cell){
		
		return $('img', cell).attr('src');
	}
	function ulink(cellvalue, options, cell){
		
		return $('a', cell).attr('href');
	}
	
});
	