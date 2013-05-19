var PDFDocument = require('pdfkit');
var pdf = {

		pageSetting : function(options){
			
			var doc = new PDFDocument({
				size: options.size || 'letter',
				layout: options.layout || 'portrait',
				margin : options.margin || {
					top:50,
					left:50,
					bottom:50,
					width:50
				},
				info: options.info || {
					Title:'DR-00000000001',
					Subject:'DR-00000000001',
					Author:'Chito Cascante'
				}
			});
			return doc;
			
		},
		pageHeader : function(doc,drinfo){
			/***      Start Header     ***/
			doc.fontSize(14);
			doc.font('Courier-Bold');
			doc.text(drinfo.gen.drno,475,72,{align:'right'});
			doc.moveDown(0);
			doc.font('Courier');
			doc.fontSize(10);
			doc.text(drinfo.gen.delivery_created_at,475);
			doc.moveDown(0);
			doc.font('Courier-Bold');
			doc.fontSize(10);
			doc.text(drinfo.gen.customer + (drinfo.gen.branch? " - " + drinfo.gen.branch : ""),40,105,{width:240,indent:40});
			doc.text(drinfo.gen.customer + (drinfo.gen.branch? " - " + drinfo.gen.branch : ""),310,105,{width:240,indent:40});
			doc.moveDown(0);
			doc.font('Courier');
			doc.fontSize(10);
			var y = doc.y;
			doc.text(drinfo.gen.b_address,40,doc.y,{width:240,align:'justify'});
			doc.text(drinfo.gen.s_address,310,y,{width:240,align:'justify'});
			doc.moveDown(0);
			doc.text(drinfo.gen.sono,65,175);
			doc.moveDown(0);
			y = doc.y;
			doc.text(drinfo.gen.term,65);
			doc.text(drinfo.gen.ddate,210,y);
			doc.text(drinfo.gen.shipping,360,y);
			doc.text(drinfo.gen.se,500,y);
			/***      Stop Header     ***/
			
			doc.font('Courier-Bold');
			doc.text("CODE",40,243);
			doc.text("PRODUCT",115,243);
			doc.text("DESCRIPTION",200,243);
			doc.text("QTY",325,243);
			doc.text("UOM",365,243);
			doc.text("PRICE",415,243);
			doc.text("DISCOUNT",465,243);
			doc.text("AMOUNT",530,243);
			doc.moveDown(2);
			return doc;
		},
		pageFooter : function(doc,drinfo){
			/***      Start Footer     ***/
			doc.text(drinfo.detail.length,130,667);
			doc.text(drinfo.detail.length,330,667);
			doc.text(drinfo.gen.ttl_sales,500,688);
			doc.text(drinfo.gen.ttl_discount,500);
			doc.text(drinfo.gen.ttl_vat,500);
			doc.text(drinfo.gen.ttl_net,500);
			doc.text(drinfo.gen.order_created_by,50,750);
			doc.text(drinfo.gen.delivery_created_by,400,750);
			return doc;
		}
};

module.exports.print = function(drinfo,result){
	var doc = pdf.pageSetting({info:{
		Title:drinfo.gen.drno,
		Subject:drinfo.gen.drno,
		Author:drinfo.gen.delivery_created_by
	}});
	doc = pdf.pageHeader(doc,drinfo);
	doc = pdf.pageFooter(doc,drinfo);
	doc.y = 275;
	for(var i in drinfo.detail){
		var y= doc.y;
		doc.font('Courier');
		doc.text(drinfo.detail[i].code,40,y,{width:70});
		doc.text(drinfo.detail[i].name,115,y,{width:80});
		doc.text(drinfo.detail[i].description,200,y,{width:115});
		doc.text(drinfo.detail[i].quantity,325,y,{width:35});
		doc.text(drinfo.detail[i].uom,365,y,{width:50});
		doc.text(drinfo.detail[i].pprice,415,y,{width:40});
		doc.text(drinfo.detail[i].tdiscount,465,y,{width:60});
		doc.text(drinfo.detail[i].total,530,y,{width:60});
		doc.moveDown(0.5);
		if(doc.y >= 640){
			doc.addPage();
			doc = pdf.pageHeader(doc,drinfo);
			doc = pdf.pageFooter(doc,drinfo);
			doc.y = 275;
			
		}
	}
	var filename = __dirname.replace('/views/print','/public/erp_documents/delivery/')+drinfo.gen.drno+'.pdf';
	doc.write(filename,function(){
		setTimeout(function () { 
			result(null,'/erp_documents/delivery/'+drinfo.gen.drno+'.pdf');
		},500);
	});
	
};
