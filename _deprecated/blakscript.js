(function($) {
	$.fn.serializeFormJSON = function() {

	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [o[this.name]];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};
})(jQuery);

var myEmergencySearch = {

	queueSearchPharmacy: function(action,location,term) {
		$("#selectedPharmacyVal").text("");
		$("#foundedPharmacyLoader").attr("style", "");
		
		queueCommand({
			name: "ajax",
			descriptor: {
				type: 'POST',
				url: action,
				dataType: 'html',
				data: 'term='+term+"&location="+location,
				success: function (data) {
					$("#foundedPharmacyLoader").attr("style", "display:none");
					$("#drugstoreList").unbind('change');
					$("#drugstoreList").remove();
					$("#foundedPharmacyContainer").append(data);
					$("#drugstoreList").bind('change', function() {
						$("#selectedPharmacyVal").text($('#drugstoreList option:selected').text());
						$("#selectedPharmacyVal").attr("data-id",$('#drugstoreList option:selected').val());
					});
					
					$("#drugstoreList option:first").attr('selected','selected');
					
					resetCurrentCommand();
					nextCommand();
				}
			}
		});
		nextCommand();
	},
	execute: function() {
		
		$("#foundedPlanLoader").attr("style", "");
		
		//startdate
		var startDate = $("#startDate").val();
		if (startDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Startdatum auswählen");
			return;
		}
		var date = $("#startDate").datepicker("getDate");
		var timestamp = date.getTime();
		$('#searchFormPlan input[name=fromDate]').attr('value', timestamp);
				
		//enddate
		var endDate = $("#endDate").val();
		if (endDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Enddatum auswählen");
			return;
		}
		date = $("#endDate").datepicker("getDate");
		timestamp = date.getTime();
		$('#searchFormPlan input[name=toDate]').attr('value', timestamp);
		
        //drugstore
		var drugstore = $("#selectedPharmacyVal").attr("data-id");
		if (drugstore == null || drugstore == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte wählen Sie eine Apotheke aus");
			return;
		}
		
		// pharmacy id
		$('#searchFormPlan input[name=drugstoreId]').attr('value', drugstore);
		
		$.post($("#searchFormPlan").attr("action"), $("#searchFormPlan").serialize(), function(data) {
			$("#foundedPlanLoader").attr("style", "display:none");
			$("#plan .info").remove();
			$("#plan .error").remove();
			$("#individualList").remove();
			$("#plan").append(data);
		});
	},
	clickPrintButton: function() {
		var action = $('#searchFormPlan').attr("action");
		$('#searchFormPlan').attr("action", $('#searchFormPlan').attr("data-action"));
		$('#searchFormPlan').submit();
		$('#searchFormPlan').attr("action",action);
	}	
};

