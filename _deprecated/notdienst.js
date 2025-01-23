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

function showNotdienstPlan() {
	
	const today = moment();
	const year_today = today.year();
	
	var year = today.year();
	
	var box = activateBox('jahresplan_'+year);
	
	$('<h2>').appendTo(box).append('Notdienstplan '+year);

	
	const tabelle = $('<table>', {'id':'notdienstkalneder'+year, 'class':'table kalender'}).appendTo(box);
	const thead = $('<thead>').appendTo(tabelle);
	const trh = $('<tr>').appendTo(thead);
	const monate = moment.monthsShort();
	for(let i = 0; i < monate.length; i++) {
		$('<th>').appendTo(trh).append($('<div>', {'class':'cell_content'}).append(monate[i])).click(function() {
				toggleStundenDarstellung();
				return false;
		});
	}
	
	const tbody = $('<tbody>').appendTo(tabelle);
	const tfoot = $('<tfoot>').appendTo(tabelle);

	const holidays = getHolidaysByYear(year, katholic);
	
	let holidays_str = [];
	for(let i = 0; i < holidays.length; ++i) {
		holidays_str.push(holidays[i].date.format('YYYY-MM-DD'));
	}
	
	const hotdays = getHotdaysByYear(year);
	
	let hotdays_str = [];
	for(let i = 0; i < hotdays.length; ++i) {
		hotdays_str.push(hotdays[i].date.format('YYYY-MM-DD'));
	}
	
	const weeks_in_year = moment([year,6]).isoWeeksInYear();
	
	for(let j = 1; j < 32; j++) {
		let trd = $('<tr>').appendTo(tbody);
		let jstr = j.toString().padStart(2,'0');
		for(let i = 0; i < monate.length; i++) {
			let istr = (i+1).toString().padStart(2,'0');
			if(j > moment([year,i]).daysInMonth()) {
				$('<td>',{'class':'not_a_day'}).appendTo(trd);				
			} else {
				let cur_day = moment([year, i, j]);
				let cd_str = cur_day.format('YYYY-MM-DD');
				let cd_iso = cur_day.isoWeek();
				let cd_name = cur_day.format('dd');
				let cd_class = cd_iso % 2 ? 'odd_week' : 'even_week';
				if((i < 1 && cd_iso > 5) || (i > 10 && cd_iso < 10)) {
					cd_class = 'week_other_year';
				}
				let td = $('<td>',{'id':'kal_'+cd_str, 'class':cd_class}).appendTo(trd);
				let div = $('<div>', {'class':'date_content'}).appendTo(td);
				$('<div>', {'class':'nd_content'}).appendTo(td);
				let dow_class = 'dow_' + cd_name.toLowerCase();
				let day = $('<span>',{'class':'dom_number ' + dow_class}).appendTo(div).append(jstr);
				let dname = $('<span>',{'class':'dow_name ' + dow_class}).appendTo(div).append(cd_name);
				td.addClass(dow_class);
				if(holidays_str.includes(cd_str)) {
					let hday = holidays_str.indexOf(cd_str);
					td.addClass('holiday');
					div.attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',holidays[hday].desc).tooltip();
				}
				if(hotdays_str.includes(cd_str)) {
					let hday = hotdays_str.indexOf(cd_str);
					td.addClass('hotday');
					div.attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',hotdays[hday].desc).tooltip();
				}
				if(today.isSame(cur_day, 'day')) {
					td.addClass('heute');
				}
			}
			
		}
	}
	
	for(let loc of locations) {
		console.log('Erstelle Plan für '+loc['id']);	
		getApoPlan(loc['id']).done(function(data) {
		/* NUR ZUM TESTEN 
				$('<h3>').append(loc['id']+'('+data.length+')').appendTo(box);
				var d = $('<ul>', {'id':'liste_nd_'+loc['id']}).appendTo(box);
				*/
			for(let elem of data) {
				let ndcell = $('#kal_' + elem.format('YYYY-MM-DD') + ' div.nd_content', tbody);
				//let daycell = $('#kal_' + elem.format('YYYY-MM-DD'), tbody);
				let div = $('<div>', {'class':'nd_location nd_' + loc['id']}).appendTo(ndcell);
				$('<span>',{'class':'notdienstapo nd_' + loc['id']}).appendTo(div).text(loc['id']);
				/*
				if(daycell.hasClass('nday')) {
				
				} else {
					daycell.addClass('nday nd_' + loc['id']);
				}
				*/
			}
		});
	}
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
	
	add_navbar_item(main_nav,'Jahreskalender').click(function() {
		showNotdienstPlan();	
		return false;
	});
		
});