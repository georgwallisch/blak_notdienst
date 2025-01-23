/* Notdienst-API */

function getIndexById(something, id) {
	//if(typeof something != 'Object' || something.length < 1) {
	if(!Array.isArray(something)) {
//		return null;
		return -1;
	}
	var i = something.reduce(function(cur, val, index) {
			if(val.id == id && cur === -1 ) {
				return index;
			}
			return cur;
    }, -1 );
    return (i);
}

function getParam(param, defaultvalue, mustbesametypeasdefault) {
	
	if(typeof defaultvalue == 'undefined') {
		defaultvalue = null;
	} 	
	
	if(typeof mustbesametypeasdefault == 'undefined') {
		mustbesametypeasdefault = false;
	}
	
	if(typeof param == 'undefined') {
		param = defaultvalue;
	} else if(mustbesametypeasdefault) {
		if(typeof param != typeof defaultvalue) {
			param = defaultvalue;
		}
	}
	
	return param;
}

function getNpResult(action, params) {
	
	var dfd = $.Deferred();
	
	$.ajax({
			'type': 'POST',
			'url': api_url,
			'data': {'action':'erstelleplan/'+action+'/ergebnis','jsondata':params},
			'dataType':'html'			
	}).done(function (data) {
		
		var html = $.parseHTML(data);
		var result = [];
		var curDay;
			
		console.log('Iteriere durch searchResultEntrys');
		$(html).find('div.searchResultEntry').each(function(entryIndex, entryValue) {
			console.log(entryIndex + ": " + entryValue);

			var pharmacy = {};
			pharmacy['name'] = $('div:eq(2) > span:eq(0)', entryValue).text();
			pharmacy['tel'] = $('div:eq(2) > span:eq(1)', entryValue).text();
			pharmacy['street'] = $('div:eq(3) > span:eq(0)', entryValue).text();
			pharmacy['location'] = $('div:eq(3) > span:eq(1)', entryValue).text();
			pharmacy['servicetime'] = $('div:eq(4)', entryValue).text();
						
			var day = $('div:eq(0)', entryValue).text();
			if(day != '') {
				if(day != curDay) {
					curDay = day;				
				}
			} 
			
			pharmacy['serviceday'] = curDay;
	
			result.push(pharmacy);		
		}).promise().then(function() {
			dfd.resolve(result);
		});

	});
	
	return dfd.promise();
}

function getNotdienstUmkreis(location_id, range, day) {
	
	console.log('Erzeuge Umkreisplan für '+location_id);
	
	var loc_id = getIndexById(locations, location_id);
	var loc = locations[loc_id];
	range = getParam(range, defaultrange, true);
	day = getParam(day, moment());
	var ms = toMS(day);
	
	var params = {
		'location':loc['location'],
		'fromDate':ms,
		'toDate':ms,
		'lat':loc['lat'],
		'lon':loc['lon'],
		'circumcircle':range,
		'idx':"",
		'printVersion':"",
		'pageBreakCount':"",
		'bulletinFormat':"",
	};
	
	return getNpResult('standort',params);
}

function getApoPlan(location_id, start_day, end_day) {
	
	console.log('Erzeuge individuellen Notdienstplan für '+location_id);
	
	var loc_id = getIndexById(locations, location_id);
	var loc = locations[loc_id];

	start_day = getParam(start_day, moment().dayOfYear(1));
	end_day = getParam(end_day, moment().month(12).date(31));
	
	var action = 'apotheke';
	var params = {
		'drugstoreId':loc['drugstoreId'],
		'fromDate':toMS(start_day),
		'toDate':toMS(end_day),
	};
	
	var dfd = $.Deferred();
	
	$.ajax({
			'type': 'POST',
			'url': api_url,
			'data': {'action':'erstelleplan/'+action+'/ergebnis','jsondata':params},
			'dataType':'html'			
	}).done(function (data) {
		
		var html = $.parseHTML(data);
		var result = [];
		//var pattern = /[MoDiFrSa]{2}\. \d{2}\.\d{2}\.20\d{2}/i;
		var pattern = /\d{2}\.\d{2}\.20\d{2}/i;
				
		console.log('Iteriere durch searchResultEntrys');
		$(html).find('#searchResults td').each(function(entryIndex, entryValue) {
			var res = $(entryValue).text().match(pattern);
			if(Array.isArray(res)) {
				/*result = result.concat(e);*/
				for(let elem of res) {
					var d = moment(elem, "DD.MM.YYYY");
					result.push(d);
				}
			}
		}).promise().then(function() {
			result.sort(function(a, b){return a.diff(b)});
			dfd.resolve(result);
		});

	});
	
	return dfd.promise();
}

function toMS(day, hour) {
	
	return moment(getParam(day, moment())).hour(getParam(hour, 0)).minute(0).second(0).millisecond(0).format('x');
}

function getApoToday(location) {
	
	const ms = toMS();

	var dfd = $.Deferred();
	
	var params = {
		'drugstoreId':location['drugstoreId'],
		'fromDate':ms,
		'toDate':ms,
	};
	
	$.ajax({
			'type': 'POST',
			'url': api_url,
			'data': {/*'debug':1,*/'action':'erstelleplan/apotheke/ergebnis','jsondata':params},
			'dataType':'html'			
	}).done(function (data) {
		console.log('Antwort für drugstoreId '+location['drugstoreId']);
		var html = $.parseHTML(data);
		var timeBar = $(html).find('#timeBar');
		if(timeBar) {
			var t = $(timeBar).text();
			console.log('TimeBar gefunden: ' + t);
			dfd.resolve(t);
		} else {
			console.log('Keine TimeBar gefunden!');
			dfd.resolve('--');
		}		
	});
	
	return dfd.promise();
}

function add_navbar_item(parent_ul, text, li_attribs, a_attribs) {
	
	if(typeof li_attribs == 'object') {
		if(li_attribs.hasOwnProperty('class')) {
			li_attribs['class'] += ' nav-item';
		} else {
			li_attribs['class'] = 'nav-item';
		}		
	} else {
		li_attribs = {'class':'nav-item'};
	}
	
	if(typeof a_attribs == 'object') {
		if(a_attribs.hasOwnProperty('class')) {
			a_attribs['class'] += ' nav-link';
		} else {
			a_attribs['class'] = 'nav-link';
		}
		if(!a_attribs.hasOwnProperty('href')) {
			a_attribs['href'] = '#';
		}
	} else {
		a_attribs = {'class':'nav-link', 'href':'#'};				
	}	

	var li = $('<li>', li_attribs).appendTo(parent_ul);
	var a = $('<a>', a_attribs).appendTo(li).append(text);

	return a;
}

function activateBox(boxname, header, force_refresh) {
	
	console.log('Aktiviere Box '+boxname);
	
	$('.databox').hide();
	var box = $('#'+boxname);
	var refresh = false;
	
	if(typeof force_refresh != 'undefined' && force_refresh === true) {
		box.remove();
		refresh = true;		
	}
		
	if(refresh || !box.length) {
		box = $('<div>', {'id':boxname, 'class':'databox'}).appendTo('#mainbox');
		if(typeof header == 'string') {
			$('<h2>').appendTo(box).append(header);
		}
		//box.hide();
		return box;
	}
	
	box.show();
	return false;
}