var drugstoreSearch = {
	defaultZoom: 9,
	googleMapRendered: null,
	geocoder: null,
	distanceMap: null,
	map: null,
	latlng: null,
	infoWindow: new google.maps.InfoWindow(),
	autoCompletePlace: null,
	drugstoreSearchMarkers: [],
	icon_16: '',
	icon_32: '',
	removeMarkers: function() {
		for ( var i = 0; i < drugstoreSearch.drugstoreSearchMarkers.length; i++ ) {
			drugstoreSearch.drugstoreSearchMarkers[i].setMap(null);
		}
		drugstoreSearch.drugstoreSearchMarkers = [];
	},
	addMarkers: function() {
		$(".apotheke").each(function(item) {
		    var t = $(arguments[1]);
		    var latlng = new google.maps.LatLng(t.attr("data-lat"), t.attr("data-lon"));
		    drugstoreSearch.addMarker(latlng, t.find(".name").text(), t.find(".street").text(), t.find(".zipCode").text(), t.find(".location").text(), t.find(".phone").text());
		});
	},
	addMarker: function(latlng, name, street, zipCode, location, phone) {
		var marker = new google.maps.Marker({
			position: latlng, 
			map: drugstoreSearch.map, 
			title: unescape(name +', ' + street +', ' + zipCode +' ' + location + ' (Bitte anklicken f%FCr weitere Details)'),
			icon: drugstoreSearch.icon_16
		});
		
		google.maps.event.addListener(marker, 'click', function() {
			drugstoreSearch.infoWindow.close();
			drugstoreSearch.infoWindow.setContent("<b>" + name + "</b>" +
						 "<br/>" + street +
						 "<br/>" + zipCode + " " + location +
						 "<br/>Tel.: " + phone);
			drugstoreSearch.infoWindow.setPosition(latlng);
			
			drugstoreSearch.infoWindow.open(drugstoreSearch.map);
		});
		
		drugstoreSearch.drugstoreSearchMarkers.push(marker);
	},
	changeMarkerIcon: function(idx, iconName) {
		if (iconName == 'icon_16') {
			drugstoreSearch.drugstoreSearchMarkers[idx].setIcon(drugstoreSearch.icon_16);
		}
		else {
			drugstoreSearch.drugstoreSearchMarkers[idx].setIcon(drugstoreSearch.icon_32);	
		}
	},
	setMapZoom: function() {
		if (drugstoreSearch.drugstoreSearchMarkers.length == 0) {
			return;
		}
		
		var latlngbounds = new google.maps.LatLngBounds( );
		for ( var i = 0; i < drugstoreSearch.drugstoreSearchMarkers.length; i++ ) {
			latlngbounds.extend(drugstoreSearch.drugstoreSearchMarkers[i].getPosition());
		}
		drugstoreSearch.map.fitBounds(latlngbounds);
	},
	sendRequest: function(data, computeDistance) {
		if (computeDistance) {
			$.ajax({
		        type: 'GET',
		        url: $('#searchFormPharm').attr('data-gisdata-action'),
		        dataType: 'json',
		        success: function (drugstores) {
		        	drugstoreSearch.distanceMap = {};
		        	var directionsService = new google.maps.DistanceMatrixService();
		    		var drugstoreIdx = -1;
		    		drugstoreSearch.computeDistance(data, directionsService, drugstores, drugstoreIdx);
		        },
		        data: 'searchType=gisData&searchTerm='+data.circumcircle+';'+data.locationLat+';'+data.locationLon
		    });	
		}
		else {
			data.distanceMap = drugstoreSearch.distanceMap;
			$.ajax({
		        type: 'POST',
		        url: $('#searchFormPharm').attr('action'),
		        dataType: 'html',
		        contentType: 'application/json; charset=UTF-8',
		        success: function (data) {
		        	$("#description").remove();
		        	$("#searchDrugstoreLoader").attr("style", "display:none");
		        	$("#searchResults").remove();
		        	drugstoreSearch.removeMarkers();
					$("#searchResultContainer").append(data);
					drugstoreSearch.addMarkers();
					drugstoreSearch.setMapZoom();
					
					if (drugstoreSearch.distanceMap != null && drugstoreSearch.distanceMap != undefined) {
						var numberFormat = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
						$('.apotheke').each(function() {
							var distance = (drugstoreSearch.distanceMap[$(this).attr("data-id")] / 1000);
							var elem = $(this).find("h2");
							var text = elem.text();
							text += " (Entfernung: " + numberFormat.format(distance) + " km)";
							elem.text(text);
						});
					}
		        },
		        data: JSON.stringify(data)
		    });	
		}	
	},
	showMap: function() {
		if (drugstoreSearch.googleMapRendered === null) {
			drugstoreSearch.geocoder = new google.maps.Geocoder();
    		
    		var latlng = new google.maps.LatLng(48.145472, 11.576042);
    		var myOptions = {
    			zoom: drugstoreSearch.defaultZoom,
    			center: latlng,
    			mapTypeId: google.maps.MapTypeId.ROADMAP,
    			streetViewControl: false
    		};
    		drugstoreSearch.map = new google.maps.Map(document.getElementById("drugstoreSearchMap"), myOptions);	
    		drugstoreSearch.googleMapRendered = true;
    	}
	},
	initializeMap: function() {
		var inputLocation = document.getElementById('location');
		
		var autocomplete = new google.maps.places.Autocomplete(inputLocation);
	    autocomplete.setComponentRestrictions({'country': ['de']});
        autocomplete.setFields(['geometry']);
	    
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
	    	drugstoreSearch.showMap();
	    	drugstoreSearch.autoCompletePlace = autocomplete.getPlace();
			if (drugstoreSearch.autoCompletePlace.geometry != undefined && drugstoreSearch.autoCompletePlace.geometry.location) {
				drugstoreSearch.map.setCenter(drugstoreSearch.autoCompletePlace.geometry.location);
			}
			else {
				drugstoreSearch.autoCompletePlace = null;
			}
		});
	},
	checkUrl: function() {
		try {
			var paramString = document.URL.split('?')[1];
			if (paramString == undefined) {
				return;
			}

			var validLocation = false;
			var parameter = paramString.split('&');
			for (var i=0; i<parameter.length; i++) {
				var paramArr = parameter[i].split('=');
				var paramName = paramArr[0];
				var paramValue = decodeURIComponent(paramArr[1].replace(/\+/g, '%20'));
				if (paramName == 'location' && paramValue !== '') {
					$('#location').val(paramValue);
					validLocation = true;
				}
			}
			if (parameter.length==1 && validLocation) {
				drugstoreSearch.showMap();
				drugstoreSearch.execute('1',true);
			}
		} 
		catch (e) {
			alert(e);
		}
	},
	computeDistance: function(data,directionsService,drugstores,drugstoreIdx) {
		if (drugstoreIdx >= drugstores.length) {
			drugstoreSearch.sendRequest(data, false);
		}
		else {
			window.setTimeout(function() {
				var localDrugstores = [];
				var destinations = [];
				var upper = drugstoreIdx+25;
				for ( var i = drugstoreIdx+1; i <= upper; i++) {
					if (i < drugstores.length) {
						var drugstore = drugstores[i];
						var drugstoreObj = {};
						drugstoreObj.id = drugstore.id;
						localDrugstores.push(drugstoreObj);
						destinations.push(new google.maps.LatLng(drugstore.lat, drugstore.lon));
					}
					else {
						upper = i;
						break;
					}
				}
				
				if (destinations.length == 0) {
					drugstoreIdx = upper;
					drugstoreSearch.computeDistance(data, directionsService, drugstores, drugstoreIdx);
				}
				
				var from = new google.maps.LatLng(data.locationLat, data.locationLon);
			
        		directionsService.getDistanceMatrix({
        			origins: [from],
        			destinations: destinations,
        			travelMode: google.maps.TravelMode.DRIVING,
        			avoidHighways: false,
        			avoidTolls: false}, function(response, status) {
        	    		if (status == google.maps.DirectionsStatus.OK) {
	            			
	            			for ( var i = 0; i < response.rows[0].elements.length; i++) {
	            				var drugstoreObj = localDrugstores[i];
	            				drugstoreSearch.distanceMap[drugstoreObj.id] = parseInt(response.rows[0].elements[i].distance.value);
	            			}
	            			
	                    }
	            		
	            		drugstoreIdx = upper;
	            		drugstoreSearch.computeDistance(data, directionsService, drugstores, drugstoreIdx);
        			}
        		);
			}, 700);
		}
	},
	execute: function(page, computeDistance) {
		drugstoreSearch.showMap();
		if (computeDistance == undefined) {
			computeDistance = false;
		}
		
		$("#searchDrugstoreLoader").attr("style", "");
		
        // pharmacy name
		var term = $("#term").val();
		
		// pharmacy location
		var location = $("#location").val();
		var circumcircle = $("#circumcircle").val();			
		
		// store data in form
		if (page != undefined) {
			$('#searchFormPharm input[name=page]').attr('value', page);
		}
		$('#searchFormPharm input[name=searchTerm]').attr('value', term);
		$('#searchFormPharm input[name=circumcircleSearchTerm]').attr('value', location);
		$('#searchFormPharm input[name=circumcircle]').attr('value', circumcircle);
		
		var data = $('#searchFormPharm').serializeFormJSON();
		
		// drugstore properties
		var properties = [];
		$('input:checked.property').each(function() {
			properties.push($(this).val());
		});
		data.properties = properties; 
				
		if (circumcircle != "-1" && data.circumcircleSearchTerm != "") {
			if (drugstoreSearch.autoCompletePlace != null) {
				data.locationLat = drugstoreSearch.autoCompletePlace.geometry.location.lat();
				data.locationLon = drugstoreSearch.autoCompletePlace.geometry.location.lng();
				drugstoreSearch.sendRequest(data, computeDistance && true);
			}
			else {
				drugstoreSearch.geocoder.geocode( { 'address': data.circumcircleSearchTerm, 'region': 'de'}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						var latlng = results[0].geometry.location;
						data.locationLat = latlng.lat();
						data.locationLon = latlng.lng();
						drugstoreSearch.sendRequest(data, computeDistance && true);
					} 
					else {
						$("#searchDrugstoreLoader").css("display", "none");
						alert("Der Ort '" + $("#location").val() + "' wurde nicht gefunden!");
					}
				});	
			}
		}
		else {
			drugstoreSearch.distanceMap = null;
			drugstoreSearch.sendRequest(data, false);
		}
	}		
};

