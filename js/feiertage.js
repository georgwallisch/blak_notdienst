"use strict";

var HolidaysByYearCached = [];
var HotdaysByYearCached = [];

function getEasterByYear(year) {
	var a = year % 19;
	var b = Math.floor(year / 100);
	var c = year % 100;
	var d = Math.floor(b / 4);
	var e = b % 4;
	var f = Math.floor((b + 8) / 25);
	var g = Math.floor((b - f + 1) / 3);
	var h = (19*a + b - d - g + 15) % 30;
	var i = Math.floor(c / 4);
	var k = c % 4;
	var l = (32 + 2*e + 2*i - h - k) % 7;
	var m = Math.floor((a + 11*h + 22*l) / 451);
	var n = Math.floor((h + l - 7*m + 114) / 31);
	var p = (h + l - 7*m + 114) % 31;
	
	var easter = new Date(year, n - 1, p + 1, 12, 0);
	
	return easter;
}

function parseYearToInt(xYear) {
	
	var today = new Date();
	var year = today.getFullYear();
	
	if (typeof xYear == 'number') {
		year = xYear;
	} else if (typeof xYear == 'string') {
		year = parseInt(xYear);	
	} else if (typeof xYear == 'object' && typeof xYear.year == 'function') {
		year = xYear.year();			
	}
	
	return year;
}

function getHolidaysByYear(year, kath) {
	
	year = parseYearToInt(year);
	
	if(typeof kath == 'undefined') {
		kath = false;			
	}
	
	for(var i = 0; i < HolidaysByYearCached.length; ++i) {
		if(year == HolidaysByYearCached[i].year) {
			return HolidaysByYearCached[i].days;
		}
	}
	
	var days = [];
	var ostern = moment(getEasterByYear(year));
	
	days.push({'date':moment([year, 0, 1, 12]), 'desc':'Neujahr'});
	days.push({'date':moment([year, 0, 6, 12]), 'desc':'Hl. Drei König'});
	days.push({'date':moment(ostern).subtract(2, 'd'), 'desc':'Karfreitag'});
	days.push({'date':moment(ostern), 'desc':'Ostern'});
	days.push({'date':moment(ostern).add(1, 'd'), 'desc':'Ostermontag'});
	days.push({'date':moment(ostern).add(39, 'd'), 'desc':'Christi Himmelfahrt'});
	days.push({'date':moment(ostern).add(49, 'd'), 'desc':'Pfingsten'});
	days.push({'date':moment(ostern).add(50, 'd'), 'desc':'Pfingstmontag'});
	days.push({'date':moment(ostern).add(60, 'd'), 'desc':'Fronleichnam'});
	days.push({'date':moment([year, 4, 1, 12]), 'desc':'Tag der Arbeit'});
	if(kath) {
		days.push({'date':moment([year, 7, 15, 12]), 'desc':'Mariä Himmelfahrt'});
	}
	days.push({'date':moment([year, 9, 3, 12]), 'desc':'Tag der deutschen Einheit'});
	days.push({'date':moment([year, 10, 1, 12]), 'desc':'Allerheiligen'});
	days.push({'date':moment([year, 11, 25, 12]), 'desc':'1.Weihnachtsfeiertag'});
	days.push({'date':moment([year, 11, 26, 12]), 'desc':'2.Weihnachtsfeiertag'});
	
	days.sort(function(a,b){return a.date.dayOfYear()-b.date.dayOfYear();})
		
	HolidaysByYearCached.push({'year':year, 'days':days});
	
	if(HolidaysByYearCached.length > 1) {
		HolidaysByYearCached.sort(function(a,b){return a.year-b.year;});
	}
	
	return days;
}

function getHotdaysByYear(year) {
	
	year = parseYearToInt(year);

	for(var i = 0; i < HotdaysByYearCached.length; ++i) {
		if(year == HotdaysByYearCached[i].year) {
			return HotdaysByYearCached[i].days;
		}
	}
	
	var days = [];
	var ostern = moment(getEasterByYear(year));
	
	days.push({'date':moment(ostern).subtract(1, 'd'), 'desc':'Karsamstag'});
	days.push({'date':moment(ostern).add(48, 'd'), 'desc':'Pfingstsamstag'});
	days.push({'date':moment([year, 11, 24, 12]), 'desc':'Heiligabend'});
	days.push({'date':moment([year, 11, 31, 12]), 'desc':'Silvester'});
	
	days.sort(function(a,b){return a.date.dayOfYear()-b.date.dayOfYear();})
	
	HotdaysByYearCached.push({'year':year, 'days':days});
	
	if(HotdaysByYearCached.length > 1) {
		HotdaysByYearCached.sort(function(a,b){return a.year-b.year;});
	}
	
	return days;
}