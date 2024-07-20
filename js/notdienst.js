function showNotdienstUmkreis(location_id, range, day) {

	day = getParam(day, moment());

	var box = activateBox('notdienst_umkreis_'+location_id);
	$('<h1>').text('Notdienst am '+day.format('dddd, DD.MM.YYYY')).appendTo(box);
	getNotdienstUmkreis(location_id, range, day).done(function(res) {
			var ul = $('<ul>').appendTo(box);
			for(let e of res) {
				var li = $('<li>').appendTo(ul);
				$('<strong>').text(e.name).appendTo(li);
				li.append('<br />'+e.street+', '+e.location+'<br />'+e.tel);
			}	
	});
}

$(document).ready(function() {

	var main_nav = $('#main_nav > div > ul');
		
	add_navbar_item(main_nav,'Heute Notdienst').click(function() {
			var box = activateBox('notdienstplan_today','Notdienstplan heute');
			for(let loc of locations) {
				getApoToday(loc).done(function(data) {
						$('<h3>').append(loc['id']).appendTo(box);
						$('<div>', {'id':'apo_'+loc['id']}).text(data).appendTo(box);
				});
			}
			return false;
	});	
	
	
	for(let loc of locations) {
		
		add_navbar_item(main_nav,'Notdienst '+loc['id']).click(function() {
			showNotdienstUmkreis(loc['id']);	
			return false;
		});
	}		
		
});