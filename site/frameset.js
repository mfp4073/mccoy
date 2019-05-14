/*
	parseUri 1.2.1
	(c) 2007 Steven Levithan <stevenlevithan.com>
	MIT License
*/
function parseUri (str) {
	var o = parseUri.options,
		m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

// Load framed Second Site pages in proper frame 
// Special version for frameset pages only

function addLoadListener(fn) {
	if (typeof window.addEventListener != 'undefined') {
		window.addEventListener('load', fn, false);

	}	else if (typeof document.addEventListener != 'undefined') {
		document.addEventListener('load', fn, false);

	} else if (typeof window.attachEvent != 'undefined') {
		window.attachEvent('onload', fn);

	} else {
		var oldfn = window.onload;
		if (typeof window.onload != 'function') {
			window.onload = fn;
		} else {
			window.onload = function() {
				oldfn();
				fn();
			};
		};
	};
};

function ssFramer() {
	var kFrameset = "index.htm";
	var parentUri = parseUri(parent.location.href);
	var windowUri = parseUri(window.location.href);

	if (windowUri.file == '' ||
			windowUri.file.toLowerCase() == kFrameset) {
		// Handle parent page
		// Argument format: ?framename1=uri;anchor&framename2=uri;anchor...
		// Ex: ?ssmain=p1.htm;i32&ssindex=i1.htm;s37
		// Loads: p1.htm#i32 in frame "ssmain"
		// Loads: i1.htm#s37 in frame "ssindex"

		// Process frame arguments
		for (var sArg in windowUri.queryKey) {
			// Get frame URIs from frame name/anchor arguments
			var parts = windowUri.queryKey[sArg].split(';');
			window.frames[sArg].location.href = parts[0]+(parts.length>1 ? '#'+parts[1] : '');
		};
	};
};

addLoadListener(ssFramer);