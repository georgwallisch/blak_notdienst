"use strict";

function showNotdienstStandort(location_id, max) {

	max = getParam(max, 3);
	var main = $('main');
	
	main.empty();
	/*
	$('<h3>',).text(apo_name + ' – ' + apo_ort).appendTo(main);
	*/
	/*{'class':'display-2'}*/
	
	
	var datumElem =	$('<h1>',{'id':'DatumUhrzeit', 'class':'DatumUhrzeit'}).appendTo(main);
		
	var datumsanzeige = setInterval(function() {
		var d = moment().format('dddd, DD.MM.YYYY HH:mm');
		datumElem.text(d);		
	}, 3000);	
	
	var box = $('<div>', {'class':'container'}).appendTo($('<div>', {'class':'jumbotron'}).appendTo(main));
	/*{'class':'display-3'}*/
	/* $('<h1>').text('Notdienst am ' + day.format('dddd, DD.MM.YYYY')).appendTo(box); */
	
	if(typeof nd_qr != 'undefined') {
		$('<img>', {'src':nd_qr, 'class':'float-right', 'width':'120', 'height':'120'}).appendTo(box);
	}
	
	$('<h1>').text('Notdienstbereite Apotheken:').appendTo(box);

	getNotdienstData(location_id).done(function(res) {
			
			debug2box(res,'NotdienstData',4);
						
			let heute = moment();
	
			var row = $('<div>', {'class':'row'}).appendTo(box);
			
			console.log('Ergebnistyp ist ' + res['type']);
			
			let liste = res['entries'];
			let lat = res['lat'];
			let lon = res['lon'];
			let n = 0;
			var dist;
						
			for(let e of liste) {

				if(heute.isBetween(e['from'],e['to'])) {
					n = n + 1;
					var elem = $('<div>', {'class':'col apobox'}).appendTo(row);
					$('<h3>').text(e['name']).appendTo(elem);
					$('<address>').html(e['street'] + '<br /><strong>' + e['zipCode'] + '&nbsp;' + e['location'] + '</strong>').appendTo(elem);
					$('<div>', {'class':'phone'}).text('Telefon: ' + e['phone']).appendTo(elem);
					if(apo_name == e['name'] && e['location'] == apo_ort) {
						elem.addClass('dienstbereit');
					}
					dist = calcDistance(lat, lon, e['lat'], e['lon']);
					if(dist > 3.0) {
						$('<div>', {'class':'distance'}).text('Entfernung ca. ' + Math.round(dist) + ' km').appendTo(elem);
					}
					//console.log('Entfernung zur ' + e['name'] + ' ist ' + dist + ' km');

				} else {
					console.log(e['name'] + ' ' + e['location'] + ' hat heute nicht dienst.');
				}
				
				if(n >= max) break; 
			}
	});

	var disdiv = $('<div>', {'id':'disclaimer', 'class':'alert alert-dark', 'role':'alert'}).appendTo(main);
	
	if(typeof disclaimer_qr != 'undefined') {
		$('<img>', {'src':disclaimer_qr, 'class':'float-right', 'width':'85', 'height':'85'}).appendTo(disdiv);
	}
	
	$('<p>').appendTo(disdiv).text(disclaimer);
	
}

$(document).ready(function() {
/*	
	if(typeof apo_id == 'undefined') {
		var apo_id = 'KEM';
	}	
*/	
	const apo = getSomethingById(locations, apo_id);

	$('body').addClass('loc_' + apo_id);
	const headline = $('#headline').addClass('loc_' + apo_id);
	const apo_info = $('<div>', {'class':'float-right'}).appendTo(headline);
	
	$('<strong>').text(apo['name']).appendTo(apo_info);
	$('<address>').html(apo['street'] + '<br />' + apo['location']).appendTo(apo_info);
	
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter('#mainbox');


	var heute = moment().format('x');
	var morgen = toMS(moment().add(1, 'days'),8);
	
	var refresher;
		
	showNotdienstStandort(apo_id);
	
	setTimeout(function () {
			showNotdienstStandort(apo_id);
		
			refresher = setInterval(function () {
					showNotdienstStandort(apo_id);
			},1000*24*3600);
	}, (morgen-heute));
		
			
});