#!/usr/bin/python3
# -*- coding: utf-8 -*-

""" This script parses Notdienst ics data into json
"""

import os, re
from icalendar import Calendar, Event
from datetime import datetime
from pytz import UTC # timezone
from pathlib import Path
import json 

notdienste = {}
jsonfile = "notdienste.json"
datadir = "../data"
dir_list = os.listdir(datadir)
for icsfilename in dir_list:
	if icsfilename.endswith(".ics"):
		print(icsfilename, ":")
		x = re.search("^Notdienste von (\d{4}) für (.+)\.ics", icsfilename)
		year = x.group(1)
		#if year not in notdienste:
		#	notdienste[year] = {}
		apo = x.group(2)
		icspath = Path(datadir+'/'+icsfilename)
		calendar = Calendar.from_ical(icspath.read_bytes())
		l = []
		for component in calendar.walk():
			if component.name == "VEVENT":
				d = component.get('dtstart').dt.strftime("%d.%m.%Y")
				l.append(d)
				print(d)
		#notdienste[year][apo] = l
		notdienste[apo] = l
jsondata = json.dumps(notdienste)
with open(os.path.join(datadir, jsonfile), "w") as f:
	f.write(jsondata)
print("\n..done!")
#print(jsondata)			
		