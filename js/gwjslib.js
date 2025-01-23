"use strict";

/* Allgemeine Funktionen */

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

function getIndexBySomeKey(something, keyname, keyvalue) {
	if(typeof something != 'Object' || something.length < 1) {
//		return null;
	}
	var i = something.reduce(function(cur, val, index ) {
			if(val[keyname] == keyvalue && cur === -1 ) {
				return index;
			}
			return cur;
    }, -1 );
    return (i);
}

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

function prec(number, precision) {
	if(typeof precision == 'undefined') {
		var p = 2;		
	} else {
		var p = Math.round(precision);
	}
	
	const f = Math.pow(10, p);
	
	return (Math.round(number*f)/f);
}

function getSomethingBySomeKey(something, keyname, keyvalue) {	
    var i = getIndexBySomeKey(something, keyname, keyvalue);
    return (i > -1 ? something[i] : null);
}

function getSomethingById(something, id) {	
    var i = getIndexById(something, id);
    return (i > -1 ? something[i] : null);
}

function sortBySomething(k,a,b) {
		if(a[k] < b[k]) {
			return -1;
		} else if(a[k] > b[k]) {
			return 1;
		} else {
			return 0;
		}		
}

function setSortkey(element, priority) {
	
	var e = $(element);
	
	if(!e.length) {
		return;
	}
	
	var prio = priority * 10;
	var sortkey = prio.toString() + e.text().replace(' ','').toUpperCase();
	var old_prio = e.data('priority');
	
	if(typeof old_prio == 'undefined' || prio < old_prio) {
		e.data('priority', prio);
		return e.data('sortkey', sortkey);
	}
	
	return e;
}

function sortLiByText(a, b) {
   var compA = $(a).text().toUpperCase();
   var compB = $(b).text().toUpperCase();
   return compA.localeCompare(compB);
}

function sortLiBySortkey(a, b) {
	var compA = $(a).data('sortkey');
	var compB = $(b).data('sortkey');
	if(typeof compA == 'undefined' || typeof compA == 'undefined') {
		return sortLiByText(a, b);		
	}
	compA = compA.toUpperCase();
	compB = compB.toUpperCase();
	return compA.localeCompare(compB);
}

function escapeHTML(str) {
	
	if(typeof str != 'String') {
		str = "" + str;
	}
		
		var __entityMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': '&quot;',
			"'": '&#39;',
			"/": '&#x2F;'
		};
		
		return str.replace(/[&<>"'\/]/g, function (s) {
			return __entityMap[s];
		});
	}

let debugbox_counter = 0;
let debugbox_contentmode = 'none'; // xml, code
let debugbox_maxdepth = -1;

