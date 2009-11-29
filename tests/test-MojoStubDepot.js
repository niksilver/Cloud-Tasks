/**
 * Test the stub code for Mojo.Depot.
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;

	return new Y.Test.Case({

		addSynchronously: function(depot, key, value, assert_failure_msg) {
			var depot_add_returned = false;
			depot.add(key, value,
				function() {
					depot_add_returned = true;
				},
				null
			);
			this.wait(
				function() {
					Y.assert(depot_add_returned, assert_failure_msg);
				},
				WAIT_TIMEOUT
			);
		},

		testDepotConstructor: function() {
			var depot = new Mojo.Depot({ name: 'test_db' });
			Y.Assert.isNotUndefined(depot, "Depot can't be constructed");
		},
		
		testDepotConstructsDifferentDatabases: function() {
			var depot1 = new Mojo.Depot({ name: 'dep1' });
			var depot2 = new Mojo.Depot({ name: 'dep2' });
			
			var depot1_add_returned = false;
			depot1.add('mykey', 'value1',
				function() {
					depot1_add_returned = true;
				},
				null
			);
			var depot2_add_returned = false;
			depot2.add('mykey', 'value2',
				function() {
					depot2_add_returned = true;
				},
				null
			);
			
			this.wait(
				function() {
					Y.assert(depot1_add_returned, "Depot1 add didn't return");
					Y.assert(depot2_add_returned, "Depot2 add didn't return");
				},
				WAIT_TIMEOUT
			);
			
			var depot1_value;
			depot1.get('mykey',
				function(value) {
					depot1_value = value;
				},
				null
			);
			var depot2_value;
			depot2.get('mykey',
				function(value) {
					depot2_value = value;
				},
				null
			);
			
			this.wait(
				function() {
					Y.Assert.areEqual(depot1_value, 'value1', "Got bad depot1 value");
					Y.Assert.areEqual(depot2_value, 'value2', "Got bad depot2 value");
				},
				WAIT_TIMEOUT
			);
		},
		
		testDepotCanHoldDifferentValues: function() {
			var depot = new Mojo.Depot({ name: 'mydep' });

			var depot_add1_returned = false;
			depot.add('mykey1', 'value1',
				function() {
					depot_add1_returned = true;
				},
				null
			);
			var depot_add2_returned = false;
			depot.add('mykey2', 'value2',
				function() {
					depot_add2_returned = true;
				},
				null
			);
			
			this.wait(
				function() {
					Y.assert(depot_add1_returned, "Depot add #1 didn't return");
					Y.assert(depot_add2_returned, "Depot add #2 didn't return");
				},
				WAIT_TIMEOUT
			);

			var depot_value1;
			depot.get('mykey1',
				function(value) {
					depot_value1 = value;
				},
				null
			);
			var depot_value2;
			depot.get('mykey2',
				function(value) {
					depot_value2 = value;
				},
				null
			);

			this.wait(
				function() {
					Y.Assert.areEqual(depot_value1, 'value1', "Got bad depot value1");
					Y.Assert.areEqual(depot_value2, 'value2', "Got bad depot value2");
				},
				WAIT_TIMEOUT
			);

		}
		
	})
});