var fastSearch = {
	defaultZoom: 9,
	googleMapRendered: null,
	geocoder: null,
	map: null,
	autoCompletePlace: null,
	latlng: null,
	infoWindow: new google.maps.InfoWindow(),
	fastSearchMarkers: [],
	icon_16: '',
	icon_32: '',
	distanceService: new google.maps.DistanceMatrixService(),
	removeMarkers: function() {
		for ( var i = 0; i < fastSearch.fastSearchMarkers.length; i++ ) {
			fastSearch.fastSearchMarkers[i].setMap(null);
		}
		fastSearch.fastSearchMarkers = [];
	},
	addMarkers: function() {
		$(".searchResultEntry").each(function(item) {
		    var t = $(arguments[1]);
		    var latlng = new google.maps.LatLng(t.attr("data-lat"), t.attr("data-lon"));
		    fastSearch.addMarker(latlng, t.find(".name").text().trim(), t.find(".street").text().trim(), t.find(".zipCode").text().trim(), t.find(".location").text().trim(), t.find(".phone").text().trim(), t.find(".serviceTime").text().trim());
		});
	},
	addMarker: function(latlng, name, street, zipCode, location, phone, serviceTime) {
		var marker = new google.maps.Marker({
			position: latlng, 
			map: fastSearch.map, 
			title: unescape(name +', ' + street +', ' + zipCode +' ' + location + ' (Bitte anklicken f%FCr weitere Details)'),
			icon: fastSearch.icon_16
		});
		
		google.maps.event.addListener(marker, 'click', function() {
			fastSearch.infoWindow.close();
			fastSearch.infoWindow.setContent("<b>" + name + "</b>" +
						 "<br/>" + street +
						 "<br/>" + zipCode + " " + location +
						 "<br/>Tel.: " + phone +
						 "<br/><br/>Notdienst " + serviceTime);
			fastSearch.infoWindow.setPosition(latlng);
			
			fastSearch.infoWindow.open(fastSearch.map);
		});
		
		fastSearch.fastSearchMarkers.push(marker);
	},
	changeMarkerIcon: function(idx, iconName) {
		if (iconName == 'icon_16') {
			fastSearch.fastSearchMarkers[idx].setIcon(fastSearch.icon_16);
		}
		else {
			fastSearch.fastSearchMarkers[idx].setIcon(fastSearch.icon_32);	
		}
	},
	setMapZoom: function(map) {
		var latlngbounds = new google.maps.LatLngBounds( );
		for ( var i = 0; i < fastSearch.fastSearchMarkers.length; i++ ) {
			latlngbounds.extend(fastSearch.fastSearchMarkers[i].getPosition());
		}
		fastSearch.map.fitBounds(latlngbounds);
	},
	calculateDistances: function(from) {
		var drugstoreIdx = 0;
		var drugstoreInterval = window.setInterval(function() {
			$(".searchResultEntry").each(function(idx,drugstore) {
				if (drugstoreIdx == $(".searchResultEntry").length) {
					window.clearInterval(drugstoreInterval);
					fastSearch.sortEntriesOnTimeAndDistance();
					return;
				}
				else if (drugstoreIdx == idx) {
					var drugstoreObj = $(drugstore);
				    var to = new google.maps.LatLng(drugstoreObj.attr("data-lat"), drugstoreObj.attr("data-lon"));
				    fastSearch.calculateDistance(from, to, idx);
				    drugstoreIdx++;
				    return;
				}
			});
		}, 500);
	},
	sortEntriesOnTimeAndDistance: function() {
		var toSortEntries = [];
		$(".searchResultEntry").each(function(idx,drugstore) {
			var entry = {
				time: $(drugstore).attr("data-sortQualifier").split("_")[0],
				distance: $(drugstore).attr("data-sortQualifier").split("_")[1],
				id: $(drugstore).attr("data-sortQualifier")
			};
			toSortEntries.push(entry);
		});
		toSortEntries.sort(function(e1, e2) {
			if (e1.time - e2.time == 0) {
				return e1.distance - e2.distance;
			}
			return e1.time - e2.time;
		});
		
		for (var i = 0; i < toSortEntries.length; i++) {
			var id = toSortEntries[i].id;
			var compareId = $($(".searchResultEntry")[i]).attr("data-sortQualifier");
			if (id != compareId) {
				$("div[data-sortQualifier="+id+"]").insertBefore($(".searchResultEntry")[i]);
			}
		}
		
		for (var i = 0; i < toSortEntries.length; i++) {
			var id = toSortEntries[i].id;
			if (i % 2 == 0) {
				$("div[data-sortQualifier="+id+"]").attr("class","searchResultEntry row fastsearch-even");
			}
			else {
				$("div[data-sortQualifier="+id+"]").attr("class","searchResultEntry row fastsearch-odd");
			}
			
		}
		
	},
	calculateDistance: function(from, to, idx) {
		fastSearch.distanceService.getDistanceMatrix({
			origins: [from],
			destinations: [to],
			travelMode: google.maps.TravelMode.DRIVING,
			avoidHighways: false,
			avoidTolls: false
	  }, function(response, status) {
			var distance = "";
			if (status == 'OK') {
				distance = response.rows[0].elements[0].distance.text;
			}
			$('#distance-'+idx).text(distance);
			
			var sortQualValue = $('#distance-'+idx).parent().parent().attr("data-sortQualifier");
			
			if (status == 'OK') {
				sortQualValue = sortQualValue + "_" + response.rows[0].elements[0].distance.value;
			}
			else {
				sortQualValue = sortQualValue + "_999";
			}
			
			$('#distance-'+idx).parent().parent().attr("data-sortQualifier", sortQualValue);
	  });
	},
	showMap: function() {
		if (fastSearch.googleMapRendered === null) {
    		fastSearch.geocoder = new google.maps.Geocoder();
    		
    		var latlng = new google.maps.LatLng(48.145472, 11.576042);
    		var myOptions = {
    			zoom: fastSearch.defaultZoom,
    			center: latlng,
    			mapTypeId: google.maps.MapTypeId.ROADMAP,
    			streetViewControl: false
    		};
    		fastSearch.map = new google.maps.Map(document.getElementById("fastSearchMap"), myOptions);	
    		fastSearch.googleMapRendered = true;
    	}
	},
	initializeMap: function() {
		var inputLocation = document.getElementById('location');
		
		var autocomplete = new google.maps.places.Autocomplete(inputLocation);
	    autocomplete.setComponentRestrictions({'country': ['de']});
        autocomplete.setFields(['geometry']);
	    
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
	    	fastSearch.showMap();
			fastSearch.autoCompletePlace = autocomplete.getPlace();
			if (fastSearch.autoCompletePlace.geometry != undefined && fastSearch.autoCompletePlace.geometry.location) {
				fastSearch.map.setCenter(fastSearch.autoCompletePlace.geometry.location);
	        	$("#chosenLocation").text(document.getElementById('location').value);
			}
			else {
				fastSearch.autoCompletePlace = null;
			}
		});
	},
	checkUrl: function() {
		try {
			var paramString = document.URL.split('?')[1];
			if (paramString == undefined) {
				return;
			}

			var validLocation = false;
			var validDate = false;
			var parameter = paramString.split('&');
			for (var i=0; i<parameter.length; i++) {
				var paramArr = parameter[i].split('=');
				var paramName = paramArr[0];
				var paramValue = decodeURIComponent(paramArr[1]);
				if (paramName == 'location' && paramValue !== '') {
					$('#location').val(paramValue);
					validLocation = true;
				}
				else if (paramName == 'date' && paramValue !== '') {
					$('#fastSearchDate').val(paramValue);
					validDate = true;
				}
			}
			if (parameter.length==2 && validLocation && validDate) {
				$("#chosenLocation").text($('#location').val());
				fastSearch.showMap();
				fastSearch.execute();
			}
		} 
		catch (e) {
			alert(e);
		}
	},
	sendRequest: function(geoLocation) {
		$('#searchForm input[name=lat]').attr('value', geoLocation.geometry.location.lat());
		$('#searchForm input[name=lon]').attr('value', geoLocation.geometry.location.lng());
		
		var date = new Date();
		if ($("#searchForm input[name=dateInput]").length > 0) {
			date = $("#searchForm input[name=dateInput]").datepicker("getDate");
		}
		$('#searchForm input[name=date]').attr('value', date.getTime());
		
		fastSearch.map.setCenter(geoLocation.geometry.location);
		
		$.post($("#searchForm").attr("action"), $("#searchForm").serialize(), function(data) {
			
			$('#fastSearchResult h1').text(unescape("Ergebnisse f%FCr %AB" + $("#chosenLocation").text() + "%BB"));
			$('#fastSearchHint').attr('style', '');
			$("#description").css("display", "none");
			
			$('#fastSearchPlan').empty();
			fastSearch.removeMarkers();
			$('#fastSearchPlan').append(data);
			
			fastSearch.addMarkers();
			fastSearch.calculateDistances(geoLocation.geometry.location);
			fastSearch.setMapZoom(fastSearch.map);
			
			$('#fastSearchPlan').css('display', 'block');
			$("#planLoader").css("display", "none");
			$("#chosenLocation").text("");
		});
	},
	execute: function() {
		var location = $("#location").val();
		var date = $("#dateInput").val();
		
		if ($("#chosenLocation").text() == "" 
			||
			$("#chosenLocation").text() == undefined
			||
			$("#chosenLocation").text() == null) {
			
			$("#location").focus();
			alert("Bitte wählen Sie immer einen Ort aus der Vorschlagsliste aus!");
			return;
		}
		
		if (location == undefined || location.length == 0) {
			$("#location").focus();
			alert("Bitte geben Sie eine PLZ oder den Ort ein!");
			return;
		}
		if (date == undefined || date.length == 0) {
			$("#dateInput").focus();
			alert("Bitte geben Sie ein Datum ein!");
			return;
		}
		
		$("#planLoader").css("display", "block");
		
		if (fastSearch.autoCompletePlace != null) {
			fastSearch.sendRequest(fastSearch.autoCompletePlace);
		}
		else {
			fastSearch.geocoder.geocode( { 'address': $("#location").val(), 'region': 'de'}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					fastSearch.infoWindow.close();
					fastSearch.sendRequest(results[0]);
				} 
				else {
					$("#planLoader").css("display", "none");
					alert("Der Ort '" + $("#location").val() + "' wurde nicht gefunden!");
				}
			});	
		}
	},
	loadSearchForm: function(url,ajaxLoaderId,searchFormContainerId,datePickerId) {
		$("#"+ajaxLoaderId).attr("style","");
		$.ajax({
	        type: 'GET',
	        url: url,
	        success: function (data) {
	        	
	        	$("#"+ajaxLoaderId).attr("style","display:none;");
	        	$("#"+searchFormContainerId).children().remove();
	        	$("#"+searchFormContainerId).append(data);
	        	
	        	initDatepicker($("#"+datePickerId));
	        	
	        	$("#location").focus();
	        	
				fastSearch.initializeMap();
				fastSearch.checkUrl();
	        }
	    });	
	}
};

