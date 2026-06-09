"use strict";
/*
let debug_mode = false;
let admin_mode = false;
*/

const nd_json_url = './data/notdienste.json';
const api_url = './getdata.php';

const locations = [
	{'id':'ESB', 'c':'E', 'name': 'Apotheke Schug Eschenbach', 'plz':'92676', 'street':'Karlsplatz 10', 'location':'Eschenbach', 'lat':49.754469, 'lon':11.830417799999964, 'drugstoreId':3523},
	{'id':'WESB', 'c':'W', 'name': 'Apotheke Schug Windischeschenbach', 'plz':'92670', 'street':'Hauptstraße 64', 'location':'Windischeschenbach', 'lat':49.7988978, 'lon':12.156768100000022, 'drugstoreId':4380},
	{'id':'KEM', 'c':'K', 'name': 'Apotheke Schug am Turm', 'plz':'95478', 'street':'Stadtplatz 46', 'location':'Kemnath', 'lat':49.8665658, 'lon':11.9356914, 'drugstoreId':1303},
	{'id':'AEWEN', 'c':'Ä', 'name': 'Apotheke Schug im Ärztehaus', 'plz':'92637', 'street':'Moosbürger Str. 13', 'location':'Weiden i.d.OPf.', 'lat':49.67435200000001, 'lon':12.1489451, 'drugstoreId':4206},
];

moment.locale('de');

const wochentage =  moment.weekdays(); /* ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']; */
const wtage = moment.weekdaysShort(); /* ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']; */
const defaultrange = 20;
const katholic = true;

const disclaimer = 'Der Apotheken-Notdienstplan der örtlichen Apotheken in Bayern wird durch die Bayerische Landesapothekerkammer, Maria-Theresia-Str. 28, 81675 München zur Verfügung gestellt. Bitte beachten Sie das dortige Impressum, den Haftungsausschluss und die Datenschutzhinweise der Bayerischen Landesapothekerkammer.';
const disclaimer_qr = 'img/blak-url.png';
const ipinfourl = ['http://10.66.167.88/lib/ip-info.php', 'https://intern.apotheke-schug.de/ip-info/']; 

const overlay_duration = 30; //Sekunden
const overlay_period = 270; //Sekunden

const overlay_data = [
	{'id':'KEM','images':[
			'amamed-Digitale-Werbebanner-1080x1920px-Full-HD-quer-FINAL-01.jpg',
			'amamed-Digitale-Werbebanner-1080x1920px-Full-HD-quer-FINAL-02.jpg',
			'amamed-Digitale-Werbebanner-1080x1920px-Full-HD-quer-FINAL-03.jpg',
			'amamed-Digitale-Werbebanner-1080x1920px-Full-HD-quer-FINAL-04.jpg'			
	]}	
];

const banner_data = [
	{'id':'KEM','image':'amamed-App-Banner-1500x350px-Variante-3.jpg', 'qrcode':'amamed_qr_kem.png'}
];
