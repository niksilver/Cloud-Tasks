/**
 * General utilities for our tests.
 */

var Utils = {
		
	// Adapted from http://www.lshift.net/blog/2006/08/03/subclassing-in-javascript-part-2
	extend: function(superclass, prototype) {
	    var res = function () {
	        superclass.apply(this, arguments);
	    };
	    var withoutcon = function () {};
	    withoutcon.prototype = superclass.prototype;
	    res.prototype = new withoutcon();
	    for (var k in prototype) {
	        res.prototype[k] = prototype[k];
	    }
	    return res;
	}

}