var ownLocationSearch = {
		
	autoCompletePlace: null,
	initialize: function() {
		
		initDatepicker($("input[data-type=date]"));
		$('#zipCode').attr('value','');             
		$("#searchFormPlan")[0].reset();
				
		var inputLocation = document.getElementById('searchedLocation');
		
		var autocomplete = new google.maps.places.Autocomplete(inputLocation);
	    autocomplete.setComponentRestrictions({'country': ['de']});
        autocomplete.setFields(['geometry']);
	    
	    google.maps.event.addListener(autocomplete, 'place_changed', function() {
			ownLocationSearch.autoCompletePlace = autocomplete.getPlace();
			if (ownLocationSearch.autoCompletePlace.geometry != undefined && ownLocationSearch.autoCompletePlace.geometry.location) {
				
				$("#selectedLocationVal").text(document.getElementById('searchedLocation').value);
				$("#selectedLocationVal").attr("data-id","-1");
				
			}
			else {
				ownLocationSearch.autoCompletePlace = null;
			}
		});
	},
	
	execute: function() {
		$("#foundedPlanLoader").attr("style", "");
		var selectedLoc = $("#selectedLocationVal").attr("data-id");
		if (selectedLoc == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte einen Ort auswählen");
			return;
		}
		selectedLoc = document.getElementById('searchedLocation').value;
		$('#searchFormPlan input[name=location]').attr('value', selectedLoc);
		
		//startdate
		var startDate = $("#startDate").val();
		if (startDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Startdatum auswählen");
			return;
		}
		var date = $("#startDate").datepicker("getDate");
		var timestamp = date.getTime();
		$('#searchFormPlan input[name=fromDate]').attr('value', timestamp);
		
		//enddate
		var endDate = $("#endDate").val();
		if (endDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Enddatum auswählen");
			return;
		}
		date = $("#endDate").datepicker("getDate");
		timestamp = date.getTime();
		$('#searchFormPlan input[name=toDate]').attr('value',timestamp);
		
		//circumCircle
		$('#searchFormPlan input[name=circumcircle]').attr('value',$("#chooseCircumcircle select").val());
		
		if (ownLocationSearch.autoCompletePlace != null) {
			$('#searchFormPlan input[name=lat]').attr('value', ownLocationSearch.autoCompletePlace.geometry.location.lat());
			$('#searchFormPlan input[name=lon]').attr('value', ownLocationSearch.autoCompletePlace.geometry.location.lng());
			
			$.post($("#searchFormPlan").attr("action"), $("#searchFormPlan").serialize(), function(data) {
				$("#foundedPlanLoader").attr("style", "display:none");
				$("#plan .info").remove();
				$("#plan .error").remove();
				$("#calendarPlanList").remove();
				$("#plan").append(data);
			});
			
		}
		else {
			$("#planLoader").css("display", "none");
			alert("Der Ort '" + selectedLoc + "' wurde nicht gefunden!");
		}
		
	},
	
	clickPrintOrBulletinButton: function(print,bulletinFormat) {
		$('#searchFormPlan input[name=printVersion]').attr('value',print);
		
		if (bulletinFormat !== undefined) {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value',bulletinFormat);	
		}
		else {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value','');	
		}
	
		var idx = [];
		$(".searchResultEntry input[type=checkbox]:checked").each(function(item, elem) {
		    idx.push(elem.value);
		});
		$('#searchFormPlan input[name=idx]').attr('value', idx.join());
		
		var action = $('#searchFormPlan').attr("action");
		$('#searchFormPlan').attr("action", $('#searchFormPlan').attr("data-action"));
		$('#searchFormPlan').submit();
		$('#searchFormPlan').attr("action",action);
	}
};

