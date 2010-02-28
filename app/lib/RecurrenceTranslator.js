// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Utility class to translate ical recurrence structures to a human readable form.
 * See http://www.rememberthemilk.com/help/answers/basics/repeatformat.rtm
 */

var RecurrenceTranslator = {
	
	/**
	 * Convert a string like "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE" into an object
	 * like { FREQ: "WEEKLY", INTERVAL: "1" BYDAY: ["WE"] }.
	 * Note BYDAY always gets translated into an array.
	 * @param {Object} str
	 */
	codeStringToObject: function(str) {
		var pairs = str.split(';');
		var obj = {};
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			var key = pair[0];
			var value = pair[1];
			if (key == 'BYDAY') {
				obj[key] = value.split(',');
			}
			else {
				obj[key] = value;
			}
		}
		return obj;
	},
	
	dayCodeToDayHash: {
		"MO": "Monday",
		"TU": "Tuesday",
		"WE": "Wednesday",
		"TH": "Thursday",
		"FR": "Friday",
		"SA": "Saturday",
		"SU": "Sunday"
	},
	
	/**
	 * Take a day code such as "TU" or "2SA" and return a human-readable translation,
	 * e.g. "Tuesday" or "2nd Saturday"
	 * @param {String} day_code  The day code to translate.
	 */
	dayCodeToText: function(day_code) {
		var match = day_code.match(/^(\d*)([A-Z]*)/); // Matching e.g. 2MO or just MO
		var numeric = match[1];
		var text = match[2];
		var day_name = this.dayCodeToDayHash[text];
		if (!numeric) {
			return day_name;
		}
		else {
			return this.toOrdinal(numeric) + " " + day_name;
		}
	},
	
	/**
	 * Take a recurrence code object such as 
	 * {"every": "1", "$t": "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE"}
	 * and return the human-readable text string
	 * (in this case "Every Wednesday").
	 * @param {Object} code_obj
	 */
	toText: function(obj) {
		var data = this.codeStringToObject(obj["$t"]);
		data.every = obj.every;
		if (data.every == "1" && data.FREQ == "WEEKLY") {
			return this.everyWeekByDay(data);
		}
		
		return "Unknown recurrence code";
	},
	
	everyWeekByDay: function(data) {
		var inst = this;
		var days = data.BYDAY.map(function(code) { return inst.dayCodeToText(code) });
		return "Every " + this.joinWithCommasAndAnd(days);
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
	},
	
	/**
	 * Take a cardinal (e.g. 2) and generate the ordinal (e.g. "2nd").
	 * @param {String} cardinal  The cardinal number.
	 */
	toOrdinal: function(cardinal) {
		var mod10 = cardinal % 10;
		var tens = cardinal % 100 - mod10;
		
		if (tens == 10) {
			// 10-19
			return cardinal + "th";
		}
		
		if (mod10 == 1) {
			return cardinal + "st";
		}
		else if (mod10 == 2) {
			return cardinal + "nd";
		}
		else if (mod10 == 3) {
			return cardinal + "rd";
		}
		return cardinal + "th";
	}
}
