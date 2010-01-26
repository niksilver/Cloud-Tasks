// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model's saving, loading and removing capabilities.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({
		
		testLocalID: function() {
			var task1 = new TaskModel();
			var task2 = new TaskModel();
			var task3 = new TaskModel();
			
			Y.Assert.areNotEqual(task1.localID, task2.localID, "Tasks 1 and 2 should have different local IDs");
			Y.Assert.areNotEqual(task2.localID, task3.localID, "Tasks 2 and 3 should have different local IDs");
			Y.Assert.areNotEqual(task1.localID, task3.localID, "Tasks 1 and 3 should have different local IDs");
		}

	});

} );