"use strict";
/*
let debug_mode = false;
let admin_mode = false;
*/

/*
const nd_url = 'https://lak-bayern.notdienst-portal.de/blakportal/';
const api_url = 'np_api.php';
*/

//const nd_qr = 'img/ndportal-url.png';

const api_urls = [
	{'id':'KEM','url':'https://notdienst.sberg.net/api/apipub/notdienst/xmlschnittstelle/QUENGwcAFURCQl9HWUwFeGd2TVZGW1pPV14MdmxwSUJDVwl_ZH9kfnF9aF5CQ1pURF1mQ1pQHwVXV05YUVBedVxMTFBHYExbf0VeDRJIR0FGQVNKVF5jXRoWVElRXQkDHhYIEQEeBBcIChYfAQcDGA0eSVdeQBwNBA0JGwwUCAYeCg4fDBITHRAFUERfSU9QS05iXWpYS0ZYCQEGHQgbTE5YUWZcQkNdRVlMCA=='},
	{'id':'ESB','url':'https://notdienst.sberg.net/api/apipub/notdienst/xmlschnittstelle/QUENGwAPEkRCQl9HWUwFeGd2TVZGW1pPV14MdmxwSUJDVwl_ZH9kfnF9aF5CQ1pURF1mQ1pQHwVXV05YUVBedVxMTFBHYExbf0VeDRJIR0FGQVNKVF5jXRoWVElRXQkDHhYHEgoZDxAMChYfAQcDGA0eSVdeQBwNBA0JEQwdAQseCg4fDBITHRAFUERfSU9QS05iXWpYS0ZYCR8HUUhHSnxRWUFQU05RGw=='},
	{'id':'WESB','url':'https://notdienst.sberg.net/api/apipub/notdienst/xmlschnittstelle/QUENGwAPEURCQl9HWUwFeGd2TVZGW1pPV14MdmxwSUJDVwl_ZH9kfnF9aF5CQ1pURF1mQ1pQHwVXV05YUVBedVxMTFBHYExbf0VeDRJIR0FGQVNKVF5jXRoWVElRXQkDHhYHEgoZDxAMChYfAQcDGA0eSVdeQBwNBA0JEQwdAQseCg4fDBITHRAFUERfSU9QS05iXWpYS0ZYCR8HUUhHSnxRWUFQU05RGw=='},
	{'id':'AEWEN','url':'https://notdienst.sberg.net/api/apipub/notdienst/xmlschnittstelle/QUENGwAPEERCQl9HWUwFeGd2TVZGW1pPV14MdmxwSUJDVwl_ZH9kfnF9aF5CQ1pURF1mQ1pQHwVXV05YUVBedVxMTFBHYExbf0VeDRJIR0FGQVNKVF5jXRoWVElRXQkDHhYGEAwdAxAIChYfAQcDGQ0eSVdeQBwNBw0AFwwVBAsbCg4fDBITHRAFUERfSU9QS05iXWpYS0ZYCR8HUUhHSnxRWUFQU05RGw=='}
];

const locations = [
	{'id':'ESB', 'name': 'Apotheke Schug', 'locations':'92676;Eschenbach', 'street':'Karlsplatz 10', 'location':'92676 Eschenbach', 'lat':49.754469, 'lon':11.830417799999964, 'drugstoreId':3523},
	{'id':'WESB', 'name': 'Apotheke Schug', 'locations':'92670;Windischeschenbach', 'street':'Hauptstraße 64', 'location':'92670 Windischeschenbach', 'lat':49.7988978, 'lon':12.156768100000022, 'drugstoreId':4380},
	{'id':'KEM', 'name': 'Apotheke Schug am Turm', 'locations':'95478;Kemnath', 'street':'Stadtplatz 46', 'location':'95478 Kemnath', 'lat':49.8665658, 'lon':11.9356914, 'drugstoreId':1303},
	{'id':'AEWEN', 'name': 'Apotheke Schug im Ärztehaus', 'locations':'92637;Weiden', 'street':'Moosbürger Str. 13', 'location':'92637 Weiden in der Oberpfalz', 'lat':49.67435200000001, 'lon':12.1489451, 'drugstoreId':4206},
];

moment.locale('de');

const wochentage =  moment.weekdays(); /* ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']; */
const wtage = moment.weekdaysShort(); /* ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']; */
const defaultrange = 20;
const katholic = true;

const disclaimer = 'Der Apotheken-Notdienstplan der örtlichen Apotheken in Bayern wird durch die Bayerische Landesapothekerkammer, Maria-Theresia-Str. 28, 81675 München zur Verfügung gestellt. Bitte beachten Sie das dortige Impressum, den Haftungsausschluss und die Datenschutzhinweise der Bayerischen Landesapothekerkammer.';
const disclaimer_qr = 'img/blak-url.png';