function debug2box(v, h, maxdepth, contentmode, box, currentdepth) {
	if(!debug_mode) { return; }
		
	let vtype = typeof v;
	
	//console.log('debug2box: Variable type is '+ vtype);
	
	if(typeof h != 'undefined') {
		h = h + ' (' + vtype + ')';
	} else if(vtype == 'object') {
		h = v.constructor.name + ': ' + v.name;
	} else {
		h = vtype;		
	}
	
	if(typeof contentmode == 'undefined') {
		contentmode = debugbox_contentmode;
	}
	
	if(typeof maxdepth == 'undefined') {
		maxdepth = debugbox_maxdepth;
	}
	
	if(typeof currentdepth == 'undefined') {
		currentdepth = 1;
	} else {
		currentdepth = currentdepth + 1;
	}
	
	let contentbox = box;
	
	++debugbox_counter;
	
	if(typeof box != 'object') {
		box = $('<div>', {'id':'debugbox_'+debugbox_counter,'class':'debugbox card'}).appendTo('#debugbox');
		let boxheader = $('<div>',{'class':'card-header'}).appendTo(box);
		$('<h2>',{'class':'debug_title', 'data-toggle':'collapse', 'data-target':'#debugcontent_'+debugbox_counter,'aria-expanded':'false','aria-controls':'debugcontent_'+debugbox_counter}).appendTo(boxheader).append(h);
		contentbox = $('<div>', {'id':'debugcontent_'+debugbox_counter,'class':'debug_content card-body collapse'}).appendTo(box);
		/* box.click(function() { contentbox.toggle(); }); */
	} 
	
	if(v === null) {
		contentbox.append('<i>NULL</i>');
	} else if(vtype == 'object') {
		
		if(v.constructor.name == 'XMLDocument') {
			const serializer = new XMLSerializer();
			const xmlStr = serializer.serializeToString(v);
			contentbox.append("\n\t<pre>\n\t\t<code>\n" + escapeHTML(formatXML(xmlStr)) + "\n\t\t</code>\n\t</pre>");	
		} else {
		
			if(maxdepth > 0 && currentdepth >= maxdepth) {
				contentbox.append(v.constructor.name + ' (' + vtype + ')');
			} else {
				
				var ul = $('<ul>').appendTo(contentbox);
				var li;
				
				if(Array.isArray(v)) {
					
					for(var i = 0; i < v.length; ++i) {
						li = $('<li>').appendTo(ul).append('<b>'+i+':</b> ');
						debug2box(v[i], h, maxdepth, contentmode, li, currentdepth);				
					}				
				} else {
					for(var e in v) {
						li = $('<li>').appendTo(ul).append('<b>'+e+':</b> ');
						debug2box(v[e], h, maxdepth, contentmode, li, currentdepth);					
					}
				}
			}
		}
	} else if(vtype == 'function') {
		contentbox.append('Function: ' + v.name);
	} else {
		
		if(contentmode == 'json') {
			contentbox.append(JSON.stringify(v) + ' (' + vtype + ')');
		} else if(contentmode == 'code') {
			contentbox.append("\n\t<pre>\n\t\t<code>\n" + escapeHTML(v) + "\n\t\t</code>\n\t</pre>\n<br />");
		} else {
			contentbox.append(escapeHTML(v));
		}		
	}	
	//$('#debugbox').append("<h2>"+h+ "</h2><tt><pre>" + JSON.stringify(v)+"</pre></tt><br />");
}

function formatXML(xml, spacer) {
	
	if(typeof spacer == 'undefined') {
		spacer = "\t";
	}
    var reg = /(>)(<)(\/*)/g;
    var wsexp = / *(.*) +\n/g;
    var contexp = /(<.+>)(.+\n)/g;
    xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2');
    var pad = 0;
    var formatted = '';
    var lines = xml.split('\n');
    var indent = 0;
    var lastType = 'other';
    // 4 types of tags - single, closing, opening, other (text, doctype, comment) - 4*4 = 16 transitions 
    var transitions = {
        'single->single'    : 0,
        'single->closing'   : -1,
        'single->opening'   : 0,
        'single->other'     : 0,
        'closing->single'   : 0,
        'closing->closing'  : -1,
        'closing->opening'  : 0,
        'closing->other'    : 0,
        'opening->single'   : 1,
        'opening->closing'  : 0, 
        'opening->opening'  : 1,
        'opening->other'    : 1,
        'other->single'     : 0,
        'other->closing'    : -1,
        'other->opening'    : 0,
        'other->other'      : 0
    };

    for (var i=0; i < lines.length; i++) {
        var ln = lines[i];
        var single = Boolean(ln.match(/<.+\/>/)); // is this line a single tag? ex. <br />
        var closing = Boolean(ln.match(/<\/.+>/)); // is this a closing tag? ex. </a>
        var opening = Boolean(ln.match(/<[^!].*>/)); // is this even a tag (that's not <!something>)
        var type = single ? 'single' : closing ? 'closing' : opening ? 'opening' : 'other';
        var fromTo = lastType + '->' + type;
        lastType = type;
        var padding = '';

        indent += transitions[fromTo];
        for (var j = 0; j < indent; j++) {
            padding += spacer;
        }

        formatted += padding + ln + '\n';
    }

    return formatted;
}

function parseXML(dom) {
	
	let result = {};
    
	for (let node of dom.childNodes) {
		
		let name = node.nodeName;
		
		if (name == "#text") {
            return node.nodeValue.trim();
        } else {
        	let ret = parseXML(node);
        	let sub = result[name];
        	if(typeof sub == 'undefined') {
        		result[name] = ret;
        	} else {
        		if(!Array.isArray(sub)) {
        			result[name] = [sub];        			
        		}
        		result[name].push(ret);
        	}
        }
    }
	
    return result;
}

