// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Utility class to translate ical recurrence structures to a human readable form.
 * See http://www.rememberthemilk.com/help/answers/basics/repeatformat.rtm
 */

var RecurrenceTranslator = {
	
	/**
	 * Convert a string like "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE" into an object
	 * like { FREQ: "WEEKLY", INTERVAL: "1" BYDAY: "WE" }
	 * @param {Object} str
	 */
	codeStringToObject: function(str) {
		var pairs = str.split(';');
		var obj = {};
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			var key = pair[0];
			var value = pair[1];
			if (value.indexOf(',') >= 0) {
				obj[key] = value.split(',');
			}
			else {
				obj[key] = value;
			}
		}
		return obj;
	},
	
	dayCodeToDay: {
		"MO": "Monday",
		"TU": "Tuesday",
		"WE": "Wednesday",
		"TH": "Thursday",
		"FR": "Friday",
		"SA": "Saturday",
		"SU": "Sunday"
	},
	
	/**
	 * Take a recurrence code object such as 
	 * {"every": "1", "$t": "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE"}
	 * and return the human-readable text string
	 * (in this case "Every Wednesday").
	 * @param {Object} code_obj
	 */
	toText: function(obj) {
		var data = RecurrenceTranslator.codeStringToObject(obj["$t"]);
		data.every = obj.every;
		if (data.every == "1" && data.FREQ == "WEEKLY") {
			return RecurrenceTranslator.everyWeekByDay(data);
		}
		
		return "Unknown recurrence code";
	},
	
	everyWeekByDay: function(data) {
		var day_part;
		if (typeof data.BYDAY == 'string') {
			day_part = RecurrenceTranslator.dayCodeToDay[data.BYDAY];
		}
		else {
			var days = data.BYDAY.map(function(code) { return RecurrenceTranslator.dayCodeToDay[code] });
			day_part = RecurrenceTranslator.joinWithCommasAndAnd(days);
		}
		
		return "Every " + day_part;
	},
	
	/**
	 * Take an array of strings, and return a string in which the strings are joined
	 * with ", " apart from the last two, which are joined with " and ".
	 * @param {Object} arr  An array of strings.
	 */
	joinWithCommasAndAnd: function(arr) {
		var out = '';
		var max_index = arr.length - 1;
		var index_before_and = max_index - 1;
		for (var i = 0; i <= max_index; i++) {
			out += arr[i];
			if (i == index_before_and) {
				out += ' and ';
			}
			else if (i < index_before_and) {
				out += ", ";
			}
		}
		return out;
	}
}
