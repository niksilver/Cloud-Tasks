/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testConstructor: function() {
			var task = new TaskModel();
			Y.Assert.isNotUndefined(task, 'TaskModel constructor failed');
		}

	});

} );