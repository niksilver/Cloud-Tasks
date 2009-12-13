/**
 * Test the MD5 function
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testCreatesTimeline: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			
			rtm.connectionManager = "Some pretend connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('12345');
			
			var called_createTimeline = false;
			rtm.createTimeline = function() {
				called_createTimeline = true;
				rtm.timeline = '87654';
			}
			
			retrier.fire();
			Y.Assert.areEqual(true, called_createTimeline, "Timeline creation not attempted");
			
			called_createTimeline = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_createTimeline, "Timeline creation mistakenly attempted again");
		}

	});

} );