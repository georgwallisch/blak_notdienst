"use strict";

$(document).ready(function() {
		
	const main = $('#mainbox');
	main.empty();
	$('<div>',{'id':'debugbox','class':'container','role':'note'}).insertAfter(main);
/*
	var main_nav = $('#main_nav > div > ul');
*/

	showYearPlan();		
});