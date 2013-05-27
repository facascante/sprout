$(document).ready(function(){	
	
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