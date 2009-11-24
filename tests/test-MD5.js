/**
 * Test the MD5 function
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testMD5: function() {
			var md5 = MD5('hello');
			Y.Assert.areEqual('5d41402abc4b2a76b9719d911017c592', md5, "Bad MD5");
		}

	});

} );