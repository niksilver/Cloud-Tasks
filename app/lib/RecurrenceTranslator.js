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
			day_part = '';
			var day_codes = data.BYDAY;
			var max_index = day_codes.length - 1;
			var index_before_and = max_index - 1;
			for (var i = 0; i <= max_index; i++) {
				day_part += RecurrenceTranslator.dayCodeToDay[day_codes[i]];
				if (i == index_before_and) {
					day_part += ' and ';
				}
				else if (i < index_before_and) {
					day_part += ", ";
				}
			}
		}
		
		return "Every " + day_part;
	}
}
