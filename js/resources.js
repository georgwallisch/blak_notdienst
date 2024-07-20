"use strict";
/*
let debug_mode = false;
let admin_mode = false;
*/

const nd_url = 'https://lak-bayern.notdienst-portal.de/blakportal/';
const api_url = 'np_api.php';

const locations = [
	{'id':'ESB', 'name': 'Apotheke Schug', 'locations':'92676;Eschenbach', 'location':'92676 Eschenbach', 'lat':49.754469, 'lon':11.830417799999964, 'drugstoreId':3523},
	{'id':'WESB', 'name': 'Apotheke Schug', 'locations':'92670;Windischeschenbach', 'location':'92670 Windischeschenbach', 'lat':49.7988978, 'lon':12.156768100000022, 'drugstoreId':4380},
	{'id':'KEM', 'name': 'Apotheke Schug am Turm', 'locations':'95478;Kemnath', 'location':'95478 Kemnath', 'lat':49.8665658, 'lon':11.9356914, 'drugstoreId':1303},
	{'id':'AEWEN', 'name': 'Apotheke Schug im Ärztehaus', 'locations':'92637;Weiden', 'location':'92637 Weiden in der Oberpfalz', 'lat':49.67435200000001, 'lon':12.1489451, 'drugstoreId':4206},
];

moment.locale('de');

const wochentage =  moment.weekdays(); /* ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']; */
const wtage = moment.weekdaysShort(); /* ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']; */
const defaultrange = 20;