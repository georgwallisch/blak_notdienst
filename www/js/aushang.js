"use strict";

$(document).ready(function() {
		
	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);

	showNavbar();
	
	const urlParams = new URLSearchParams(window.location.search);
	
	if(urlParams.has('loc')) {
		showNotdienstplan(urlParams.get('loc'));
	} else {
		getApoID(showNotdienstplan);
	}
		
});