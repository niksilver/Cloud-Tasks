testCases.push( function(Y) {

	return new Y.Test.Case({
		
		testMojoDefined: function() {
			Y.Assert.isNotUndefined(Mojo, "Test 1");
			Y.Assert.isNotUndefined(Mojo.Log, "Test 2");
		},
		
		testFeedListAssistantExists: function() {
			Y.Assert.isNotUndefined(FeedListAssistant);
		},
		
		testFeedListIsSetUp: function() {
			var mockAssistant = Y.Mock(new FeedListAssistant());
			Y.Mock.expect(mockAssistant, {
				method: "setUpFeedList"
			});
			mockAssistant.setup();
			Y.Mock.verify(mockAssistant);
		}
	});

} );