var locationsSearch = {
	queueSearchLocation: function(action,contextPath,searchVal) {
		$("#foundedLocationLoader").attr("style", "");
		
		queueCommand({
			name: "ajax",
			descriptor: {
				type: 'POST',
				url: action,
				dataType: 'html',
				data: 'searchTerm='+searchVal,
				success: function (data) {
					$("#foundedLocationLoader").attr("style", "display:none");
					$("#locationList").unbind('change');
					$("#locationList").remove();
					$("#foundedLocationContainer").append(data);
					
					$("#locationList option:first").attr('selected','selected');
					
					$("#locationList").bind('change', function() {
						locationsSearch.cacheSelectedLocation(contextPath);
					});
					
					resetCurrentCommand();
					nextCommand();
				}
			}
		});
		nextCommand();
	},
	cacheSelectedLocation: function(contextPath) {
		var id = $("#locationList option:selected").val();
		if (id < 0) {
			return;
		}
		var available = $("#selectedLocations span[data-id='"+id+"']");
		if (available.length == 0) {
			var location = "<div id='"+id+"' onclick=\"locationsSearch.deleteLocation(\'"+id+"\')\" class='innerBoxSearchLocation'><span class='selectedLocationVal' data-id='"+id+"'>"+$('#locationList option:selected').text()+"</span>";
			location = location + '<img src="'+contextPath+'/resources/blak/img/delete.png" data-id="'+id+'" title="L&ouml;schen" /><br data-id="'+id+'"/></div>';
			$("#selectedLocations").append(location);
		}
	},
	deleteLocation: function(id) {
		$("#selectedLocations div[id='"+id+"']").remove();
		$("#selectedLocations span[data-id='"+id+"']").remove();
		$("#selectedLocations img[data-id='"+id+"']").remove();
		$("#selectedLocations br[data-id='"+id+"']").remove();
	},   
	execute: function() {
		$("#foundedPlanLoader").attr("style", "");
		
		//startdate
		var startDate = $("#startDate").val();
		if (startDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Startdatum auswählen");
			return;
		}
		$('#searchFormPlan input[name=fromDate]').attr('value',$("#startDate").datepicker("getDate").getTime());

		//enddate
		var endDate = $("#endDate").val();
		if (endDate == '') {
				$("#foundedPlanLoader").attr("style", "display:none");
				alert("Bitte ein Enddatum auswählen");
				return;
		}
		$('#searchFormPlan input[name=toDate]').attr('value',$("#endDate").datepicker("getDate").getTime());

		//locations
		var locations = "";
		$("#selectedLocations span").each(function() {
			if (locations != "") {
				locations = locations + ",";
			}
			locations = locations + $(this).attr("data-id");
		});
		
		if (locations == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein oder mehrere Orte auswählen");
			return;
		}
		
		$('#searchFormPlan input[name=locations]').attr('value',locations);
		
		$.post($("#searchFormPlan").attr("action"), $("#searchFormPlan").serialize(), function(data) {
			$("#foundedPlanLoader").attr("style", "display:none");
			$("#plan .info").remove();
			$("#plan .error").remove();
			$("#calendarPlanList").remove();
			$("#plan").append(data);
		});
	},
	clickPrintOrBulletinButton: function(print,bulletinFormat) {
		$('#searchFormPlan input[name=printVersion]').attr('value',print);
		
		if (bulletinFormat !== undefined) {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value',bulletinFormat);	
		}
		else {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value','');	
		}
		
		var idx = [];
		$(".searchResultEntry input[type=checkbox]:checked").each(function(item, elem) {
		    idx.push(elem.value);
		});
		$('#searchFormPlan input[name=idx]').attr('value', idx.join());
		
		var action = $('#searchFormPlan').attr("action");
		$('#searchFormPlan').attr("action", $('#searchFormPlan').attr("data-action"));
		$('#searchFormPlan').submit();
		$('#searchFormPlan').attr("action",action);
	}
};

