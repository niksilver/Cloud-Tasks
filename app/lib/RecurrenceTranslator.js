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
	 * Note the following keys always gets translated into an array:
	 * BYDAY, BYMONTHDAY
	 * @param {Object} str
	 */
	codeStringToObject: function(str) {
		var pairs = str.split(';');
		var obj = {};
		for (var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split('=');
			var key = pair[0];
			var value = pair[1];
			if (key == 'BYDAY' || key == 'BYMONTHDAY') {
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
		var match = day_code.match(/^(-?\d*)([A-Z]*)/); // Matching e.g. 2MO or just MO
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
	 * This also handles "until (date)".
	 * @param {Object} obj  The recurrence object from the server.
	 *     E.g. { "every": 1, "$t": "FREQ=YEARLY;INTERVAL=1" }
	 */
	toText: function(obj) {
		var basic_text = this.toBasicText(obj);
		
		var data = this.codeStringToObject(obj["$t"]);
		if (!data.UNTIL) {
			return basic_text;
		}
		
		var until_date = this.untilParameterToText(data.UNTIL);
		return basic_text + " until " + until_date;
	},
	
	/** Return the UNTIL parameter as a human-readable string.
	 * E.g. "Tue 2 March 2010"
	 * @param {String} until_str  The UNTIL parameter, e.g. "20100302T000000".
	 */
	untilParameterToText: function(until_str) {
		var until_date = until_str.substr(0, 8);
		return Date.parseExact(until_date, 'yyyyMMdd').toString('ddd d MMM yyyy');
	},
	
	/**
	 * Take a basic recurrence code object such as 
	 * {"every": "1", "$t": "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE"}
	 * and return the human-readable text string
	 * (in this case "Every Wednesday").
	 * This function ignores any "until (date)".
	 * @param {Object} obj  The recurrence object from the server.
	 *     E.g. { "every": 1, "$t": "FREQ=YEARLY;INTERVAL=1" }
	 */
	toBasicText: function(obj) {
		var data = this.codeStringToObject(obj["$t"]);
		data.every = obj.every;
		if (data.every == "1" && data.FREQ == 'DAILY') {
			return this.everyDay(data);
		}
		else if (data.every == "1" && data.FREQ == "WEEKLY" && !data.BYDAY) {
			return this.everyNWeeks(data);
		}
		else if (data.every == "1" && data.FREQ == "WEEKLY" && data.INTERVAL == "1") {
			return this.everyWeekByDay(data);
		}
		else if (data.every == "1" && data.FREQ == "WEEKLY" && data.INTERVAL >= 2) {
			return this.everyWeekByNthDay(data);
		}
		else if (data.every == "1" && data.FREQ == "MONTHLY" && data.BYMONTHDAY) {
			return this.everyMonthOnTheXth(data);
		}
		else if (data.every == "1" && data.FREQ == "MONTHLY" && data.BYDAY) {
			return this.everyMonthOnTheXthBlahday(data);
		}
		else if (data.every == "1" && data.FREQ == "MONTHLY") {
			return this.everyNMonths(data);
		}
		else if (data.every == "1" && data.FREQ == "YEARLY") {
			return this.everyNYears(data);
		}

		
		return "Unknown recurrence code";
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=DAILY
	 */
	everyDay: function(data) {
		return "Every day";
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=WEEKLY (and optional INTERVAL=xxx)
	 */
	everyNWeeks: function(data) {
		if (data.INTERVAL >= 2) {
			return "Every " + data.INTERVAL + " weeks";
		}
		else {
			return "Every week";
		}
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=MONTHLY (and optional INTERVAL=xxx)
	 */
	everyNMonths: function(data) {
		if (data.INTERVAL >= 2) {
			return "Every " + data.INTERVAL + " months";
		}
		else {
			return "Every month";
		}
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=MONTHLY;BYMONTHDAY=xxx
	 */
	everyMonthOnTheXth: function(data) {
		var ordinal_array = data.BYMONTHDAY.map(this.toOrdinal.bind(this));
		var ordinal_text = this.joinWithCommasAndAnd(ordinal_array);
		return "Every month on the " + ordinal_text;
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=MONTHLY;BYDAY=xxx
	 */
	everyMonthOnTheXthBlahday: function(data) {
		var day_text_array = data.BYDAY.map(this.dayCodeToText.bind(this)); //this.dayCodeToText(data.BYDAY[0]);
		var day_text = this.joinWithCommasAndAnd(day_text_array);
		return "Every month on the " + day_text;
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=YEARLY (and optional INTERVAL=xxx)
	 */
	everyNYears: function(data) {
		if (data.INTERVAL >= 2) {
			return "Every " + data.INTERVAL + " years";
		}
		else {
			return "Every year";
		}
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=WEEKLY;INTERVAL=1;BYDAY=xxx,xxx
	 */
	everyWeekByDay: function(data) {
		if (this.hasAllWeekdaysOnly(data)) {
			return "Every weekday";
		}

		var inst = this;
		var days = data.BYDAY.map(this.dayCodeToText.bind(this));
		var days_text = this.joinWithCommasAndAnd(days)
		return "Every " + days_text;
	},
	
	hasAllWeekdaysOnly: function(data) {
		var days = data.BYDAY;
		if (days.length == 5
			&& days.indexOf('MO') >= 0
			&& days.indexOf('TU') >= 0
			&& days.indexOf('WE') >= 0
			&& days.indexOf('TH') >= 0
			&& days.indexOf('FR') >= 0)
		{
			return true;
		}
		else {
			return false;
		}
	},
	
	/**
	 * Interpret an "every" rule,
	 * with data of the form FREQ=WEEKLY;INTERVAL=1;BYDAY=xxx,xxx
	 */
	everyWeekByNthDay: function(data) {
		var inst = this;
		var ordinal = this.toOrdinal(data.INTERVAL);
		var days = data.BYDAY.map(this.dayCodeToText.bind(this));
		return "Every " + ordinal + " " + this.joinWithCommasAndAnd(days);
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
		var optional_last_suffix = (cardinal < 0) ? " last" : "";
		abs_cardinal = Math.abs(cardinal);
		var mod10 = abs_cardinal % 10;
		var tens = abs_cardinal % 100 - mod10;
		
		if (tens == 10) {
			// 10-19
			return abs_cardinal + "th" + optional_last_suffix;
		}
		
		if (cardinal == -1) {
			return "last";
		}
		else if (mod10 == 1) {
			return abs_cardinal + "st" + optional_last_suffix;
		}
		else if (mod10 == 2) {
			return abs_cardinal + "nd" + optional_last_suffix;
		}
		else if (mod10 == 3) {
			return abs_cardinal + "rd" + optional_last_suffix;
		}
		return abs_cardinal + "th" + optional_last_suffix;
	}
}
