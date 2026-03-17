"use strict";

const HolidaysByYearCached = {};
const HotdaysByYearCached = {};

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
		year = parseInt(xYear, 10);	
	} else if (typeof xYear == 'object' && typeof xYear.year == 'function') {
		year = xYear.year();			
	}
	
	return year;
}

function md(year, month, day) {
    return moment([year, month, day, 12]);
}

function getHolidaysByYear(year, kath) {
	
	year = parseYearToInt(year);
	
	if(typeof kath == 'undefined') {
		kath = false;			
	}
	
	if(HolidaysByYearCached[year]) {
		return HolidaysByYearCached[year].days;
	}
	
	var days = [];
	const ostern = moment(getEasterByYear(year));
	
	days.push({'date':md(year, 0, 1), 'desc':'Neujahr'});
	days.push({'date':md(year, 0, 6), 'desc':'Hl. Drei König'});
	days.push({'date':ostern.clone().subtract(2, 'd'), 'desc':'Karfreitag'});
	days.push({'date':ostern.clone(), 'desc':'Ostersonntag'});
	days.push({'date':ostern.clone().add(1, 'd'), 'desc':'Ostermontag'});
	days.push({'date':ostern.clone().add(39, 'd'), 'desc':'Christi Himmelfahrt'});
	days.push({'date':ostern.clone().add(49, 'd'), 'desc':'Pfingsten'});
	days.push({'date':ostern.clone().add(50, 'd'), 'desc':'Pfingstmontag'});
	days.push({'date':ostern.clone().add(60, 'd'), 'desc':'Fronleichnam'});
	days.push({'date':md(year, 4, 1), 'desc':'Tag der Arbeit'});
	if(kath) {
		days.push({'date':md(year, 7, 15), 'desc':'Mariä Himmelfahrt'});
	}
	days.push({'date':md(year, 9, 3), 'desc':'Tag der deutschen Einheit'});
	days.push({'date':md(year, 10, 1), 'desc':'Allerheiligen'});
	days.push({'date':md(year, 11, 25), 'desc':'1.Weihnachtsfeiertag'});
	days.push({'date':md(year, 11, 26), 'desc':'2.Weihnachtsfeiertag'});
	
	days.sort(function(a,b){return a.date.dayOfYear()-b.date.dayOfYear();})
		
	HolidaysByYearCached[year] = days;	
	return days;
}

function getHotdaysByYear(year) {
	
	year = parseYearToInt(year);
	
	if(HotdaysByYearCached[year]) {
		return HotdaysByYearCached[year].days;
	}

	var days = [];
	const ostern = moment(getEasterByYear(year));
	
	days.push({'date':ostern.clone().subtract(1, 'd'), 'desc':'Karsamstag'});
	days.push({'date':ostern.clone().add(48, 'd'), 'desc':'Pfingstsamstag'});
	days.push({'date':md(year, 11, 24), 'desc':'Heiligabend'});
	days.push({'date':md(year, 11, 31), 'desc':'Silvester'});
	
	days.sort(function(a,b){return a.date.dayOfYear()-b.date.dayOfYear();})
	
	HotdaysByYearCached[year] = days;	
	return days;
}