var digitsSearch = {
	queueSearchNKZ: function(action,contextPath,searchVal) {
		$("#foundedNKZLoader").attr("style", "");
		
		queueCommand({
			name: "ajax",
			descriptor: {
				type: 'POST',
				url: action,
				dataType: 'html',
				data: 'searchTerm='+searchVal,
				success: function (data) {
					$("#foundedNKZLoader").attr("style", "display:none");
					$("#nkzList").unbind('change');
					$("#nkzList").remove();
					$("#foundedNKZContainer").append(data);
					
					$("#nkzList option:first").attr('selected','selected');
					
					$("#nkzList").bind('change', function() {
						digitsSearch.cacheSelectedNKZ(contextPath);
					});
					
					resetCurrentCommand();
					nextCommand();
				}
			}
		});
		nextCommand();
	},
	cacheSelectedNKZ: function(contextPath) {
		var id = $("#nkzList option:selected").val();
		if (id < 0) {
			return;
		}
		var available = $("#selectedNKZ span[data-id='"+id+"']");
		if (available.length == 0) {
			var location = "<div id='"+id+"' onclick=\"digitsSearch.deleteNKZ(\'"+id+"\')\" class='innerBoxSearchNKZ'><span class='selectedNKZVal' data-id='"+id+"'>"+$('#nkzList option:selected').text()+"</span>";
			location = location + '<img src="'+contextPath+'/resources/blak/img/delete.png" data-id="'+id+'" title="L&ouml;schen"/><br data-id="'+id+'"/></div>';
			$("#selectedNKZ").append(location);
		}
	},
	deleteNKZ: function(id) {
		$("#selectedNKZ div[id='"+id+"']").remove();
		$("#selectedNKZ span[data-id='"+id+"']").remove();
		$("#selectedNKZ img[data-id='"+id+"']").remove();
		$("#selectedNKZ br[data-id='"+id+"']").remove();
	},   
	execute: function() {
		$("#foundedPlanLoader").attr("style", "");
		
		//startdate
		var startDate = $("#startDate").val();
		if (startDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Startdatum auswählen");
			return;
		}
		$('#searchFormPlan input[name=fromDate]').attr('value',$("#startDate").datepicker("getDate").getTime());

		//enddate
		var endDate = $("#endDate").val();
		if (endDate == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein Enddatum auswählen");
			return;
		}
		$('#searchFormPlan input[name=toDate]').attr('value',$("#endDate").datepicker("getDate").getTime());

		//nkz
		var nkz = "";
		$("#selectedNKZ span").each(function() {
			if (nkz != "") {
				nkz = nkz + ",";
			}
			nkz = nkz + $(this).attr("data-id");
		});
		
		if (nkz == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein oder mehrere NKZ auswählen");
			return;
		}
		
		$('#searchFormPlan input[name=digits]').attr('value',nkz);
		
		$.post($("#searchFormPlan").attr("action"), $("#searchFormPlan").serialize(), function(data) {
			$("#foundedPlanLoader").attr("style", "display:none");
			$("#plan .info").remove();
			$("#plan .error").remove();
			$("#calendarPlanList").remove();
			$("#plan").append(data);
		});
	},
	clickPrintOrBulletinButton: function(print,bulletinFormat) {
		$('#searchFormPlan input[name=printVersion]').attr('value',print);
		
		if (bulletinFormat !== undefined) {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value',bulletinFormat);	
		}
		else {
			$('#searchFormPlan input[name=bulletinFormat]').attr('value','');	
		}
		
		var idx = [];
		$(".searchResultEntry input[type=checkbox]:checked").each(function(item, elem) {
		    idx.push(elem.value);
		});
		$('#searchFormPlan input[name=idx]').attr('value', idx.join());
		
		var action = $('#searchFormPlan').attr("action");
		$('#searchFormPlan').attr("action", $('#searchFormPlan').attr("data-action"));
		$('#searchFormPlan').submit();
		$('#searchFormPlan').attr("action",action);
	}
};

