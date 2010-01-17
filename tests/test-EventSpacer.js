// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the class which spaces out events.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testSpacer: function() {
			var spacer = new EventSpacer(100);
			
			Y.Assert.areEqual(true, spacer.isReady(), "Spacer should be ready for event after initialisation");
			
			spacer.haveFired();
			Y.Assert.areEqual(false, spacer.isReady(), "Spacer should not be ready right after firing");
			this.wait(function() {
					Y.Assert.areEqual(true, spacer.isReady(), "Spacer should be ready following firing and then a pause");
				},
				120);
				
			spacer.haveFired();
			Y.Assert.areEqual(false, spacer.isReady(), "Spacer should not be ready right after second firing");
			this.wait(function() {
					Y.Assert.areEqual(true, spacer.isReady(), "Spacer should be ready following second firing and then a pause");
				},
				120);
		}

	});

} );