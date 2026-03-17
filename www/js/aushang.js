"use strict";

$(document).ready(function() {
		
	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);

	var main_nav = $('#main_nav > div > ul');
	
	add_navbar_item(main_nav,'Jahresplan').click(function() {
			return false;
	});
		
	for(let loc of locations) {
		
		add_navbar_item(main_nav,'Notdienst '+loc['location']).click(function() {
			showNotdienstplan(loc['id']);	
			return false;
		});
	}	
	
	getApoID(showNotdienstplan);
		
});