var digitsCalendarSearch = {
	queueSearchNKZ: function(action,contextPath,searchVal) {
		$("#foundedNKZLoader").attr("style", "");
		
		queueCommand({
			name: "ajax",
			descriptor: {
				type: 'POST',
				url: action,
				dataType: 'html',
				data: 'searchTerm='+searchVal,
				success: function (data) {
					$("#foundedNKZLoader").attr("style", "display:none");
					$("#nkzList").unbind('change');
					$("#nkzList").remove();
					$("#foundedNKZContainer").append(data);
					
					$("#nkzList option:first").attr('selected','selected');
					
					$("#nkzList").bind('change', function() {
						digitsCalendarSearch.cacheSelectedNKZ(contextPath);
					});
					
					resetCurrentCommand();
					nextCommand();
				}
			}
		});
		nextCommand();
	},
	cacheSelectedNKZ: function(contextPath) {
		var id = $("#nkzList option:selected").val();
		if (id < 0) {
			return;
		}
		var available = $("#selectedNKZ span[data-id='"+id+"']");
		if (available.length == 0) {
			var location = "<div id='"+id+"' onclick=\"digitsSearch.deleteNKZ(\'"+id+"\')\" class='innerBoxSearchNKZ'><span class='selectedNKZVal' data-id='"+id+"'>"+$('#nkzList option:selected').text()+"</span>";
			location = location + '<img src="'+contextPath+'/resources/blak/img/delete.png" data-id="'+id+'" title="L&ouml;schen"/><br data-id="'+id+'"/></div>';
			$("#selectedNKZ").append(location);
		}
	},
	cacheSelectedNKZ: function(contextPath) {
		var id = $("#nkzList option:selected").val();
		if (id < 0) {
			return;
		}
		$(".innerBoxSearchNKZ").remove();
		var location = "<div id='"+id+"' onclick=\"digitsCalendarSearch.deleteNKZ(\'"+id+"\')\" class='innerBoxSearchNKZ'><span class='selectedNKZVal' data-id='"+id+"'>"+$('#nkzList option:selected').text()+"</span>";
		location = location + '<img src="'+contextPath+'/resources/blak/img/delete.png" data-id="'+id+'" title="L&ouml;schen"/><br data-id="'+id+'"/></div>';
		$("#selectedNKZ").append(location);
	},
	deleteNKZ: function(id) {
		$(".innerBoxSearchNKZ").remove();
	},
	execute: function() {
		$("#foundedPlanLoader").attr("style", "");
		
		//year
		$('#searchFormPlan input[name=year]').attr('value',$("#years select").val());

		//digit
		var nkz = "";
		$("#selectedNKZ span").each(function() {
			if (nkz != "") {
				nkz = nkz + ",";
			}
			nkz = nkz + $(this).attr("data-id");
		});
		
		if (nkz == '') {
			$("#foundedPlanLoader").attr("style", "display:none");
			alert("Bitte ein oder mehrere NKZ auswählen");
			return;
		}
		$('#searchFormPlan input[name=digit]').attr('value',nkz);
		
		$.post($("#searchFormPlan").attr("action"), $("#searchFormPlan").serialize(), function(data) {
			$("#foundedPlanLoader").attr("style", "display:none");
			$("#plan .info").remove();
			$("#plan .error").remove();
			$("#calendarPlanList").remove();
			$("#description").remove();
			$("#plan").append(data);
		});
	}
};

