// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * General utilities for our tests.
 */

var TestUtils;

YUI().use('test', function(Y){

	TestUtils = {
			
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
		},
		
		assertContains: function(string_to_test, substring_sought, failure_message) {
			Y.assert(string_to_test.indexOf(substring_sought) >= 0,
				failure_message + " (string to test is '" + string_to_test + "')");
		},
		
		getTaskIDToTaskHash: function(task_array) {
			var task_hash = {};
			task_array.each(function(task) {
				task_hash[task.taskID] = task;
			});
			return task_hash;
		},
		
		getLocalIDToTaskHash: function(task_array) {
			var task_hash = {};
			task_array.each(function(task) {
				task_hash[task.localID] = task;
			});
			return task_hash;
		},
		
		captureMojoLog: function() {
			this._Mojo_Log_info = Mojo.Log.info;
			this._Mojo_Log_warn = Mojo.Log.warn;
			this._Mojo_Log_error = Mojo.Log.error;
			this._Mojo_Log_messages = "";
			var inst = this;
			Mojo.Log.info = function(msg) { inst._Mojo_Log_messages += "info: " + msg + "\n"; };
			Mojo.Log.warn = function(msg) { inst._Mojo_Log_messages += "warn: " + msg + "\n"; };
			Mojo.Log.error = function(msg) { inst._Mojo_Log_messages += "error: " + msg + "\n"; };
		},
		
		getMojoLog: function() {
			return this._Mojo_Log_messages;
		},
		
		restoreMojoLog: function() {
			Mojo.Log.info = this._Mojo_Log_info;
			Mojo.Log.warn = this._Mojo_Log_warn;
			Mojo.Log.error = this._Mojo_Log_error;
		},
		
		/**
		 * Perform a series of this.wait() tests (as per the YUI test framework).
		 * @param {Function} test  The test function.
		 * @param {Array} fns  An array of functions to execute, one at a time.
		 * @param {Number} millis  The number of milliseconds to wait between each item in fns.  
		 */
		waitInSeries: function(test, fns, millis) {
			test.wait(
				function() {
					fns[0]();
					fns.splice(0, 1);
					if (fns.length > 0) {
						TestUtils.waitInSeries(test, fns, millis);
					}
				},
				millis
			);
		}
	
	}
	
});

