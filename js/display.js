function showNotdienstUmkreis(location_id, range, day) {

	day = getParam(day, moment());
	var main = $('main');
	
	main.empty();
	/*
	$('<h3>',).text(apo_name + ' – ' + apo_ort).appendTo(main);
	*/
	/*{'class':'display-2'}*/
	
	var box = $('<div>', {'class':'container'}).appendTo($('<div>', {'class':'jumbotron'}).appendTo(main));
		
	$('<h1>',/*{'class':'display-3'}*/).text('Notdienst am ' + day.format('dddd, DD.MM.YYYY')).appendTo(box);
	getNotdienstUmkreis(location_id, range, day).done(function(res) {
			var row = $('<div>', {'class':'row'}).appendTo(box);
			for(let e of res) {
				var elem = $('<div>', {'class':'col apobox'}).appendTo(row);
				$('<h3>').text(e.name).appendTo(elem);
				$('<address>').html(e.street + '<br /><strong>'+e.location+'</strong>').appendTo(elem);
				$('<div>', {'class':'phone'}).text('Telefon: ' + e.tel).appendTo(elem);
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