function initDatepicker(elems) {
	$(elems).datepicker({
		dateFormat: "dd.mm.yy",
		closeText: 'schließen',
		prevText: 'zur&uuml;ck',
		nextText: 'Vor',
		currentText: 'heute',
		monthNames: ['Januar','Februar','M&auml;rz','April','Mai','Juni', 'Juli','August','September','Oktober','November','Dezember'],
		monthNamesShort: ['Jan','Feb','M&auml;r','Apr','Mai','Jun', 'Jul','Aug','Sep','Okt','Nov','Dez'],
		dayNames: ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],
		dayNamesShort: ['So','Mo','Di','Mi','Do','Fr','Sa'],
		dayNamesMin: ['So','Mo','Di','Mi','Do','Fr','Sa'],
		firstDay: 1,
		weekHeader: 'Wo'
	});
	$(elems).each(function() {
		var datValue = $(this).attr('data-value');
		$(this).attr('value', datValue);
	});
}

/**
 * liest die GET-Parameter aus und gibt ein assoziatives Array zurück
 */
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//define the command queue
var commandQueue = [];
var currentCommand = null;
function nextCommand() {
    if (commandQueue.length == 0 || currentCommand != null) {
		return;
	}
	currentCommand = commandQueue.shift();
	if (currentCommand.name == 'ajax') {
		$.ajax(currentCommand.descriptor);
	}
}
function queueCommand(command) {
    commandQueue.push(command);
}
function resetCurrentCommand() {
	currentCommand = null;
}