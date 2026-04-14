"use strict";

$(document).ready(function() {
		
	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);

	showNavbar();
	showYearPlan();		
});