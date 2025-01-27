"use strict";

function showNotdienstplan(location_id, max_n, max_d) {
	
	max_n = getParam(max_n, 3);
	max_d = getParam(max_d, 7);
	const today = moment();
	console.log('Heute ist '+today.format('dddd, DD.MM.YYYY'));
	const maxday = moment(today).add(max_d - 1, 'days').hours(8).minutes(30).seconds(0);
	console.log('Heute ist wiederum der '+today.format('dddd, DD.MM.YYYY'));
	console.log('Anzeigt werden sollen max. '+max_n+' Apotheken und max. '+max_d+' Tage');
	console.log('Also max bis '+maxday.format('dddd, DD.MM.YYYY'));
	
	var box = activateBox('notdienstplan_'+location_id, 'Notdienstbereite Apotheken', true);
	
	const apo = getSomethingById(locations, location_id);
	const apo_name = apo['name'];
	const apo_ort = apo['location'];
	
	$('<h2>', {'class':'subheader d-print-none'}).append('für '+apo_name).appendTo(box);
			
	const container = $('<div>', {'id':'notdienstliste_'+location_id, 'class':'notdienstcontainer'}).appendTo(box);
	
	const footer = $('<div>', {'id':'notdienstfooter_'+location_id, 'class':'footer container'}).appendTo(box);
	$('<div>',{'class':'stand float-right'}).append('Stand '+today.format('DD.MM.YYYY')).appendTo(footer);
	$('<div>',{'class':'apoinfo float-left'}).append('<strong>'+apo_name+'</strong>, '+ apo['plz'] + ' ' + apo_ort).appendTo(footer);
	

	getNotdienstData(location_id).done(function(res) {
			
			let nday = [];
			let liste = res['entries'];
			let lat = res['lat'];
			let lon = res['lon'];
			
			
			for(let e of liste) {
				
				if(e['from'].isAfter(maxday)) {
					console.log(e['from'].format('DD.MM.YYYY')+' liegt NACH dem '+maxday.format('DD.MM.YYYY')); 
					continue;				
				}
				
				var ndtag = e['from'].format('YYYYMMDD');
				var tag_id = 'notdiensttag_'+location_id+'_'+ndtag;
				var tag = $('#'+tag_id);				
								
				if(!tag.length) {
					tag = $('<div>',{'id':tag_id,'class':'notdiensttag container'}).appendTo(container);
					$('<h2>').append(e['from'].format('dddd, DD. MMMM YYYY')).appendTo(tag);
				}
				
				var row_id = 'row_'+tag_id;
				var row = $('#'+row_id);
				
				if(!row.length) {
					row = $('<div>',{'id':row_id, 'class':'row notdiensteintrag'}).appendTo(tag);
				}
				
				if(typeof nday[ndtag] == 'undefined') {
					nday[ndtag] = 0;
				}
				
				nday[ndtag] = nday[ndtag] + 1;
				
				if(nday[ndtag] > max_n) {
					//console.log('Am '+ndtag+' Nr. '+nday[ndtag]+' von '+max_n+' > Ist zuviel..');
					continue;
				} else {
					//console.log('Am '+ndtag+' Nr. '+nday[ndtag]+' von '+max_n+' > Ist OK.');				
				}
				
				var abox = apobox(e,lat,lon).addClass('col').appendTo(row);
				setDienstbereit(abox, e, apo_name, apo_ort);
			}			
	});
}

$(document).ready(function() {

	var main_nav = $('#main_nav > div > ul');
		
	for(let loc of locations) {
		
		add_navbar_item(main_nav,'Notdienst '+loc['id']).click(function() {
			showNotdienstplan(loc['id']);	
			return false;
		});
	}	
	
	showNotdienstplan(apo_id);
		
});