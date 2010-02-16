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
		
		dumpMojoLog: function() {
			$('logDump').insert(TestUtils.getMojoLog());
		},
		
		restoreMojoLog: function() {
			Mojo.Log.info = this._Mojo_Log_info;
			Mojo.Log.warn = this._Mojo_Log_warn;
			Mojo.Log.error = this._Mojo_Log_error;
		},
		
		quickLog: function(str) {
			$('logDump').insert(str + '\n');
		},
		
		/**
		 * Perform a series of test parts, each of which will only move onto the next
		 * when test.continueRun() is called.
		 * @param {Function} test  The test function.
		 * @param {Number} millis  The number of milliseconds to wait before declaring
		 *     the series of tests a failure.
		 * @param {Array} fns  An array of functions to execute, one at a time.
		 *     Each one must call TestUtils.continueRun() to move onto the next in the series.
		 *     Even the last one must declare call TestUtils.continueRun() to declare that it's done.
		 */
		runInSeries: function(test, millis, fns) {
			var run_next_function = TestUtils.makeFunctionSeries(test, fns);
			setTimeout(run_next_function, 10);
			test.wait(millis + 10);
		},
		
		/**
		 * Used by TestUtils.runInSeries() to make a function which chains its series
		 * of functions.
		 * @param {Object} test  The test function.
		 * @param {Object} fns  The series of functions to call.
		 */
		makeFunctionSeries: function(test, fns) {
			var last_fns = fns.clone();
			var fn0 = last_fns.shift() || test.resume;
			var run = function() {
				TestUtils.continueRun = TestUtils.makeFunctionSeries(test, last_fns);
				fn0();
			};
			return run;
		},
		
		prettyPrint: function(obj) {
			if (typeof obj === 'string') {
				return "'" + obj + "'";
			}
			else if (typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'function') {
				return obj;
			}
			else if (obj instanceof Array) {
				var out = '[';
				for (var i = 0; i < obj.length; i++) {
					if (i > 0) { out += ", " }
					out = out + TestUtils.prettyPrint(obj[i]);
				}
				return out + ']';
			}
			else {
				var out = '{';
				var had_property = false;
				for (var prop in obj) {
					out = out + prop + ": " + TestUtils.prettyPrint(obj[prop]) + ", ";
					had_property = true;
				}
				if (had_property) {
					out = out.substr(0, out.length-2);
				}
				return out + '}';
			}
		}
	
	}
	
});

