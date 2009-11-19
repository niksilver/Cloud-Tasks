var Utils = {
	dump: function(obj) {
		var out = "";
		if (Object.isArray(obj)) {
			out += "[";
			for (var i = 0; i < obj.length; i++) {
				out += Utils.dump(obj[i]);
				if (i < obj.length - 1) {
					out += ", ";
				}
			}
			out += "]";
		}
		else if (Object.isString(obj)) {
			out += "'" + obj + "'";
		}
		else if (Object.isNumber(obj) || Object.isFunction(obj)) {
			out += obj;
		}
		else if (Object.isUndefined(obj)) {
			out += "undefined";
		}
		else {
			out += "{";
			var keys = Object.keys(obj).sort();
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i]
				out += key + ": " + Utils.dump(obj[key]);
				if (i < keys.length - 1) {
					out += ", ";
				}
			}
			out += "}";
		}
		return out;
	}
};
