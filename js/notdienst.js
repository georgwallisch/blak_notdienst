"use strict";

function showNotdienstplan(location_id, max_n, max_d) {
	
	max_n = getParam(max_n, 3);
	max_d = getParam(max_d, 8);
	const today = moment();
	console.log('Heute ist '+today.format('dddd, DD.MM.YYYY'));
	const maxday = moment(today).add(max_d - 1, 'days').hours(8).minutes(30).seconds(0);
	console.log('Anzeigt werden sollen max. '+max_n+' Apotheken und max. '+max_d+' Tage');
	console.log('Also max bis '+maxday.format('dddd, DD.MM.YYYY'));
	
	var box = activateBox('notdienstplan_'+location_id, 'Notdienstbereite Apotheken', true, null, true);
	
	const apo = getSomethingById(locations, location_id);
	const apo_name = apo['name'];
	const apo_ort = apo['location'];
	
	$('<button>', {'type':'button','class':'btn btn-primary float-right d-print-none'}).append('Plan drucken').appendTo(box).click(function(){
			window.print();
    });
    
    $('<h2>', {'class':'subheader d-print-none'}).append('für '+apo_name).appendTo(box);
	
	const container = $('<div>', {'id':'notdienstliste_'+location_id, 'class':'notdienstcontainer'}).appendTo(box);
	
	const footer = $('<div>', {'id':'notdienstfooter_'+location_id, 'class':'footer'}).appendTo(box);
	$('<div>',{'class':'stand float-right'}).append('Stand '+today.format('DD.MM.YYYY')).appendTo(footer);
	$('<div>',{'class':'apoinfo float-left'}).append('<strong>'+apo_name+'</strong>, '+ apo['plz'] + ' ' + apo_ort).appendTo(footer);
	

	getNotdienstData(location_id).done(function(res) {
			
			let nday = [];
			let liste = res['entries'];
			let lat = res['lat'];
			let lon = res['lon'];
			
			debug2box(liste,'Notdienstliste',3);
			
			for(let e of liste) {
				
				if(e['from'].isAfter(maxday)) {
					console.log(e['from'].format('DD.MM.YYYY')+' liegt NACH dem '+maxday.format('DD.MM.YYYY')); 
					continue;				
				}
				
				if(e['to'].isBefore(today)) {
					console.log(e['to'].format('DD.MM.YYYY')+' liegt in der Vergangenheit!'); 
					continue;				
				}
				
				var ndtag = e['from'].format('YYYYMMDD');
				var tag_id = 'notdiensttag_'+location_id+'_'+ndtag;
				var tag = $('#'+tag_id);				
											
				var row_id = 'row_'+tag_id;
				var row = $('#'+row_id);
				
				if(!tag.length) {
					tag = $('<div>',{'id':tag_id,'class':'notdiensttag'}).appendTo(container);
					//$('<h2>').append(e['from'].format('dddd, DD. MMMM YYYY')).appendTo(tag);			
				}
				
				if(!row.length) {
					row = $('<div>',{'id':row_id, 'class':'row notdiensteintrag'}).appendTo(tag);
					$('<h3>').append(e['from'].format('[<span class="dayofweek">]dddd[</span>] [<span class="dayofmonth">]D.[</span>] [<span class="month">]MMM[</span>] [<span class="year">]YYYY[</span>]')).appendTo($('<div>',{'class':'col-2 notdienstdatum'}).appendTo(row));
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
		
	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);

	var main_nav = $('#main_nav > div > ul');
		
	for(let loc of locations) {
		
		add_navbar_item(main_nav,'Notdienst '+loc['location']).click(function() {
			showNotdienstplan(loc['id']);	
			return false;
		});
	}	
	
	getApoID(showNotdienstplan);
		
});