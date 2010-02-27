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
			obj[pair[0]] = pair[1];
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
		return "Every " + RecurrenceTranslator.dayCodeToDay[data.BYDAY];
	}
}
