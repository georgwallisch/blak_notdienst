"use strict";

function showNotdiensteStandort(location_id, day, max) {

	const today = moment();
	max = getParam(max, 3);
	day = getParam(day, today); 
	
	console.log('Heute ist '+today.format('dddd, DD.MM.YYYY'));
	
	const day_id = day.format('YYYYMMDD');
	const apo = getSomethingById(locations, location_id);
	const apo_name = apo['name'];
	const apo_ort = apo['location'];
	
	var box = activateBox('notdienstbox_'+day_id,'Notdienstbereite Apotheken am '+day.format('dddd, DD.MM.YYYY'), true);
	
	box.addClass('jumbotron');
/*	
	if(typeof nd_qr != 'undefined') {
		$('<img>', {'src':nd_qr, 'class':'float-right', 'width':'120', 'height':'120'}).appendTo(box);
	}
*/		
	
	getNotdienstData(location_id).done(function(res) {
			
			debug2box(res,'NotdienstData',4);
			var endofduty;					
			var row = $('<div>', {'class':'row'}).appendTo(box);
			
			console.log('Ergebnistyp ist ' + res['type']);
			
			let liste = res['entries'];
			let lat = res['lat'];
			let lon = res['lon'];
			let n = 0;
			var dist;
						
			for(let e of liste) {

				if(day.isBetween(e['from'],e['to'])) {
					if(typeof endofduty == 'undefined') {
						endofduty = e['to'];
					}
					n = n + 1;
					var abox = apobox(e,lat,lon).addClass('col').appendTo(row);
					setDienstbereit(abox, e, apo_name, apo_ort);
				} else {
					console.log(e['name'] + ' ' + e['location'] + ' hat heute nicht Dienst.');
				}
				
				if(n >= max) break; 
			}
			
			$('<h5>').append('bis '+endofduty.format('dddd, DD.MM.YYYY HH:mm [Uhr]')).insertBefore(row);
			var ttl = endofduty.format('x') - moment().format('x');
			setTimeout(function () {
				box.remove();	
			}, ttl);
			setTimeout(function () {
				showNotdiensteStandort(location_id, day.add(1, 'days'), max);		
			}, ttl - 30*60*1000);
	});
	
}

function showNotdienstplan(apo_id) {
	
	const apo = getSomethingById(locations, apo_id);

	$('body').addClass('loc_' + apo_id);
	const headline = $('#headline').addClass('loc_' + apo_id);
	const apo_info = $('<div>', {'class':'float-right'}).appendTo(headline);
		
	$('<strong>').text(apo['name']).appendTo(apo_info);
	$('<address>').html(apo['street'] + '<br />' + apo['plz']+'&nbsp;' + apo['location']).appendTo(apo_info);
	
	const datumElem = $('<div>',{'id':'DatumUhrzeit', 'class':'DatumUhrzeitInfo'}).appendTo(apo_info);
	
	var datumsanzeige = setInterval(function() {
		var d = moment().format('HH:mm [Uhr]'); //format('dddd, DD.MM.YYYY HH:mm');
		datumElem.text(d);		
	}, 3000);

	showNotdiensteStandort(apo_id);
	const footer = $('footer');
	const disdiv = $('<div>', {'id':'disclaimer', 'class':'alert alert-dark', 'role':'alert'}).appendTo(footer);
	
	if(typeof disclaimer_qr != 'undefined') {
		$('<img>', {'src':disclaimer_qr, 'class':'float-right', 'width':'85', 'height':'85'}).appendTo(disdiv);
	}
	
	$('<p>').appendTo(disdiv).text(disclaimer);
}

$(document).ready(function() {

	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);
	
	getApoID(showNotdienstplan);
	
});