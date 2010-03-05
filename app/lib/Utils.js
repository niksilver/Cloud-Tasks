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
	},
	
	/**
	 * Get a value buried deep within an object.
	 * First parameter is the object.
	 * Subsequent parameters are string property names.
	 * E.g. Utils.get(obj, 'rsp', 'list', 'series') will return obj.rsp.list.series;
	 * Will return undefined if any of the properties of any depth do not exist.
	 * If no property names are given returns obj.
	 */
	get: function(obj) {
		var i = 1;
		while (i < arguments.length) {
			if (typeof obj !== 'object') {
				return undefined;
			}
			obj = obj[arguments[i]];
			i++;
		}
		return obj;
	},
	
	/**
	 * Return a new ID with each call.
	 */
	getNextID: function() {
		var id_cookie = new Mojo.Model.Cookie('nextID');
		var next_id = id_cookie.get();
		if (!next_id) {
			next_id = 0;
		}
		id_cookie.put(next_id+1);
		return next_id;
	},
	
	/**
	 * Erase the store of the next ID. Private function, to be used
	 * for tests only.
	 */
	_eraseNextIDCookie: function() {
		var id_cookie = new Mojo.Model.Cookie('nextID');
		id_cookie.remove();
	},
	
	/**
	 * Run a function several times, each time feeding it the next few elements of an array.
	 * After the first time the function is called each subsequent call is deferred
	 * (see Prototype's defer() method) so that another routine or event can be handled.
	 * When the array is entirely processed then a final function is run.
	 * @param {Array} array  The array which is to be fed into the function, slice by slice.
	 * @param {Number} size   The size of each slice of the array which must be passed into the function.
	 * @param {Function} array_func  The function which handles the array. It must take one parameter,
	 *     which is the an array. It will be fed the next slice of the array each time.
	 * @param {Function} final_func  The function which will be run when the array has been
	 *     entirely fed into the array function.
	 */
	splitAndDefer: function(array, size, array_func, final_func) {
		var first = array.slice(0, size);
		var rest;
		if (array.length > size) {
			rest = array.slice(size);
		}
		array_func(first);
		if (rest) {
			(function() { Utils.splitAndDefer(rest, size, array_func, final_func) }).defer();
		}
		else {
			final_func.defer();
		}
	}
}
