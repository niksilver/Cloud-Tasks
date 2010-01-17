// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * General utility functions
 */

var Utils = {
	
	/**
	 * Return a shallow clone of obj.
	 * Like Prototype's Object.clone(), but if obj is undefined
	 * then returns undefined.
	 * @param {Object} obj  The object to clone.
	 */
	clone: function(obj) {
		if (typeof obj === 'undefined') {
			return undefined;
		}
		else if (typeof obj === 'number') {
			return obj;
		}
		else if (typeof obj === 'string') {
			return new String(obj);
		}
		else if (typeof obj === 'boolean') {
			return obj;
		}
		else if (obj instanceof Array) {
			var arr = [];
			for (var i = 0; i < obj.length; i++) {
				arr.push(obj[i]);
			}
			return arr;
		}
		else {
			return Object.clone(obj);
		}
	}
}
