"use strict";

function showNavbar(main_nav) {
	
	var main_nav = $('#main_nav > div > ul');
	
	if(typeof main_nav != 'object') return false;

	add_navbar_item(main_nav, 'Jahresplan', false, {'href':'jahresplan.php'});
	
	add_navbar_item(main_nav, 'Display-Anzeige', false, {'href':'display.php'});
		
	for(let loc of locations) {		
		add_navbar_item(main_nav,'Notdienst '+loc['location'], false, {'href':'index.php?loc='+loc['id']});
	}	
}

function showYearPlan() {
	
	const today = moment();
	const year = today.year();
	
	var box = activateBox('jahresplan_'+year, 'Notdienstplan '+year, true, null, true);
	
	const tabelle = $('<table>', {'id':'notdienstplan_'+year, 'class':'table kalender'}).appendTo(box);
	const thead = $('<thead>').appendTo(tabelle);
	const trh = $('<tr>').appendTo(thead);
	const monate = moment.monthsShort();
	for(let i = 0; i < monate.length; i++) {
		$('<th>').appendTo(trh).append($('<div>', {'class':'cell_content'}).append(monate[i])).click(function() {
				toggleStundenDarstellung();
				return false;
		});
	}
	
	const tbody = $('<tbody>').appendTo(tabelle);
	const tfoot = $('<tfoot>').appendTo(tabelle);

	const holidays = getHolidaysByYear(year, katholic);
	
	let holidays_str = [];
	for(let i = 0; i < holidays.length; ++i) {
		holidays_str.push(holidays[i].date.format('YYYY-MM-DD'));
	}
	
	const hotdays = getHotdaysByYear(year);
	
	let hotdays_str = [];
	for(let i = 0; i < hotdays.length; ++i) {
		hotdays_str.push(hotdays[i].date.format('YYYY-MM-DD'));
	}
	
	//const weeks_in_year = moment([year,6]).isoWeeksInYear();
	
	for(let j = 1; j < 32; j++) {
		let trd = $('<tr>').appendTo(tbody);
		let jstr = j.toString().padStart(2,'0');
		for(let i = 0; i < monate.length; i++) {
			let istr = (i+1).toString().padStart(2,'0');
			if(j > moment([year,i]).daysInMonth()) {
				$('<td>',{'class':'not_a_day'}).appendTo(trd);				
			} else {
				let cur_day = moment([year, i, j]);
				let cd_str = cur_day.format('YYYY-MM-DD');
				let cd_iso = cur_day.isoWeek();
				let cd_name = cur_day.format('dd');
				let cd_class = cd_iso % 2 ? 'odd_week' : 'even_week';
				if((i < 1 && cd_iso > 5) || (i > 10 && cd_iso < 10)) {
					cd_class = 'week_other_year';
				}
				let td = $('<td>',{'id':'kal_'+cd_str, 'class':cd_class}).appendTo(trd);
				let div = $('<div>', {'class':'date_content'}).appendTo(td);
				$('<div>', {'class':'nd_content'}).appendTo(td);
				let dow_class = 'dow_' + cd_name.toLowerCase();
				let day = $('<span>',{'class':'dom_number ' + dow_class}).appendTo(div).append(jstr);
				let dname = $('<span>',{'class':'dow_name ' + dow_class}).appendTo(div).append(cd_name);
				td.addClass(dow_class);
				let hday = holidays_str.indexOf(cd_str);
				if(hday !== -1) {
					td.addClass('holiday');
					div.attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',holidays[hday].desc).tooltip();
				}
				if(hotdays_str.includes(cd_str)) {
					let hday = hotdays_str.indexOf(cd_str);
					td.addClass('hotday');
					div.attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',hotdays[hday].desc).tooltip();
				}
				if(today.isSame(cur_day, 'day')) {
					td.addClass('heute');
				}
			}
			
		}
	}
	
	const legende = $('<div>', {'id':'notdienstplan_legende', 'class':'legende'}).appendTo(box);
	$('<div>', {'class':'clearfix'}).appendTo(box);
	
	console.log("Lade notdienste.json ..");
	
	$.getJSON(nd_json_url).done(function(data) {
			console.log("notdienste.json geladen");
			$.each(data, function(data_key, data_value) {
					const apo = getSomethingBySomeKey(locations, 'name', data_key);
					
					const apo_id = apo['id'];
					const apo_c = apo['c'];
					
					console.log(apo_id + ": " + apo['name']);
					debug2box(data_value, data_key);
					
										
					for(let i = 0; i < data_value.length; i++) {
						console.log(apo_id + " Dienst-Tag: " + data_value[i]);
						let day = data_value[i].split('.');
						let day_id = 'kal_' + day[2] + '-' + day[1] + '-' + day[0];
						let day_cell = $('#'+day_id);
						if(day_cell) {
							console.log('Schreibe Notdienstinfo in Tageszelle '+day_id);
						$('<span>',{'class':'nd_tag nd_'+apo_id}).appendTo($('.nd_content', day_cell)).append(apo_c).attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',apo['location'] + ', ' + data_value[i]).tooltip();
						}
					}
					
					$('<div>', {'id':'legende_' + apo_id, 'class':'legende_entry nd_' + apo_id}).appendTo(legende).append('<span class="legende_id">' + apo_c + '</span>: ' + apo['name'] + ' (' + data_value.length + ' Dienste)');
			});
	});	
}

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

    $('<h2>', {'id':'timeinfo_'+location_id, 'class':'subheader d-none d-print-block'}).appendTo(box);
    $('<h2>', {'id':'apoinfo_'+location_id, 'class':'subheader d-print-none'}).append('für '+apo_name).appendTo(box);
    
    var timeofbegin;
	
	const container = $('<div>', {'id':'notdienstliste_'+location_id, 'class':'notdienstcontainer'}).appendTo(box);
	
	const footer = $('<div>', {'id':'notdienstfooter_'+location_id, 'class':'footer'}).appendTo(box);
	$('<div>',{'class':'stand float-right'}).append('Stand '+today.format('DD.MM.YYYY')).appendTo(footer);
	$('<div>',{'class':'apoinfo float-left'}).append('<strong>'+apo_name+'</strong>, '+ apo['plz'] + ' ' + apo_ort).appendTo(footer);
	

	getNotdienstData(location_id).done(function(res) {
			
			let nday = {};
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
				
				if(typeof timeofbegin != 'string') {
					timeofbegin = e['from'].format('HH:mm');
					$('#'+'timeinfo_'+location_id).append('Notdienstbereitschaft von ' + timeofbegin + ' Uhr bis ' + timeofbegin + ' Uhr des darauffolgenden Tages'); 
				}
				
				var ndtag = e['from'].format('YYYYMMDD');
				var tag_id = 'notdiensttag_'+location_id+'_'+ndtag;
				var tag = $('#'+tag_id);				
											
				var row_id = 'row_'+tag_id;
				var row = $('#'+row_id);
				/*
				if(!tag.length) {
					tag = $('<div>',{'id':tag_id,'class':'notdiensttag'}).appendTo(container);
					//$('<h2>').append(e['from'].format('dddd, DD. MMMM YYYY')).appendTo(tag);			
				}
			*/
				if(!row.length) {
					row = $('<div>',{'id':row_id, 'class':'row notdiensttag'}).appendTo(container);
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
