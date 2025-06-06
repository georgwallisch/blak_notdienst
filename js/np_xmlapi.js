/* Notdienst-API */

function getNotdienstData(location_id) {
		
	console.log('Hole Notdienst-(XML)-Daten für '+location_id);
	
	var dfd = $.Deferred();
	var api_url = getSomethingById(api_urls, location_id);
	var url = api_url['url'];
	console.log('get url: '+ url);
	
	$.ajax({
			'url':url,
			'method': 'GET'
	}).done(function (xmldata) {
		
		let data = parseXML(xmldata);
								
		debug2box(data,'NotdienstXMLData');
		
		let container = data['container'];
		if(container['code'] != 'OK') {
			console.log('XML-Result-Code: ' + container['code']);
			dfd.resolve(false);
		}
		let entries = container['entries']['entry'];
		if(!Array.isArray(entries)) {
			console.log('Kein Entry-Array vorhanden! Ist Typ ' + typeof entries);
			dfd.resolve(false);
		}
		
		let result = {};
		let list = [];
		
		result['created'] = moment.utc(container['created']).local();
		let descr = container['descr'].split(':');
		result['type'] = descr[0].trim();
		let coords = descr[1].split(',');
		result['lat'] = Number.parseFloat(coords[0]);
		result['lon'] = Number.parseFloat(coords[1]);
		
		var entry;
		
		for(var i = 0; i < entries.length; ++i) {
			entry = entries[i];
			entry['from'] = moment.utc(entry['from']).local();
			entry['to'] = moment.utc(entry['to']).local();
			entry['lat'] = Number.parseFloat(entry['lat']);
			entry['lon'] = Number.parseFloat(entry['lon']);

			list.push(entry);
		}	
		
		result['entries'] = list;
			
		dfd.resolve(result);
		
	}).fail(function (jqXHR, textStatus, errorThrown) {
		dfd.reject(jqXHR, textStatus, errorThrown);
	});
	
	return dfd.promise();
}

function toMS(day, hour) {
	
	return moment(getParam(day, moment())).hour(getParam(hour, 0)).minute(0).second(0).millisecond(0).format('x');
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

function activateBox(boxname, header, force_refresh, header_tag, hideall) {
	
	header_tag = getParam(header_tag, '<h1>', true);
	console.log('Aktiviere Box '+boxname);
		
	if(getParam(hideall, false)) {
		$('.databox').hide();
	}
	
	var refresh = getParam(force_refresh, false);
	var box = $('#'+boxname);
		
	if(refresh || !box.length) {
		if(box.length) {
			box.remove();
		}
		box = $('<div>', {'id':boxname, 'class':'databox'}).appendTo('#mainbox');
		if(typeof header == 'string') {
			$(header_tag).appendTo(box).append(header);
		}
		//box.hide();
		return box;
	}
	
	box.show();
	return false;
}

function calcDistance(lat1, lon1, lat2, lon2) {
	return calcDistanceAdvanced(lat1, lon1, lat2, lon2);
}

function calcDistanceAdvanced(lat1, lon1, lat2, lon2) {

	let lat = (lat1 + lat2) / 2 * 0.01745;
	let dx = 111.3 * Math.cos(lat) * (lon1 - lon2);
	let dy = 111.3 * (lat1 - lat2);
	let distance = Math.sqrt(dx * dx + dy * dy);
	
	return distance;
}

function calcDistanceHaversine(lat1, lon1, lat2, lon2) {
	let dLat = lat2 - lat1;
	let dLon = lon2 - lon1;
		
	let a = Math.pow(Math.sin(dLat/2.0), 2) + Math.pow(Math.sin(dLon/2.0), 2) * Math.cos(lat1) * Math.cos(lat2);
	let dist = 6378.388 * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0-a));
	
	return dist;
}

function apobox(e, lat, lon, mindist) {
	
	mindist = getParam(mindist, 3.0);
	
	var elem = $('<div>', {'class':'apobox'});
	$('<h4>').text(e['name']).appendTo(elem);
	$('<address>').html(e['street'] + '<br /><strong>' + e['zipCode'] + '&nbsp;' + e['location'] + '</strong>').appendTo(elem);
	$('<div>', {'class':'phone'}).text('Telefon: ' + e['phone']).appendTo(elem);

	if(!isNaN(lat) && !isNaN(lon)) {
		dist = calcDistance(lat, lon, e['lat'], e['lon']);
		if(dist > mindist) {
			$('<div>', {'class':'distance'}).text('Entfernung ca. ' + Math.round(dist) + ' km').appendTo(elem);
		}
	}
	
	return elem;
}

function setDienstbereit(elem, e, apo_name, apo_ort) {
	if(typeof elem != 'object') {
		console.log('Prüfung auf Dienstbereitschaft: Kein jQuery-Object!');
		return false;		
	}
	
	if(apo_name == e['name'] && e['location'] == apo_ort) {		
		elem.addClass('dienstbereit');
		if(debug_mode) {
			console.log('Prüfung auf Dienstbereitschaft: '+apo_name + ', '+apo_ort+' hat Dienst');
		}
	} else {
		if(debug_mode) {
			console.log('Prüfung auf Dienstbereitschaft: Soll: '+apo_name + ', '+apo_ort+' Ist: ',e['name'] +', '+e['location']);
		}
	}
}

function getApoID(callBackFunc) {
	
	if(typeof apo_id == 'undefined') {
		$.ajax({
			'url':ipinfourl,
			'method': 'GET'
		}).done(function (data) {
			var apo_id = data['id'];	
			callBackFunc(apo_id);
		});	
	} else {
		callBackFunc(apo_id);
	}
}