// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

testCases.push( function(Y) {

	return new Y.Test.Case({
		
		testTaskListAssistantExists: function() {
			Y.Assert.isNotUndefined(TaskListAssistant);
		},
		
	});

} );
