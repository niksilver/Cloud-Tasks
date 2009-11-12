testCases.push( function(Y) {

	return new Y.Test.Case({
		
		testTaskListAssistantExists: function() {
			Y.Assert.isNotUndefined(TaskListAssistant);
		},
		
	});

} );
