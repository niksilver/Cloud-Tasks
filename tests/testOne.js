testCases.push( function(Y) {

			return new Y.Test.Case({
				testOne: function() {
					Y.Assert.areEqual(3, 1+2);
				},
				testTwo: function() {
					Y.Assert.areEqual("a", "" + "a", "Assert 1");
					Y.Assert.areEqual("b", "" + "b", "Assert 2");
				}
			});
	
} );