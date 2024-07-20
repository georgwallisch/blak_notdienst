function showNotdienstUmkreis(location_id, range, day) {

	day = getParam(day, moment());
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
	$('<h1>').text('Notdienstbereit Apotheken:').appendTo(box);
	
	getNotdienstUmkreis(location_id, range, day).done(function(res) {
			var row = $('<div>', {'class':'row'}).appendTo(box);
			for(let e of res) {
				var elem = $('<div>', {'class':'col apobox'}).appendTo(row);
				$('<h3>').text(e.name).appendTo(elem);
				$('<address>').html(e.street + '<br /><strong>'+e.location+'</strong>').appendTo(elem);
				$('<div>', {'class':'phone'}).text('Telefon: ' + e.tel).appendTo(elem);
				$('<div>', {'class':'servicetime'}).text('Dienstbereit: ' + e.servicetime).appendTo(elem);
				if(apo_name == e.name && e.location.search(apo_ort) >= 0) {
					elem.addClass('dienstbereit');
				}
			}	
	});
	
}

$(document).ready(function() {
/*	
	if(typeof apo_id == 'undefined') {
		var apo_id = 'KEM';
	}	
*/	
	$('body').addClass('loc_' + apo_id);
	$('#headline').addClass('loc_' + apo_id);

	var heute = moment().format('x');
	var morgen = toMS(moment().add(1, 'days'),8);
	
	var refresher;
		
	showNotdienstUmkreis(apo_id);
	
	setTimeout(function () {
			showNotdienstUmkreis(apo_id);
		
			refresher = setInterval(function () {
					showNotdienstUmkreis(apo_id);
			},1000*24*3600);
	}, (morgen-heute));
		
			
});